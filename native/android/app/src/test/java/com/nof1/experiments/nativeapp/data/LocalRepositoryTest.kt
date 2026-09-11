package com.nof1.experiments.nativeapp.data

import java.io.File
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

@OptIn(ExperimentalCoroutinesApi::class)
class LocalRepositoryTest {
    @get:Rule val temporary = TemporaryFolder()

    private fun repository(identity: String = "person", directory: File = temporary.root) =
        LocalRepository(directory, identity) { TEST_DATE }

    @Test fun firstLoadDistinguishesLoadingFromEmptyAndPersistsByIdentity() = runTest {
        val repository = repository()
        val states = repository.experiments.asLoadStates().take(2).toList()
        assertEquals(LoadState.Loading, states.first())
        assertEquals(LoadState.Ready(emptyList<Experiment>()), states.last())
        repository.mutate(Api.createExperiment(experimentInput()))
        assertEquals("Energy trial", repository().experiments.first().getOrThrow().single().name)
        assertTrue(repository("another/person").experiments.first().getOrThrow().isEmpty())
        val file = temporary.root.listFiles()!!.single()
        assertTrue(file.name.matches(Regex("[a-f0-9]{64}\\.json")))
        assertFalse(file.name.contains("person"))
        assertFalse(repository.billing.first().getOrThrow().hasPlus)
    }

    @Test fun experimentLifecycleEntriesAndPartialScheduleUpdatesPersist() = runTest {
        val repository = repository()
        repository.mutate(Api.createExperiment(experimentInput()))
        repository.mutate(Api.addEntry("arbitrary-id", entry()))
        repository.mutate(Api.updateExperiment("arbitrary-id", mapOf("schedule" to mapOf("phaseDurationDays" to 3))))
        val updated = repository.experiments.first().getOrThrow().single()
        assertEquals(3.0, updated.schedule.phaseDurationDays, 0.0)
        assertEquals(TEST_DATE, updated.schedule.startDate)
        assertEquals(1, updated.entries.size)
        repository.mutate(Api.updateExperimentStatus(updated.id, "paused"))
        assertEquals("paused", repository.experiments.first().getOrThrow().single().status)
        repository.mutate(Api.deleteExperiment(updated.id))
        assertTrue(repository().experiments.first().getOrThrow().isEmpty())
        assertTrue(runCatching { repository.mutate(Api.deleteExperiment(updated.id)) }.isFailure)
    }

    @Test fun freeCapacityCountsDraftPausedAndActiveButNotCompletedOrCancelled() = runTest {
        val repository = repository()
        repository.mutate(Api.createExperiment(experimentInput("first").copy(status = "draft")))
        assertTrue(runCatching { repository.mutate(Api.createExperiment(experimentInput("second"))) }.isFailure)
        repository.mutate(Api.updateExperimentStatus("first", "paused"))
        assertTrue(runCatching { repository.mutate(Api.createExperiment(experimentInput("second"))) }.isFailure)
        repository.mutate(Api.updateExperimentStatus("first", "completed"))
        repository.mutate(Api.createExperiment(experimentInput("second")))
        assertTrue(runCatching { repository.mutate(Api.updateExperimentStatus("first", "active")) }.isFailure)
        repository.mutate(Api.updateExperimentStatus("second", "cancelled"))
        repository.mutate(Api.updateExperimentStatus("first", "active"))
        assertEquals(2, repository.experiments.first().getOrThrow().size)
    }

    @Test fun protocolAdherenceReplacesSameUtcDateRatherThanDuplicating() = runTest {
        val repository = repository()
        repository.mutate(Api.createProtocol(ProtocolInput("Daily", "Custom", "1 mg", TEST_DATE, id = "p")))
        repository.mutate(Api.updateProtocol("p", mapOf("dosage" to "2 mg")))
        repository.mutate(Api.logAdherence("p", AdherenceEntry("2026-01-01", true)))
        repository.mutate(Api.logAdherence("p", AdherenceEntry("2026-01-01", false, true)))
        repository.mutate(Api.toggleProtocol("p"))
        val protocol = repository().protocols.first().getOrThrow().single()
        assertEquals("2 mg", protocol.dosage)
        assertEquals(1, protocol.adherence.size)
        assertTrue(protocol.adherence.single().skipped == true)
        assertFalse(protocol.isActive)
        repository.mutate(Api.deleteProtocol("p"))
        assertTrue(repository.protocols.first().getOrThrow().isEmpty())
    }

    @Test fun trackingPersistsSortsAndSupportsStackUpsertToggleAndDeletion() = runTest {
        val repository = repository()
        repository.mutate(Api.logDose(DoseInput("Custom", "1 mg", timestamp = "2026-01-01T02:00:00+02:00", id = "d1")))
        repository.mutate(Api.logDose(DoseInput("Custom", "2 mg", timestamp = "2026-01-02T00:00:00Z", id = "d2")))
        repository.mutate(Api.logMetric(MetricInput("energy", 7.0, id = "m")))
        repository.mutate(Api.addToStack(StackInput("Custom", "1 mg", id = "s")))
        repository.mutate(Api.addToStack(StackInput("Custom", "2 mg", id = "s")))
        repository.mutate(Api.toggleStackItem("s"))
        assertEquals(listOf("d2", "d1"), repository().doses.first().getOrThrow().map { it.id })
        assertEquals(TEST_DATE, repository.doses.first().getOrThrow().last().timestamp)
        assertEquals(7.0, repository().metrics.first().getOrThrow().single().value, 0.0)
        assertFalse(repository().stack.first().getOrThrow().single().isActive)
        assertEquals("2 mg", repository.stack.first().getOrThrow().single().dosage)
        repository.mutate(Api.deleteDose("d1"))
        repository.mutate(Api.deleteDose("d2"))
        repository.mutate(Api.deleteMetric("m"))
        repository.mutate(Api.removeFromStack("s"))
        assertTrue(repository().doses.first().getOrThrow().isEmpty())
        assertTrue(repository().metrics.first().getOrThrow().isEmpty())
        assertTrue(repository().stack.first().getOrThrow().isEmpty())
    }

    @Test fun observedChangesArriveOnlyAfterSuccessfulWrites() = runTest {
        val repository = repository()
        val subscribed = CompletableDeferred<Unit>()
        val received = async(UnconfinedTestDispatcher(testScheduler)) {
            repository.doses.onEach { subscribed.complete(Unit) }.take(2).toList()
        }
        subscribed.await()
        repository.mutate(Api.logDose(DoseInput("Custom", "1 mg")))
        val changes = received.await()
        assertTrue(changes.first().getOrThrow().isEmpty())
        assertEquals(1, changes.last().getOrThrow().size)
    }

    @Test fun corruptStorageEmitsFailureAndIsNeverOverwrittenAsEmpty() = runTest {
        val repository = repository()
        repository.mutate(Api.logDose(DoseInput("Custom", "1 mg")))
        val file = temporary.root.listFiles()!!.single()
        file.writeText("corrupt")
        val reopened = repository()
        assertTrue(reopened.doses.first().isFailure)
        assertTrue(runCatching { reopened.mutate(Api.logDose(DoseInput("Custom", "2 mg"))) }.isFailure)
        assertEquals("corrupt", file.readText())
    }

    @Test fun siblingInstancesShareUpdatesAndSerializeWritesWithoutLosingData() = runTest {
        val first = repository()
        val second = repository()
        val subscribed = CompletableDeferred<Unit>()
        val observed = async(UnconfinedTestDispatcher(testScheduler)) {
            first.doses.onEach { subscribed.complete(Unit) }.take(2).toList()
        }
        subscribed.await()
        second.mutate(Api.logDose(DoseInput("Custom", "1 mg", id = "first")))
        assertEquals("first", observed.await().last().getOrThrow().single().id)
        listOf(
            async { first.mutate(Api.logDose(DoseInput("Custom", "2 mg", id = "second"))) },
            async { second.mutate(Api.logDose(DoseInput("Custom", "3 mg", id = "third"))) },
        ).awaitAll()
        assertEquals(setOf("first", "second", "third"), first.doses.first().getOrThrow().map { it.id }.toSet())
        assertEquals(first.doses.first().getOrThrow(), second.doses.first().getOrThrow())
    }

    @Test fun incompleteOrWrongIdentitySnapshotsFailClosed() = runTest {
        val repository = repository()
        repository.mutate(Api.logDose(DoseInput("Custom", "1 mg")))
        val file = temporary.root.listFiles()!!.single()
        val original = file.readText()
        file.writeText("{}")
        assertTrue(repository().doses.first().isFailure)
        file.writeText(original.replace("\"userId\":\"person\"", "\"userId\":\"another\""))
        assertTrue(repository().doses.first().isFailure)
    }

    @Test fun diskFailureNeverReportsSuccessfulMutationOrEmptyData() = runTest {
        val directory = temporary.newFile("not-a-directory")
        val repository = repository(directory = directory)
        assertTrue(runCatching { repository.mutate(Api.logDose(DoseInput("Custom", "1 mg"))) }.isFailure)
        assertTrue(repository.doses.first().isFailure)
    }

    @Test fun inventedEndpointsAndIncorrectWrappersFailWithoutChangingData() = runTest {
        val repository = repository()
        assertTrue(runCatching { repository.mutate("tracking:updateDose", mapOf("id" to "d")) }.isFailure)
        assertTrue(runCatching { repository.mutate("tracking:logDose", mapOf("input" to emptyMap<String, Any?>())) }.isFailure)
        assertTrue(repository.doses.first().getOrThrow().isEmpty())
    }
}

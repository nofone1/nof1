package com.nof1.experiments.nativeapp.experiments

import com.nof1.experiments.nativeapp.Nof1ViewModel
import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.data.Dose
import com.nof1.experiments.nativeapp.data.Experiment
import com.nof1.experiments.nativeapp.data.Metric
import com.nof1.experiments.nativeapp.data.PlusAccess
import com.nof1.experiments.nativeapp.data.Protocol
import com.nof1.experiments.nativeapp.data.Repository
import com.nof1.experiments.nativeapp.data.StackItem
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class ExperimentSubmissionTest {
    @Before fun setUp() { Dispatchers.setMain(UnconfinedTestDispatcher()) }
    @After fun tearDown() { Dispatchers.resetMain() }

    @Test fun completionWaitsForConfirmedWriteAndDuplicateTapIsIgnored() = runTest {
        val gate = CompletableDeferred<Unit>()
        val repository = SubmissionRepository { gate.await() }
        val vm = Nof1ViewModel(repository, "synthetic-test-user", true)
        var saved = 0
        val call = { Api.createExperiment(experimentInput("Trial", "Hypothesis", "Custom", "dose", "daily", false, "7", "4")) }
        vm.submit(call) { saved++ }
        assertTrue(vm.busy.value)
        assertEquals(0, saved)
        assertEquals(1, repository.writes)
        vm.submit(call) { saved++ }
        assertEquals(1, repository.writes)
        gate.complete(Unit)
        assertFalse(vm.busy.value)
        assertEquals(1, saved)
    }

    @Test fun failedWriteDoesNotNavigateOrClaimSuccess() = runTest {
        val vm = Nof1ViewModel(SubmissionRepository { throw IllegalStateException("synthetic failure") }, "synthetic-test-user", true)
        var saved = false
        vm.submit({ Api.updateExperimentStatus("experiment", "paused") }) { saved = true }
        assertFalse(saved)
        assertFalse(vm.busy.value)
        assertTrue(vm.message.value.orEmpty().contains("could not be confirmed"))
    }

    @Test fun invalidFormReportsErrorWithoutCallingRepository() = runTest {
        val repository = SubmissionRepository {}
        val vm = Nof1ViewModel(repository, "synthetic-test-user", true)
        var saved = false
        vm.submit({ Api.createExperiment(experimentInput("", "Hypothesis", "Custom", "dose", "daily", false, "7", "4")) }) { saved = true }
        assertFalse(saved)
        assertFalse(vm.busy.value)
        assertEquals(0, repository.writes)
        assertEquals("Please enter an experiment name", vm.message.value)
    }

    private class SubmissionRepository(private val write: suspend () -> Unit) : Repository {
        var writes = 0
        override val experiments = flowOf(Result.success(emptyList<Experiment>()))
        override val protocols = flowOf(Result.success(emptyList<Protocol>()))
        override val doses = flowOf(Result.success(emptyList<Dose>()))
        override val metrics = flowOf(Result.success(emptyList<Metric>()))
        override val stack = flowOf(Result.success(emptyList<StackItem>()))
        override val billing = flowOf(Result.success(PlusAccess(hasPlus = false, sources = emptyList(), inGracePeriod = false, hasMultipleActiveProviders = false)))
        override suspend fun mutate(path: String, args: Map<String, Any?>) { writes++; write() }
    }
}

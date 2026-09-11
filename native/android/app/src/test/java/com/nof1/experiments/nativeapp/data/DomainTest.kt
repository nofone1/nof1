package com.nof1.experiments.nativeapp.data

import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

internal const val TEST_DATE = "2026-01-01T00:00:00.000Z"

internal fun experimentInput(id: String = "arbitrary-id") = ExperimentInput(
    name = "Energy trial",
    hypothesis = "Energy improves",
    intervention = Intervention("intervention", "Custom", dosage = "1 capsule"),
    metrics = listOf(ExperimentMetric("energy", "Energy", minValue = 1.0, maxValue = 10.0)),
    schedule = ExperimentSchedule(TEST_DATE),
    id = id,
)

internal fun experiment(entries: List<ExperimentEntry> = emptyList()) = experimentInput().let {
    Experiment(it.id, "person", it.name, it.hypothesis, it.intervention, it.metrics, it.schedule,
        it.status, entries, TEST_DATE, TEST_DATE)
}

internal fun entry(value: JsonPrimitive = JsonPrimitive(5.0), date: String = TEST_DATE) = ExperimentEntry(
    "entry", "arbitrary-id", date, true, listOf(MetricValue("energy", value)), createdAt = date,
)

class DomainTest {
    @Test fun progressUsesEntryCountAndBothOnOffPhases() {
        assertEquals(0, Domain.progressPercent(experiment()))
        assertEquals(13, Domain.progressPercent(experiment(List(7) { entry() })))
        assertEquals(100, Domain.progressPercent(experiment(List(100) { entry() })))
    }

    @Test fun phasesAlternateAndStopAtFullCycleCount() {
        val schedule = ExperimentSchedule(TEST_DATE, phaseDurationDays = 2.0, totalPhases = 2.0)
        assertTrue(Domain.phase(schedule, TEST_DATE).isIntervention)
        assertEquals(2, Domain.phase(schedule, "2026-01-02T00:00:00Z").dayInPhase)
        val off = Domain.phase(schedule, "2026-01-03T00:00:00Z")
        assertEquals(2, off.phaseNumber)
        assertFalse(off.isIntervention)
        assertEquals(4, Domain.phase(schedule, "2026-01-09T00:00:00Z").phaseNumber)
        assertTrue(Domain.phase(schedule, "2026-01-09T00:00:00Z").hasEnded)
        assertFalse(Domain.phase(schedule, "2025-12-31T23:59:59Z").hasStarted)
    }

    @Test fun dateBucketsAreUtcAndTimestampsAreCanonical() {
        assertEquals("2025-12-31", Domain.utcDate("2026-01-01T00:30:00+02:00"))
        assertEquals(TEST_DATE, Domain.iso("2026-01-01T02:00:00+02:00"))
        assertThrows(Exception::class.java) { Domain.utcDate("bad-date") }
    }

    @Test fun rejectsInvalidSchedulesAndRequiredFields() {
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(ExperimentSchedule(TEST_DATE, 0.0)) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(ExperimentSchedule(TEST_DATE, 1.5)) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(ExperimentSchedule(TEST_DATE, Double.NaN)) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(experimentInput().copy(name = " ")) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(experimentInput().copy(hypothesis = "")) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(DoseInput("", "1 mg")) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(ProtocolInput("", "Custom", "1 mg", TEST_DATE)) }
    }

    @Test fun validatesMetricTypesAndBounds() {
        val metrics = experimentInput().metrics
        Domain.validate(entry(JsonPrimitive(1.0)), metrics)
        Domain.validate(entry(JsonPrimitive(10.0)), metrics)
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(entry(JsonPrimitive(11.0)), metrics) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(entry(JsonPrimitive("5")), metrics) }
        val booleanMetric = listOf(ExperimentMetric("energy", "Did it help?", type = "boolean"))
        Domain.validate(entry(JsonPrimitive(true)), booleanMetric)
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(entry(JsonPrimitive("true")), booleanMetric) }
        Domain.validate(entry(JsonPrimitive("Notes")), listOf(ExperimentMetric("energy", "Notes", type = "text")))
    }

    @Test fun quickRatingsAreFiniteAndInRange() {
        Domain.validate(MetricInput("energy", 10.0))
        Domain.validate(MetricInput("weight", 75.0, numericValue = 75.0))
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(MetricInput("energy", Double.NaN)) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(MetricInput("energy", 11.0)) }
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(MetricInput("weight", -1.0)) }
    }

    @Test fun capacityIncludesDraftActiveAndPausedOnly() {
        listOf("draft", "active", "paused").forEach { assertTrue(Domain.isInProgress(it)) }
        listOf("completed", "cancelled", "unknown").forEach { assertFalse(Domain.isInProgress(it)) }
    }

    @Test fun adherenceRejectsImpossibleStatesAndCountsAllLogs() {
        assertThrows(IllegalArgumentException::class.java) { Domain.validate(AdherenceEntry("2026-01-01", true, true)) }
        val protocol = Protocol("p", "person", "Daily", peptideName = "Custom", dosage = "1 mg",
            frequency = "Once daily", route = "Oral", cycleDuration = "4 weeks", startDate = TEST_DATE,
            isActive = true, createdAt = TEST_DATE)
        assertEquals(0, Domain.adherencePercent(protocol))
        assertEquals(33, Domain.adherencePercent(protocol.copy(adherence = listOf(
            AdherenceEntry("2026-01-01", true), AdherenceEntry("2026-01-02", false, true),
            AdherenceEntry("2026-01-03", false),
        ))))
    }
}

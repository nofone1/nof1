package com.nof1.experiments.nativeapp.experiments

import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.data.DataJson
import com.nof1.experiments.nativeapp.data.Experiment
import com.nof1.experiments.nativeapp.data.ExperimentMetric
import com.nof1.experiments.nativeapp.data.ExperimentSchedule
import com.nof1.experiments.nativeapp.data.Intervention
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class ExperimentFormsTest {
    private val experiment = Experiment(
        id = "arbitrary-experiment-id",
        userId = "synthetic-test-user",
        name = "Synthetic trial",
        hypothesis = "Observe energy",
        intervention = Intervention("i", "Synthetic intervention", dosage = "test dose"),
        metrics = listOf(
            ExperimentMetric("scale", "Energy", "scale", minValue = 1.0, maxValue = 10.0),
            ExperimentMetric("number", "Sleep hours", "number", minValue = 0.0, maxValue = 24.0, unit = "hours"),
            ExperimentMetric("boolean", "Exercise", "boolean"),
            ExperimentMetric("text", "Observation", "text"),
        ),
        schedule = ExperimentSchedule("2026-01-01T00:00:00Z"),
        status = "active",
        createdAt = "2026-01-01T00:00:00Z",
        updatedAt = "2026-01-01T00:00:00Z",
    )
    private val values = mapOf("scale" to "7", "number" to "7.5", "boolean" to "false", "text" to "Rested")

    @Test fun sourceDefaultsArePreservedWithoutFakeReminderScheduling() {
        val input = experimentInput(" Trial ", " Hypothesis ", " Custom ", " dose ", "Once daily", false, "7", "4")
        assertEquals("Trial", input.name)
        assertEquals("supplement", input.intervention.type)
        assertEquals(7.0, input.schedule.phaseDurationDays, 0.0)
        assertEquals(4.0, input.schedule.totalPhases, 0.0)
        assertEquals("Energy Level", input.metrics.single().name)
        assertEquals(1.0, input.metrics.single().minValue!!, 0.0)
        assertEquals(10.0, input.metrics.single().maxValue!!, 0.0)
        val payload = Api.createExperiment(input).args["input"] as Map<*, *>
        assertFalse((payload["schedule"] as Map<*, *>).containsKey("reminderTime"))
        assertFalse(payload.containsKey("userId"))
    }

    @Test fun selectedCatalogItemIsPeptideWithoutInventingDoseOrFrequency() {
        val input = experimentInput("Trial", "Hypothesis", "Catalog selection", "explicit dose", "", true, "7", "4")
        assertEquals("peptide", input.intervention.type)
        assertEquals("explicit dose", input.intervention.dosage)
        assertEquals("", input.intervention.frequency)
    }

    @Test fun invalidScheduleDoesNotSilentlyFallBackToDefaults() {
        listOf("", "0", "-1", "7.5", "NaN", "2147483648").forEach { value ->
            assertThrows(IllegalArgumentException::class.java) { experimentInput("Trial", "Hypothesis", "Test", "dose", "daily", false, value, "4") }
            assertThrows(IllegalArgumentException::class.java) { experimentInput("Trial", "Hypothesis", "Test", "dose", "daily", false, "7", value) }
        }
    }

    @Test fun entryIncludesTypedValuesAndRealAddEntryPayload() {
        val entry = experimentEntry(experiment, "2026-01-02", false, values, " note ")
        assertEquals("2026-01-02T00:00:00Z", entry.date)
        assertEquals("note", entry.notes)
        assertFalse(entry.isInterventionDay)
        assertEquals(7.0, entry.metricValues[0].value.doubleOrNull!!, 0.0)
        assertEquals(7.5, entry.metricValues[1].value.doubleOrNull!!, 0.0)
        assertEquals(false, entry.metricValues[2].value.booleanOrNull)
        assertTrue(entry.metricValues[3].value.isString)
        val call = Api.addEntry(experiment.id, entry)
        assertEquals("experiments:addEntry", call.path)
        assertEquals(experiment.id, call.args["experimentId"])
        assertEquals(4, ((call.args["entry"] as Map<*, *>)["metricValues"] as List<*>).size)
        assertEquals(entry, DataJson.decodeFromString<com.nof1.experiments.nativeapp.data.ExperimentEntry>(DataJson.encodeToString(com.nof1.experiments.nativeapp.data.ExperimentEntry.serializer(), entry)))
    }

    @Test fun invalidMetricValuesCannotBeSubmitted() {
        listOf("", "0", "11", "NaN", "Infinity", "not a number").forEach { invalid ->
            assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment, "2026-01-02", true, values + ("scale" to invalid), "") }
        }
        assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment, "2026-01-02", true, values - "boolean", "") }
        assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment, "2026-01-02", true, values + ("boolean" to "yes"), "") }
        assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment, "2026-01-02", true, values + ("number" to "25"), "") }
        assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment, "2026-01-02", true, values + ("text" to " "), "") }
    }

    @Test fun invalidDateFutureDateAndEndedExperimentCannotBeLogged() {
        listOf("2026-02-30", "bad", "2999-01-01").forEach { date ->
            assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment, date, true, values, "") }
        }
        assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment.copy(status = "completed"), "2026-01-02", true, values, "") }
        assertEquals(4, experimentEntry(experiment.copy(status = "paused"), "2026-01-02", true, values, "").metricValues.size)
    }

    @Test fun emptyExperimentRequiresAnActualObservation() {
        assertThrows(IllegalArgumentException::class.java) { experimentEntry(experiment.copy(metrics = emptyList()), "2026-01-02", true, emptyMap(), "") }
        assertEquals("Observed", experimentEntry(experiment.copy(metrics = emptyList()), "2026-01-02", true, emptyMap(), "Observed").notes)
    }
}

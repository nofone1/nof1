package com.nof1.experiments.nativeapp.data

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class ApiTest {
    @Test fun buildersUseExactBackendNamesAndWrapperKeys() {
        val calls = listOf(
            Api.createExperiment(experimentInput()) to ("experiments:create" to setOf("input")),
            Api.updateExperiment("e", mapOf("name" to "Updated")) to ("experiments:update" to setOf("id", "updates")),
            Api.deleteExperiment("e") to ("experiments:remove" to setOf("id")),
            Api.addEntry("e", entry()) to ("experiments:addEntry" to setOf("experimentId", "entry")),
            Api.createProtocol(ProtocolInput("Daily", "Custom", "1 mg", TEST_DATE)) to ("protocols:create" to setOf("input")),
            Api.updateProtocol("p", mapOf("name" to "Updated")) to ("protocols:update" to setOf("id", "updates")),
            Api.deleteProtocol("p") to ("protocols:remove" to setOf("id")),
            Api.toggleProtocol("p") to ("protocols:toggleActive" to setOf("id")),
            Api.logAdherence("p", AdherenceEntry("2026-01-01", true)) to ("protocols:logAdherence" to setOf("protocolId", "entry")),
            Api.logDose(DoseInput("Custom", "1 mg")) to ("tracking:logDose" to setOf("entry")),
            Api.logMetric(MetricInput("energy", 5.0)) to ("tracking:logMetric" to setOf("entry")),
            Api.addToStack(StackInput("Custom", "1 mg")) to ("tracking:addToStack" to setOf("input")),
            Api.toggleStackItem("s") to ("tracking:toggleStackItem" to setOf("id")),
            Api.deleteDose("d") to ("tracking:deleteDose" to setOf("id")),
            Api.deleteMetric("m") to ("tracking:deleteMetric" to setOf("id")),
            Api.removeFromStack("s") to ("tracking:removeFromStack" to setOf("id")),
            Api.refreshAccess() to ("billing:refreshAccess" to emptySet()),
        )
        calls.forEach { (call, expected) ->
            assertEquals(expected.first, call.path)
            assertEquals(expected.second, call.args.keys)
        }
    }

    @Test fun nullPeptidesAreExplicitOnlyWhereBackendAllowsNull() {
        val dose = Api.logDose(DoseInput("Custom", "1 mg")).args["entry"] as Map<*, *>
        val stack = Api.addToStack(StackInput("Custom", "1 mg")).args["input"] as Map<*, *>
        val protocol = Api.createProtocol(ProtocolInput("Daily", "Custom", "1 mg", TEST_DATE)).args["input"] as Map<*, *>
        assertTrue(dose.containsKey("peptideId"))
        assertNull(dose["peptideId"])
        assertTrue(stack.containsKey("peptideId"))
        assertFalse(protocol.containsKey("peptideId"))
        assertFalse(dose.containsKey("notes"))
        assertFalse(dose.containsKey("userId"))
    }

    @Test fun nestedNumbersUseDoubleAndNeverBigInt() {
        val values = normalizeArguments(mapOf("input" to mapOf("integer" to 7, "long" to 4L,
            "values" to listOf(1, 2L, 3.5, JsonPrimitive(4)))))
        val input = values["input"] as Map<*, *>
        assertEquals(7.0, input["integer"])
        assertEquals(4.0, input["long"])
        assertEquals(listOf(1.0, 2.0, 3.5, 4.0), input["values"])
        assertThrows(IllegalArgumentException::class.java) { normalizeArguments(mapOf("value" to Long.MAX_VALUE)) }
        assertThrows(IllegalArgumentException::class.java) { normalizeArguments(mapOf("value" to Double.POSITIVE_INFINITY)) }
        assertThrows(IllegalArgumentException::class.java) { normalizeArguments(mapOf("value" to Any())) }
    }

    @Test fun polymorphicMetricValuesRoundTripWithoutStringifyingNumbersOrBooleans() {
        val values = listOf(JsonPrimitive(4.5), JsonPrimitive(false), JsonPrimitive("text"))
        values.forEach { value ->
            val original = entry(value)
            assertEquals(original, DataJson.decodeFromString<ExperimentEntry>(DataJson.encodeToString(original)))
        }
        assertEquals(4.5, payload(entry(values[0])).let { (it["metricValues"] as List<*>)[0] }.let { (it as Map<*, *>)["value"] })
    }

    @Test fun serverOwnedIdentityFieldsCannotBeUpdated() {
        assertThrows(IllegalArgumentException::class.java) { Api.updateExperiment("e", mapOf("userId" to "other")) }
        assertThrows(IllegalArgumentException::class.java) { Api.updateProtocol("p", mapOf("id" to "other")) }
        assertEquals("custom:id", Api.deleteDose("custom:id").args["id"])
    }

    @Test fun backendResponsesAllowUnknownFieldsAndDecodeNumbersAsDouble() {
        val response = """{"id":"x","userId":"u","metricType":"energy","value":5,"timestamp":"$TEST_DATE","futureField":true}"""
        val metric = DataJson.decodeFromString<Metric>(response)
        assertEquals(5.0, metric.value, 0.0)
        assertEquals("u", metric.userId)
    }
}

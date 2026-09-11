package com.nof1.experiments.nativeapp.data

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull

@OptIn(ExperimentalSerializationApi::class)
val DataJson = Json {
    ignoreUnknownKeys = true
    encodeDefaults = true
    explicitNulls = false
}

inline fun <reified T> payload(value: T): Map<String, Any?> =
    (DataJson.parseToJsonElement(DataJson.encodeToString(value)) as JsonObject)
        .mapValues { (_, element) -> element.toPayloadValue() }

fun JsonElement.toPayloadValue(): Any? = when (this) {
    JsonNull -> null
    is JsonObject -> mapValues { (_, element) -> element.toPayloadValue() }
    is JsonArray -> map { it.toPayloadValue() }
    is JsonPrimitive -> when {
        isString -> content
        booleanOrNull != null -> booleanOrNull
        else -> doubleOrNull?.also { require(it.isFinite()) { "Numbers must be finite" } }
            ?: throw IllegalArgumentException("Unsupported JSON primitive")
    }
}

fun normalizeArguments(args: Map<String, Any?>): Map<String, Any?> =
    args.mapValues { (_, value) -> normalizeArgument(value) }

private fun normalizeArgument(value: Any?): Any? = when (value) {
    null, is String, is Boolean -> value
    is JsonElement -> value.toPayloadValue()
    is Number -> {
        if (value is Long) {
            require(value in -9_007_199_254_740_991L..9_007_199_254_740_991L) { "Integer exceeds Convex number precision" }
        }
        value.toDouble().also { require(it.isFinite()) { "Numbers must be finite" } }
    }
    is Map<*, *> -> value.entries.associate { (key, item) ->
        require(key is String) { "Argument object keys must be strings" }
        key to normalizeArgument(item)
    }
    is List<*> -> value.map { normalizeArgument(it) }
    else -> throw IllegalArgumentException("Arguments must contain only objects, lists, and JSON primitives")
}

internal fun argumentJson(value: Any?): JsonElement = when (value) {
    null -> JsonNull
    is String -> JsonPrimitive(value)
    is Boolean -> JsonPrimitive(value)
    is Double -> JsonPrimitive(value)
    is Map<*, *> -> JsonObject(value.entries.associate { (key, item) -> key as String to argumentJson(item) })
    is List<*> -> JsonArray(value.map { argumentJson(it) })
    else -> throw IllegalArgumentException("Arguments must be normalized first")
}

object Api {
    const val EXPERIMENTS = "experiments:list"
    const val PROTOCOLS = "protocols:list"
    const val TRACKING = "tracking:getAll"
    const val BILLING = "billing:getAccess"

    fun createExperiment(input: ExperimentInput): MutationCall {
        Domain.validate(input)
        return MutationCall("experiments:create", mapOf("input" to payload(input)))
    }

    fun updateExperiment(id: String, updates: Map<String, Any?>): MutationCall =
        update("experiments:update", id, updates)

    fun updateExperimentStatus(id: String, status: String): MutationCall {
        require(status in Domain.experimentStatuses) { "Unknown experiment status" }
        return updateExperiment(id, mapOf("status" to status))
    }

    fun deleteExperiment(id: String): MutationCall = byId("experiments:remove", id)

    fun addEntry(experimentId: String, entry: ExperimentEntry): MutationCall {
        Domain.validate(entry)
        return MutationCall(
            "experiments:addEntry",
            mapOf("experimentId" to experimentId, "entry" to payload(entry.copy(experimentId = experimentId))),
        )
    }

    fun createProtocol(input: ProtocolInput): MutationCall {
        Domain.validate(input)
        return MutationCall("protocols:create", mapOf("input" to payload(input)))
    }

    fun updateProtocol(id: String, updates: Map<String, Any?>): MutationCall =
        update("protocols:update", id, updates)

    fun deleteProtocol(id: String): MutationCall = byId("protocols:remove", id)

    fun toggleProtocol(id: String): MutationCall = byId("protocols:toggleActive", id)

    fun logAdherence(protocolId: String, entry: AdherenceEntry): MutationCall {
        Domain.validate(entry)
        return MutationCall("protocols:logAdherence", mapOf("protocolId" to protocolId, "entry" to payload(entry)))
    }

    fun logDose(input: DoseInput): MutationCall {
        Domain.validate(input)
        return MutationCall("tracking:logDose", mapOf("entry" to (payload(input) + ("peptideId" to input.peptideId))))
    }

    fun deleteDose(id: String): MutationCall = byId("tracking:deleteDose", id)

    fun logMetric(input: MetricInput): MutationCall {
        Domain.validate(input)
        return MutationCall("tracking:logMetric", mapOf("entry" to payload(input)))
    }

    fun deleteMetric(id: String): MutationCall = byId("tracking:deleteMetric", id)

    fun addToStack(input: StackInput): MutationCall {
        Domain.validate(input)
        return MutationCall("tracking:addToStack", mapOf("input" to (payload(input) + ("peptideId" to input.peptideId))))
    }

    fun toggleStackItem(id: String): MutationCall = byId("tracking:toggleStackItem", id)

    fun removeFromStack(id: String): MutationCall = byId("tracking:removeFromStack", id)

    fun refreshAccess(): MutationCall = MutationCall("billing:refreshAccess", emptyMap())

    private fun byId(path: String, id: String) = MutationCall(path, mapOf("id" to id))

    private fun update(path: String, id: String, updates: Map<String, Any?>): MutationCall {
        require(updates.keys.none { it in setOf("id", "userId", "createdAt") }) { "Identity and creation fields cannot be updated" }
        return MutationCall(path, mapOf("id" to id, "updates" to normalizeArguments(updates)))
    }
}

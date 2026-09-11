package com.nof1.experiments.nativeapp.data

import dev.convex.android.ConvexClient
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.jsonPrimitive

class CloudRepository(@PublishedApi internal val client: ConvexClient) : Repository {
    inline fun <reified T> observe(path: String, args: Map<String, Any?> = emptyMap()): Flow<Result<T>> =
        client.subscribe<JsonElement>(path, normalizeArguments(args))
            .map { result -> result.mapCatching { DataJson.decodeFromJsonElement<T>(it) } }
            .catch { emit(Result.failure(it)) }

    suspend inline fun <reified T> query(path: String, args: Map<String, Any?> = emptyMap()): T =
        observe<T>(path, args).first().getOrThrow()

    suspend inline fun <reified T> mutation(path: String, args: Map<String, Any?> = emptyMap()): T =
        client.mutation<T>(path, normalizeArguments(args))

    suspend inline fun <reified T> action(path: String, args: Map<String, Any?> = emptyMap()): T =
        client.action<T>(path, normalizeArguments(args))

    override val experiments: Flow<Result<List<Experiment>>> = observe(Api.EXPERIMENTS)
    override val protocols: Flow<Result<List<Protocol>>> = observe(Api.PROTOCOLS)
    val tracking: Flow<Result<TrackingData>> = observe(Api.TRACKING)
    override val doses: Flow<Result<List<Dose>>> = tracking.map { it.map { data -> data.doses } }
    override val metrics: Flow<Result<List<Metric>>> = tracking.map { it.map { data -> data.metrics } }
    override val stack: Flow<Result<List<StackItem>>> = tracking.map { it.map { data -> data.stack } }
    override val billing: Flow<Result<PlusAccess>> = observe(Api.BILLING)

    override suspend fun mutate(path: String, args: Map<String, Any?>) {
        val response = mutation<JsonElement>(path, args)
        if (response is JsonObject && response["success"]?.jsonPrimitive?.booleanOrNull == false) {
            throw NoSuchElementException("The requested record no longer exists")
        }
    }
}

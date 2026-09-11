package com.nof1.experiments.nativeapp.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart

interface Repository {
    val experiments: Flow<Result<List<Experiment>>>
    val protocols: Flow<Result<List<Protocol>>>
    val doses: Flow<Result<List<Dose>>>
    val metrics: Flow<Result<List<Metric>>>
    val stack: Flow<Result<List<StackItem>>>
    val billing: Flow<Result<PlusAccess>>

    suspend fun mutate(path: String, args: Map<String, Any?> = emptyMap())
}

data class MutationCall(val path: String, val args: Map<String, Any?>)

suspend fun Repository.mutate(call: MutationCall) = mutate(call.path, call.args)

sealed interface LoadState<out T> {
    data object Loading : LoadState<Nothing>
    data class Ready<T>(val value: T) : LoadState<T>
    data class Failed(val error: Throwable) : LoadState<Nothing>
}

fun <T> Flow<Result<T>>.asLoadStates(): Flow<LoadState<T>> =
    map { result ->
        result.fold(
            onSuccess = { LoadState.Ready(it) },
            onFailure = { LoadState.Failed(it) },
        )
    }.onStart { emit(LoadState.Loading) }.catch { emit(LoadState.Failed(it)) }

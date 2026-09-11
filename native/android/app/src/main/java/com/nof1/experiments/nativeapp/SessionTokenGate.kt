package com.nof1.experiments.nativeapp

class SessionTokenGate(
    private val userId: String,
    private val sessionId: String,
    private val current: () -> Pair<String?, String?>,
) {
    @Volatile private var retired = false

    fun retire() { retired = true }

    fun isCurrent(): Boolean = !retired && current() == (userId to sessionId)

    suspend fun token(fetch: suspend () -> Result<String>): Result<String> {
        if (!isCurrent()) return Result.failure(IllegalStateException("The active account changed"))
        val result = fetch()
        if (!isCurrent()) return Result.failure(IllegalStateException("The active account changed"))
        return result
    }
}

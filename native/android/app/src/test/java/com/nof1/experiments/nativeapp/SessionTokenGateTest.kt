package com.nof1.experiments.nativeapp

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.async
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Test

class SessionTokenGateTest {
    @Test fun mismatchedIdentityDoesNotFetchAToken() = runTest {
        var fetched = false
        val gate = SessionTokenGate("account-a", "session-a") { "account-b" to "session-b" }
        assertTrue(gate.token { fetched = true; Result.success("synthetic-token") }.isFailure)
        assertFalse(fetched)
    }

    @Test fun accountSwitchRejectsAnAlreadyPendingToken() = runTest {
        var current = "account-a" to "session-a"
        val gate = SessionTokenGate(current.first, current.second) { current }
        val started = CompletableDeferred<Unit>()
        val response = CompletableDeferred<String>()
        val request = async { gate.token { started.complete(Unit); Result.success(response.await()) } }
        started.await()
        current = "account-b" to "session-b"
        response.complete("synthetic-token")
        assertTrue(request.await().isFailure)
    }

    @Test fun retiringAProviderRejectsItsLateResponse() = runTest {
        val gate = SessionTokenGate("account-a", "session-a") { "account-a" to "session-a" }
        val started = CompletableDeferred<Unit>()
        val response = CompletableDeferred<String>()
        val request = async { gate.token { started.complete(Unit); Result.success(response.await()) } }
        started.await()
        gate.retire()
        response.complete("synthetic-token")
        assertTrue(request.await().isFailure)
    }

    @Test fun matchingSessionReceivesItsOwnToken() = runTest {
        val gate = SessionTokenGate("account-a", "session-a") { "account-a" to "session-a" }
        assertEquals("synthetic-token", gate.token { Result.success("synthetic-token") }.getOrThrow())
    }
}

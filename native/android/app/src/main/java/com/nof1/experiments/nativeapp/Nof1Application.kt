package com.nof1.experiments.nativeapp

import android.app.Application
import android.content.Context
import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.session.GetTokenOptions
import dev.convex.android.AuthProvider

class Nof1Application : Application() {
    var configurationError: String? = null
        private set

    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.LOCAL_DEMO) return
        if (!BuildConfig.CLERK_PUBLISHABLE_KEY.startsWith("pk_") ||
            !BuildConfig.CONVEX_URL.startsWith("https://") ||
            BuildConfig.CLERK_PUBLISHABLE_KEY.contains("REPLACE_ME") ||
            BuildConfig.CONVEX_URL.contains("REPLACE_ME")) {
            configurationError = "Cloud configuration is missing. Supply NOF1_CLERK_PUBLISHABLE_KEY and NOF1_CONVEX_URL, then rebuild the cloud app. Local development is a separate build, never an automatic fallback."
            return
        }
        runCatching {
            Clerk.initialize(this, publishableKey = BuildConfig.CLERK_PUBLISHABLE_KEY)
        }.onFailure {
            configurationError = "Unable to initialize cloud authentication. Check this app's Clerk native registration and build configuration."
        }
    }
}

class ClerkTemplateAuthProvider(private val userId: String, private val sessionId: String) : AuthProvider<String> {
    private val gate = SessionTokenGate(userId, sessionId) { Clerk.user?.id to Clerk.activeSession?.id }
    private var invalidate: ((String?) -> Unit)? = null

    fun retire() {
        gate.retire()
        invalidate?.invoke(null)
        invalidate = null
    }

    override suspend fun login(context: Context, onIdToken: (String?) -> Unit): Result<String> =
        loginFromCache(onIdToken)

    override suspend fun loginFromCache(onIdToken: (String?) -> Unit): Result<String> {
        invalidate = onIdToken
        val result = gate.token {
            when (val token = Clerk.auth.getToken(GetTokenOptions(template = "convex", skipCache = true))) {
                is ClerkResult.Success -> Result.success(token.value)
                is ClerkResult.Failure -> Result.failure(IllegalStateException("Unable to authenticate with Convex. Check the Clerk convex JWT template and your connection."))
            }
        }
        if (result.isFailure && gate.isCurrent()) onIdToken(null)
        return result
    }

    override suspend fun logout(context: Context): Result<Void?> = Result.success(null)

    override fun extractIdToken(authResult: String): String = authResult
}

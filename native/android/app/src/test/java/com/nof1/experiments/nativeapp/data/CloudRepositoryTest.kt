package com.nof1.experiments.nativeapp.data

import dev.convex.android.ConvexClient
import dev.convex.android.MobileConvexClientInterface
import dev.convex.android.testing.FakeFfiClient
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitCancellation
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.double
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

private class TestBridge(val fake: FakeFfiClient = FakeFfiClient()) : MobileConvexClientInterface by fake {
    var response: String = "null"
    var error: Exception? = null
    var mutationCount = 0
    var suspendMutation = false

    override suspend fun mutation(name: String, args: Map<String, String>): String {
        mutationCount++
        fake.mutations[name] = args
        if (suspendMutation) awaitCancellation()
        error?.let { throw it }
        return response
    }

    override suspend fun action(name: String, args: Map<String, String>): String {
        fake.actions[name] = args
        error?.let { throw it }
        return response
    }
}

@OptIn(ExperimentalCoroutinesApi::class)
class CloudRepositoryTest {
    private fun repository(bridge: TestBridge) = CloudRepository(ConvexClient("https://example.convex.cloud") { _, _, _ -> bridge })

    @Test fun sdkReceivesExactWrappersAndDoubleNumbers() = runTest {
        val bridge = TestBridge().apply { response = "{\"id\":\"created\"}" }
        val repository = repository(bridge)
        repository.mutate("tracking:logMetric", mapOf("entry" to mapOf("metricType" to "energy", "value" to 7)))
        val sent = DataJson.parseToJsonElement(bridge.fake.mutations.getValue("tracking:logMetric").getValue("entry")).jsonObject
        assertEquals(7.0, sent.getValue("value").jsonPrimitive.double, 0.0)
        assertFalse(sent.toString().contains("\$integer"))
        assertEquals(1, bridge.mutationCount)
    }

    @Test fun mutationServerErrorsAndFalseSuccessAreNotSwallowedOrRetried() = runTest {
        val bridge = TestBridge().apply { response = "{\"success\":false}" }
        val repository = repository(bridge)
        assertTrue(runCatching { repository.mutate(Api.deleteDose("missing")) }.isFailure)
        assertEquals(1, bridge.mutationCount)
        bridge.error = IllegalStateException("Denied")
        val result = runCatching { repository.mutate(Api.deleteDose("missing")) }
        assertEquals("Denied", result.exceptionOrNull()?.message)
        assertEquals(2, bridge.mutationCount)
    }

    @Test fun typedQueriesDecodeActualSubscriptionAndReleaseIt() = runTest {
        val bridge = TestBridge()
        val repository = repository(bridge)
        val queried = async(UnconfinedTestDispatcher(testScheduler)) { repository.query<List<Experiment>>(Api.EXPERIMENTS) }
        testScheduler.runCurrent()
        assertTrue(bridge.fake.hasSubscriptionFor(Api.EXPERIMENTS, emptyMap()))
        bridge.fake.sendSubscriptionData(Api.EXPERIMENTS, emptyMap(), "[]")
        assertTrue(queried.await().isEmpty())
        assertFalse(bridge.fake.hasSubscriptionFor(Api.EXPERIMENTS, emptyMap()))
    }

    @Test fun typedFlowSurfacesDecodeFailuresAndServerErrors() = runTest {
        val bridge = TestBridge()
        val repository = repository(bridge)
        val malformed = async(UnconfinedTestDispatcher(testScheduler)) { repository.experiments.first() }
        testScheduler.runCurrent()
        bridge.fake.sendSubscriptionData(Api.EXPERIMENTS, emptyMap(), "[{\"id\":\"missing-fields\"}]")
        assertTrue(malformed.await().isFailure)
        val failed = async(UnconfinedTestDispatcher(testScheduler)) { repository.experiments.first() }
        testScheduler.runCurrent()
        bridge.fake.sendSubscriptionError(Api.EXPERIMENTS, emptyMap(), "Unauthorized")
        assertEquals("Unauthorized", failed.await().exceptionOrNull()?.message)
    }

    @Test fun trackingFlowsDecodeGetAllWrapperAndAuthoritativeBilling() = runTest {
        val bridge = TestBridge()
        val repository = repository(bridge)
        val doses = async(UnconfinedTestDispatcher(testScheduler)) { repository.doses.first() }
        testScheduler.runCurrent()
        bridge.fake.sendSubscriptionData(Api.TRACKING, emptyMap(), "{\"doses\":[],\"metrics\":[],\"stack\":[]}")
        assertTrue(doses.await().getOrThrow().isEmpty())
        val billing = async(UnconfinedTestDispatcher(testScheduler)) { repository.billing.first() }
        testScheduler.runCurrent()
        bridge.fake.sendSubscriptionData(Api.BILLING, emptyMap(), """{"entitlement":"nof1_plus","hasPlus":true,"sources":[{"provider":"manual","status":"active","productId":null,"expiresAt":null}],"primarySource":"manual","expiresAt":null,"inGracePeriod":false,"hasMultipleActiveProviders":false}""")
        assertTrue(billing.await().getOrThrow().hasPlus)
    }

    @Test fun genericMutationsAndActionsUsePublishedSdkOverloads() = runTest {
        val bridge = TestBridge().apply { response = "{\"hasPlus\":false}" }
        val repository = repository(bridge)
        assertEquals(false, repository.mutation<JsonObject>("billing:refreshAccess")["hasPlus"]?.jsonPrimitive?.content?.toBoolean())
        assertEquals(false, repository.action<JsonObject>("billing:syncRevenueCat")["hasPlus"]?.jsonPrimitive?.content?.toBoolean())
        assertTrue(bridge.fake.mutations.containsKey("billing:refreshAccess"))
        assertTrue(bridge.fake.actions.containsKey("billing:syncRevenueCat"))
    }

    @Test fun cancellationReleasesSubscriptionsWithoutEmittingSuccessOrErrorState() = runTest {
        val bridge = TestBridge()
        val repository = repository(bridge)
        val pending = async(UnconfinedTestDispatcher(testScheduler)) { repository.experiments.first() }
        testScheduler.runCurrent()
        assertTrue(bridge.fake.hasSubscriptionFor(Api.EXPERIMENTS, emptyMap()))
        pending.cancelAndJoin()
        assertTrue(pending.isCancelled)
        assertFalse(bridge.fake.hasSubscriptionFor(Api.EXPERIMENTS, emptyMap()))
    }

    @Test fun cancellationPropagatesThroughMutationWithoutRetry() = runTest {
        val bridge = TestBridge().apply { suspendMutation = true }
        val repository = repository(bridge)
        val pending = async(UnconfinedTestDispatcher(testScheduler)) { repository.mutate(Api.deleteDose("d")) }
        pending.cancelAndJoin()
        assertTrue(pending.isCancelled)
        assertEquals(1, bridge.mutationCount)
        assertTrue(runCatching { pending.await() }.exceptionOrNull() is CancellationException)
    }
}

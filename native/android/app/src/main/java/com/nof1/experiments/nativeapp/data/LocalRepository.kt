package com.nof1.experiments.nativeapp.data

import android.content.Context
import android.content.pm.ApplicationInfo
import java.io.File
import java.io.FileOutputStream
import java.lang.ref.WeakReference
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import java.security.MessageDigest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.Required
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.decodeFromJsonElement

@Serializable
internal data class LocalSnapshot(
    @Required val version: Int = 1,
    @Required val experiments: List<Experiment> = emptyList(),
    @Required val protocols: List<Protocol> = emptyList(),
    @Required val doses: List<Dose> = emptyList(),
    @Required val metrics: List<Metric> = emptyList(),
    @Required val stack: List<StackItem> = emptyList(),
)

private class LocalStore {
    val mutex = Mutex()
    val state = MutableStateFlow<Result<LocalSnapshot>?>(null)
}

class LocalRepository internal constructor(
    private val directory: File,
    private val identity: String,
    private val now: () -> String = Domain::nowIso,
) : Repository {
    constructor(context: Context, identity: String) : this(developmentDirectory(context), identity)

    private val file: File
    private val store: LocalStore
    private val mutex get() = store.mutex
    private val state get() = store.state
    private var loaded = false

    init {
        require(identity.isNotBlank()) { "A development identity is required" }
        val digest = MessageDigest.getInstance("SHA-256").digest(identity.toByteArray(Charsets.UTF_8))
            .joinToString("") { "%02x".format(it) }
        file = File(directory, "$digest.json")
        store = storeFor(file.canonicalPath)
    }

    private val snapshots: Flow<Result<LocalSnapshot>> = flow {
        loadIfNeeded()
        emitAll(state.filterNotNull())
    }

    override val experiments = snapshots.map { it.map { snapshot -> snapshot.experiments.sortedByDescending { item -> item.updatedAt } } }
    override val protocols = snapshots.map { it.map { snapshot -> snapshot.protocols.sortedByDescending { item -> item.createdAt } } }
    override val doses = snapshots.map { it.map { snapshot -> snapshot.doses.sortedByDescending { item -> item.timestamp } } }
    override val metrics = snapshots.map { it.map { snapshot -> snapshot.metrics.sortedByDescending { item -> item.timestamp } } }
    override val stack = snapshots.map { it.map { snapshot -> snapshot.stack.sortedByDescending { item -> item.addedAt } } }
    override val billing: Flow<Result<PlusAccess>> = snapshots.map { result -> result.map { freeAccess } }

    suspend fun reload() = withContext(Dispatchers.IO) {
        mutex.withLock {
            state.value = runCatching { readSnapshot() }
            loaded = true
        }
    }

    private suspend fun loadIfNeeded() = withContext(Dispatchers.IO) {
        mutex.withLock {
            if (!loaded) {
                state.value = runCatching { readSnapshot() }
                loaded = true
            }
        }
    }

    override suspend fun mutate(path: String, args: Map<String, Any?>) = withContext(Dispatchers.IO) {
        mutex.withLock {
            val current = try {
                readSnapshot()
            } catch (error: Exception) {
                state.value = Result.failure(error)
                loaded = true
                throw error
            }
            loaded = true
            if (state.value == null) state.value = Result.success(current)
            val updated = applyMutation(current, path, normalizeArguments(args))
            try {
                persist(updated)
            } catch (error: Exception) {
                state.value = Result.failure(error)
                throw error
            }
            state.value = Result.success(updated)
            loaded = true
        }
    }

    private fun readSnapshot(): LocalSnapshot {
        check(!directory.exists() || directory.isDirectory) { "Development data path is not a directory" }
        if (!file.exists()) return LocalSnapshot()
        val snapshot = DataJson.decodeFromString<LocalSnapshot>(file.readText())
        require(snapshot.version == 1) { "Unsupported development data version" }
        require(snapshot.experiments.all { it.userId == identity } && snapshot.protocols.all { it.userId == identity } &&
            snapshot.doses.all { it.userId == identity } && snapshot.metrics.all { it.userId == identity } &&
            snapshot.stack.all { it.userId == identity }) { "Development data belongs to a different identity" }
        return snapshot
    }

    private fun persist(snapshot: LocalSnapshot) {
        check(directory.isDirectory || directory.mkdirs()) { "Cannot create development data directory" }
        val temporary = File.createTempFile(".snapshot-", ".tmp", directory)
        try {
            FileOutputStream(temporary).use { stream ->
                stream.write(DataJson.encodeToString(snapshot).toByteArray(Charsets.UTF_8))
                stream.fd.sync()
            }
            Files.move(temporary.toPath(), file.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING)
        } finally {
            temporary.delete()
        }
    }

    private fun applyMutation(snapshot: LocalSnapshot, path: String, args: Map<String, Any?>): LocalSnapshot {
        val expected = when (path) {
            "experiments:create", "protocols:create", "tracking:addToStack" -> setOf("input")
            "experiments:update", "protocols:update" -> setOf("id", "updates")
            "experiments:addEntry" -> setOf("experimentId", "entry")
            "protocols:logAdherence" -> setOf("protocolId", "entry")
            "tracking:logDose", "tracking:logMetric" -> setOf("entry")
            "experiments:remove", "protocols:remove", "protocols:toggleActive", "tracking:deleteDose",
            "tracking:deleteMetric", "tracking:removeFromStack", "tracking:toggleStackItem" -> setOf("id")
            "billing:refreshAccess" -> emptySet()
            else -> throw UnsupportedOperationException("Unsupported development mutation: $path")
        }
        require(args.keys == expected) { "Mutation arguments do not match the backend contract" }
        val timestamp = Domain.iso(now())
        val id = args["id"] as? String
        when (path) {
            "experiments:create" -> {
                val input = decode<ExperimentInput>(args.objectValue("input"))
                Domain.validate(input)
                val existing = snapshot.experiments.find { it.id == input.id }
                requireCapacity(snapshot, input.status, existing)
                val experiment = Experiment(
                    id = input.id, userId = identity, name = input.name, hypothesis = input.hypothesis,
                    intervention = input.intervention, metrics = input.metrics, schedule = input.schedule,
                    status = input.status, entries = emptyList(), createdAt = existing?.createdAt ?: timestamp,
                    updatedAt = timestamp,
                )
                return snapshot.copy(experiments = snapshot.experiments.filterNot { it.id == input.id } + experiment)
            }
            "experiments:update" -> {
                val existing = snapshot.experiments.find { it.id == id } ?: missing("Experiment")
                val updates = args.objectValue("updates").withoutIdentity()
                val merged = payload(existing).toMutableMap().apply {
                    putAll(updates)
                    if (updates["schedule"] != null) {
                        put("schedule", payload(existing.schedule) + updates.objectValue("schedule"))
                    }
                    put("updatedAt", timestamp)
                }
                val updated = decode<Experiment>(merged).let { experiment ->
                    experiment.copy(entries = experiment.entries.map { it.copy(experimentId = existing.id) })
                }
                Domain.validate(ExperimentInput(updated.name, updated.hypothesis, updated.intervention,
                    updated.metrics, updated.schedule, updated.status, updated.id))
                updated.entries.forEach { Domain.validate(it, updated.metrics) }
                requireCapacity(snapshot, updated.status, existing)
                return snapshot.copy(experiments = snapshot.experiments.map { if (it.id == id) updated else it })
            }
            "experiments:remove" -> {
                requireFound(snapshot.experiments.any { it.id == id }, "Experiment")
                return snapshot.copy(experiments = snapshot.experiments.filterNot { it.id == id })
            }
            "experiments:addEntry" -> {
                val experimentId = args["experimentId"] as? String ?: throw IllegalArgumentException("experimentId must be a string")
                val existing = snapshot.experiments.find { it.id == experimentId } ?: missing("Experiment")
                val values = mapOf("id" to Domain.newId(), "createdAt" to timestamp, "date" to timestamp,
                    "isInterventionDay" to true, "metricValues" to emptyList<Any>()) + args.objectValue("entry") +
                    ("experimentId" to experimentId)
                val entry = decode<ExperimentEntry>(values)
                Domain.validate(entry, existing.metrics)
                return snapshot.copy(experiments = snapshot.experiments.map {
                    if (it.id == experimentId) it.copy(entries = it.entries + entry, updatedAt = timestamp) else it
                })
            }
            "protocols:create" -> {
                val input = decode<ProtocolInput>(args.objectValue("input"))
                Domain.validate(input)
                val protocol = decode<Protocol>(payload(input) + mapOf("userId" to identity,
                    "adherence" to emptyList<Any>(), "createdAt" to timestamp))
                return snapshot.copy(protocols = snapshot.protocols + protocol)
            }
            "protocols:update" -> {
                val existing = snapshot.protocols.find { it.id == id } ?: missing("Protocol")
                val updated = decode<Protocol>(payload(existing) + args.objectValue("updates").withoutIdentity())
                Domain.validate(decode<ProtocolInput>(payload(updated)))
                updated.adherence.forEach { Domain.validate(it) }
                return snapshot.copy(protocols = snapshot.protocols.map { if (it.id == id) updated else it })
            }
            "protocols:remove" -> {
                requireFound(snapshot.protocols.any { it.id == id }, "Protocol")
                return snapshot.copy(protocols = snapshot.protocols.filterNot { it.id == id })
            }
            "protocols:toggleActive" -> {
                val existing = snapshot.protocols.find { it.id == id } ?: missing("Protocol")
                return snapshot.copy(protocols = snapshot.protocols.map {
                    if (it.id == id) it.copy(isActive = !existing.isActive) else it
                })
            }
            "protocols:logAdherence" -> {
                val protocolId = args["protocolId"] as? String ?: throw IllegalArgumentException("protocolId must be a string")
                val existing = snapshot.protocols.find { it.id == protocolId } ?: missing("Protocol")
                val entry = decode<AdherenceEntry>(args.objectValue("entry"))
                Domain.validate(entry)
                val adherence = if (existing.adherence.any { it.date == entry.date }) {
                    existing.adherence.map { if (it.date == entry.date) entry else it }
                } else existing.adherence + entry
                return snapshot.copy(protocols = snapshot.protocols.map {
                    if (it.id == protocolId) it.copy(adherence = adherence) else it
                })
            }
            "tracking:logDose" -> {
                val input = decode<DoseInput>(args.objectValue("entry"))
                Domain.validate(input)
                val dose = decode<Dose>(payload(input) + mapOf("peptideId" to input.peptideId, "userId" to identity))
                return snapshot.copy(doses = snapshot.doses + dose)
            }
            "tracking:logMetric" -> {
                val input = decode<MetricInput>(args.objectValue("entry"))
                Domain.validate(input)
                val metric = decode<Metric>(payload(input) + ("userId" to identity))
                return snapshot.copy(metrics = snapshot.metrics + metric)
            }
            "tracking:addToStack" -> {
                val input = decode<StackInput>(args.objectValue("input"))
                Domain.validate(input)
                val item = decode<StackItem>(payload(input) + mapOf("peptideId" to input.peptideId, "userId" to identity))
                return snapshot.copy(stack = snapshot.stack.filterNot { it.id == input.id } + item)
            }
            "tracking:toggleStackItem" -> {
                val existing = snapshot.stack.find { it.id == id } ?: missing("Stack item")
                return snapshot.copy(stack = snapshot.stack.map { if (it.id == id) it.copy(isActive = !existing.isActive) else it })
            }
            "tracking:deleteDose" -> {
                requireFound(snapshot.doses.any { it.id == id }, "Dose")
                return snapshot.copy(doses = snapshot.doses.filterNot { it.id == id })
            }
            "tracking:deleteMetric" -> {
                requireFound(snapshot.metrics.any { it.id == id }, "Metric")
                return snapshot.copy(metrics = snapshot.metrics.filterNot { it.id == id })
            }
            "tracking:removeFromStack" -> {
                requireFound(snapshot.stack.any { it.id == id }, "Stack item")
                return snapshot.copy(stack = snapshot.stack.filterNot { it.id == id })
            }
            "billing:refreshAccess" -> return snapshot
            else -> throw UnsupportedOperationException("Unsupported development mutation: $path")
        }
    }

    private fun requireCapacity(snapshot: LocalSnapshot, status: String, existing: Experiment?) {
        if (!Domain.isInProgress(status) || existing?.let { Domain.isInProgress(it.status) } == true) return
        require(snapshot.experiments.none { it.id != existing?.id && Domain.isInProgress(it.status) }) { "Nof1 Plus required" }
    }

    companion object {
        private val stores = mutableMapOf<String, WeakReference<LocalStore>>()
        private val freeAccess = PlusAccess(hasPlus = false, sources = emptyList(), inGracePeriod = false,
            hasMultipleActiveProviders = false)

        @Synchronized
        private fun storeFor(path: String): LocalStore {
            stores.entries.removeAll { it.value.get() == null }
            return stores[path]?.get() ?: LocalStore().also { stores[path] = WeakReference(it) }
        }

        private fun developmentDirectory(context: Context): File {
            check(context.applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0) {
                "LocalRepository is available only in a debuggable development build"
            }
            return File(context.noBackupFilesDir, "native-development-data")
        }

        private inline fun <reified T> decode(value: Map<String, Any?>): T =
            DataJson.decodeFromJsonElement(argumentJson(canonicalDates(normalizeArguments(value))))

        private fun canonicalDates(value: Map<String, Any?>): Map<String, Any?> = value.mapValues { (key, item) ->
            when {
                item is String && key in setOf("startDate", "endDate", "timestamp", "createdAt", "updatedAt", "addedAt") -> Domain.iso(item)
                item is String && key == "date" && item.contains("T") -> Domain.iso(item)
                item is Map<*, *> -> canonicalDates(mapOf("nested" to item).objectValue("nested"))
                item is List<*> -> item.map { child ->
                    if (child is Map<*, *>) canonicalDates(mapOf("nested" to child).objectValue("nested")) else child
                }
                else -> item
            }
        }

        private fun Map<String, Any?>.objectValue(key: String): Map<String, Any?> {
            val value = this[key] as? Map<*, *> ?: throw IllegalArgumentException("$key must be an object")
            return value.entries.associate { (name, item) ->
                require(name is String) { "Object keys must be strings" }
                name to item
            }
        }

        private fun Map<String, Any?>.withoutIdentity(): Map<String, Any?> =
            filterKeys { it !in setOf("id", "userId", "createdAt") }

        private fun missing(entity: String): Nothing = throw NoSuchElementException("$entity not found")

        private fun requireFound(found: Boolean, entity: String) {
            if (!found) missing(entity)
        }
    }
}

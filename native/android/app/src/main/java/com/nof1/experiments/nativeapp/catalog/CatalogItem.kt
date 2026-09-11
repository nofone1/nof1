package com.nof1.experiments.nativeapp.catalog

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull

data class CatalogItem(val data: JsonObject) {
    val id: String get() = text("id")
    val name: String get() = text("name")
    val shortCode: String get() = text("shortCode")
    val subtitle: String get() = text("subtitle")
    val researchLevel: String get() = text("researchLevel")
    val categories: List<String> get() = strings("categories")
    val administrationRoutes: List<String> get() = strings("administrationRoutes")

    fun value(vararg path: String): JsonElement? = path.fold<String, JsonElement?>(data) { value, key ->
        (value as? JsonObject)?.get(key)
    }

    fun text(vararg path: String): String = (value(*path) as? JsonPrimitive)?.contentOrNull.orEmpty()

    fun number(vararg path: String): Double? = (value(*path) as? JsonPrimitive)?.doubleOrNull

    private fun strings(key: String): List<String> = (data[key] as? JsonArray)
        ?.mapNotNull { (it as? JsonPrimitive)?.contentOrNull }.orEmpty()
}

class CatalogLoadException(message: String, cause: Throwable? = null) : IllegalStateException(message, cause)

object CatalogData {
    fun parse(source: String): List<CatalogItem> {
        val entries = try {
            Json.parseToJsonElement(source) as? JsonArray
                ?: throw CatalogLoadException("The bundled catalog must be a JSON array.")
        } catch (error: IllegalArgumentException) {
            throw CatalogLoadException("The bundled catalog contains invalid JSON.", error)
        }
        if (entries.isEmpty()) throw CatalogLoadException("The bundled catalog is empty.")
        val ids = mutableSetOf<String>()
        return entries.mapIndexed { index, element ->
            val data = element as? JsonObject
                ?: throw CatalogLoadException("Catalog entry ${index + 1} must be an object.")
            listOf("id", "name").forEach { field ->
                val value = data[field] as? JsonPrimitive
                if (value?.isString != true || value.contentOrNull.isNullOrBlank()) {
                    throw CatalogLoadException("Catalog entry ${index + 1} has no valid $field.")
                }
            }
            val item = CatalogItem(data)
            if (!ids.add(item.id)) throw CatalogLoadException("The bundled catalog contains a duplicate ID: ${item.id}.")
            item
        }
    }

    fun filter(
        items: List<CatalogItem>,
        query: String = "",
        category: String? = null,
        researchLevel: String? = null,
    ): List<CatalogItem> {
        val search = query.trim()
        return items.filter { item ->
            (search.isBlank() || listOf(item.name, item.subtitle, item.text("overview", "description"))
                .any { it.contains(search, ignoreCase = true) }) &&
                (category == null || category in item.categories) &&
                (researchLevel == null || researchLevel == item.researchLevel)
        }
    }
}

enum class CatalogDetailTab(val label: String, val fields: List<String>) {
    Overview("Overview", listOf("overview", "molecularInfo", "timeline")),
    Dosing("Dosing", listOf("dosing", "protocols", "reconstitution")),
    Research("Research", listOf("indications", "studies", "pharmacokinetics")),
    Safety("Safety", listOf("sideEffects", "safetyNotes", "storage", "interactions")),
    Tools("Tools", emptyList()),
}

internal val catalogHeaderFields = setOf(
    "id", "name", "shortCode", "subtitle", "researchLevel", "categories", "administrationRoutes",
)

internal fun CatalogItem.additionalFields(): JsonObject {
    val displayed = catalogHeaderFields + CatalogDetailTab.entries.flatMap { it.fields }
    return JsonObject(data.filterKeys { it !in displayed })
}

internal fun catalogLabel(key: String): String = when (key) {
    "fda_approved" -> "FDA Approved"
    "anti_aging" -> "Anti-Aging"
    "anti_inflammatory" -> "Anti-Inflammatory"
    "molecularInfo" -> "Molecular information"
    "timeline" -> "What to expect"
    "protocols" -> "Research protocols"
    "indications" -> "Research indications"
    "studies" -> "Published studies"
    "pharmacokinetics" -> "Pharmacokinetics"
    "keyBenefits" -> "Reported benefits"
    "mechanism" -> "Mechanism of action"
    "doi" -> "DOI"
    "peptideId" -> "Peptide ID"
    "id" -> "Catalog ID"
    "defaultPeptideMg" -> "Default peptide amount (mg)"
    "defaultVialMl" -> "Default water volume (mL)"
    "halfLifeHours" -> "Half-life (hours)"
    else -> key.replace(Regex("([a-z0-9])([A-Z])"), "$1 $2")
        .replace('_', ' ').replaceFirstChar { it.uppercase() }
}

internal fun JsonElement.isNotProvided(): Boolean = this == JsonNull ||
    (this is JsonArray && isEmpty()) || (this is JsonObject && isEmpty()) ||
    (this is JsonPrimitive && contentOrNull.isNullOrBlank())

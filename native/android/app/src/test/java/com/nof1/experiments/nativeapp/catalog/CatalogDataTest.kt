package com.nof1.experiments.nativeapp.catalog

import java.io.File
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

internal fun sharedFixture(name: String): String {
    val file = generateSequence(File(System.getProperty("user.dir"))) { it.parentFile }
        .flatMap { sequenceOf(File(it, "native/shared/$name"), File(it, "shared/$name")) }
        .firstOrNull { it.isFile }
        ?: error("Shared fixture $name was not found; run tests from within the repository.")
    return file.readText()
}

class CatalogDataTest {
    private val source = sharedFixture("catalog.json")
    private val catalog = CatalogData.parse(source)

    @Test
    fun fullCatalogPreservesEverySourceField() {
        val original = Json.parseToJsonElement(source) as JsonArray
        assertEquals(71, catalog.size)
        assertEquals(original.size, catalog.size)
        assertEquals(catalog.size, catalog.map { it.id }.distinct().size)
        catalog.forEachIndexed { index, item -> assertEquals(original[index], item.data) }
        assertEquals("cjc-ipa", catalog.last().id)
        assertEquals("BPC-157", catalog.first { it.id == "bpc-157" }.name)
    }

    @Test
    fun allSourceFieldsHaveADetailDestination() {
        val tabFields = CatalogDetailTab.entries.flatMap { it.fields }
        assertEquals(tabFields.size, tabFields.distinct().size)
        catalog.forEach { item ->
            assertTrue(item.data.keys.all { it in catalogHeaderFields || it in tabFields || it in item.additionalFields() })
        }
        val original = catalog.first()
        val additional = JsonObject(mapOf("futureRichField" to Json.parseToJsonElement("""{"nested":[{"text":"Retain everything","flag":false,"number":0}]}""")))
        val expanded = CatalogItem(JsonObject(original.data + additional))
        assertEquals(additional, expanded.additionalFields())
        assertFalse(JsonPrimitive(false).isNotProvided())
        assertFalse(JsonPrimitive(0).isNotProvided())
    }

    @Test
    fun searchMatchesSourceNameSubtitleAndOverviewWithoutLosingOrder() {
        assertEquals(listOf("bpc-157", "wolverine-stack", "klow-protocol"), CatalogData.filter(catalog, " bPc-157 ").map { it.id })
        val phrase = "mitochondrial-derived peptide encoded"
        assertTrue(CatalogData.filter(catalog, phrase).any { it.id == "mots-c" })
        assertEquals(catalog, CatalogData.filter(catalog, "  "))
        assertTrue(CatalogData.filter(catalog, "no-such-peptide-123456").isEmpty())
    }

    @Test
    fun filtersComposeAndClearRestoresTheFullCatalog() {
        val filtered = CatalogData.filter(catalog, "", "weight_loss", "fda_approved")
        assertTrue(filtered.any { it.id == "semaglutide" })
        assertTrue(filtered.all { "weight_loss" in it.categories && it.researchLevel == "fda_approved" })
        assertFalse(filtered.any { it.id == "bpc-157" })
        assertTrue(CatalogData.filter(catalog, "bpc", "weight_loss", "fda_approved").isEmpty())
        assertEquals(catalog, CatalogData.filter(catalog))
    }

    @Test
    fun optionalRichFieldsArePreservedAndMissingFieldsStayMissing() {
        val bpc = catalog.first { it.id == "bpc-157" }
        assertEquals(5.0, bpc.number("reconstitution", "defaultPeptideMg")!!, 0.0)
        assertNotNull(bpc.value("reconstitution", "qualityIndicators", "bad"))
        assertTrue(catalog.any { it.value("pharmacokinetics") == null })
        assertEquals("", bpc.text("notAnExistingField"))
    }

    @Test
    fun invalidBundlesProduceExplicitErrorsInsteadOfAnEmptyCatalog() {
        listOf("[]", "{}", "not json", "[1]", """[{"name":"Missing ID"}]""", """[{"id":" ","name":"Blank ID"}]""",
            """[{"id":1,"name":"Numeric ID"}]""", """[{"id":"x","name":"One"},{"id":"x","name":"Two"}]""")
            .forEach { source -> assertThrows(CatalogLoadException::class.java) { CatalogData.parse(source) } }
    }
}

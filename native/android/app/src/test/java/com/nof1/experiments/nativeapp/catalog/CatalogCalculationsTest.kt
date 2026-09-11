package com.nof1.experiments.nativeapp.catalog

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.double
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class CatalogCalculationsTest {
    @Test
    fun decayMatchesEverySharedSourceFixture() {
        val fixtures = Json.parseToJsonElement(sharedFixture("calculations.json")).jsonObject.getValue("decay").jsonArray
        fixtures.forEach { fixture ->
            val value = fixture.jsonObject
            assertEquals(
                value.getValue("expectedPercentage").jsonPrimitive.double,
                CatalogCalculations.calculateDecay(
                    value.getValue("halfLifeHours").jsonPrimitive.double,
                    value.getValue("hoursElapsed").jsonPrimitive.double,
                ),
                0.000000001,
            )
        }
    }

    @Test
    fun curveUsesSourceTenPointFiveHalfLifeRange() {
        val curve = CatalogCalculations.generateDecayCurve(6.0, 30.0, 10)
        assertEquals(10, curve.size)
        assertEquals(0.0, curve.first().hour, 0.0)
        assertEquals(100.0, curve.first().percentage, 0.0)
        assertEquals(30.0, curve.last().hour, 0.0)
        assertEquals(3.125, curve.last().percentage, 0.000000001)
        assertTrue(curve.zipWithNext().all { (a, b) -> a.hour < b.hour && a.percentage > b.percentage })
    }

    @Test
    fun reconstitutionMatchesSourceDefaultAndRounding() {
        val result = CatalogCalculations.reconstitute(5.0, 2.0, 250.0)
        assertEquals(2500.0, result.concentrationMcgPerMl, 0.0)
        assertEquals(0.1, result.volumePerDoseMl, 0.000000001)
        assertEquals(10.0, result.unitsPerDose, 0.0)
        assertEquals(20.0, result.dosesPerVial, 0.0)
        val rounded = CatalogCalculations.reconstitute(5.0, 1.0, 125.0)
        assertEquals(3.0, rounded.unitsPerDose, 0.0)
        assertEquals(6.0, CatalogCalculations.reconstitute(1.0, 2.0, 150.0).dosesPerVial, 0.0)
    }

    @Test
    fun defaultsFromEveryReconstitutionEntryAreCalculable() {
        val entries = CatalogData.parse(sharedFixture("catalog.json")).filter { it.value("reconstitution") != null }
        assertEquals(3, entries.size)
        entries.forEach { item ->
            val result = CatalogCalculations.reconstitute(
                item.number("reconstitution", "defaultPeptideMg")!!,
                item.number("reconstitution", "defaultVialMl")!!,
                250.0,
            )
            assertTrue(result.concentrationMcgPerMl > 0)
            assertTrue(result.volumePerDoseMl > 0)
        }
    }

    @Test
    fun invalidCalculatorInputsAreRejected() {
        listOf(0.0, -1.0, Double.NaN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY).forEach { input ->
            assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.reconstitute(input, 2.0, 250.0) }
            assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.reconstitute(5.0, input, 250.0) }
            assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.reconstitute(5.0, 2.0, input) }
        }
        assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.reconstitute(5.0, 2.0, 5001.0) }
        assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.reconstitute(Double.MAX_VALUE, 2.0, 250.0) }
        assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.calculateDecay(Double.NaN, 1.0) }
        assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.calculateDecay(6.0, Double.POSITIVE_INFINITY) }
        assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.generateDecayCurve(6.0, 30.0, 1) }
        assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.generateDecayCurve(0.0, 30.0, 10) }
        assertThrows(IllegalArgumentException::class.java) { CatalogCalculations.generateDecayCurve(6.0, -1.0, 10) }
    }

    @Test
    fun durationLabelsMatchSourceBoundaries() {
        assertEquals("30 min", CatalogCalculations.formatDuration(0.5))
        assertEquals("1 hrs", CatalogCalculations.formatDuration(1.0))
        assertEquals("5 hrs", CatalogCalculations.formatDuration(4.5))
        assertEquals("2.0 days", CatalogCalculations.formatDuration(48.0))
        assertEquals("2.5 days", CatalogCalculations.formatDuration(60.0))
    }
}

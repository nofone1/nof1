package com.nof1.experiments.nativeapp.catalog

import com.nof1.experiments.nativeapp.data.Dose
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeParseException
import kotlin.math.ln
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class ConcentrationCalculationsTest {
    private val now = Instant.parse("2026-03-10T12:00:00Z")
    private val catalog = CatalogData.parse(sharedFixture("catalog.json"))
    private val semaglutideHalfLife = catalog.first { it.id == "semaglutide" }.number("pharmacokinetics", "halfLifeHours")!!

    private fun dose(id: String, peptideId: String? = "semaglutide", hoursAgo: Double = 0.0, dosage: String = "1 mg") = Dose(
        id = id, peptideId = peptideId, name = peptideId ?: "Unlinked compound", dosage = dosage,
        timestamp = now.minusMillis((hoursAgo * 3_600_000).toLong()).toString(),
    )

    @Test
    fun equalDoseSuperpositionIgnoresDosageAndCapsAtOneHundred() {
        val single = ConcentrationCalculations.calculate(listOf(dose("a", hoursAgo = 168.0, dosage = "0.1 mg")), catalog, now, ZoneOffset.UTC).single()
        val differentAmount = ConcentrationCalculations.calculate(listOf(dose("a", hoursAgo = 168.0, dosage = "100 mg")), catalog, now, ZoneOffset.UTC).single()
        assertEquals(50.0, single.percentage, 0.00000001)
        assertEquals(single.percentage, differentAmount.percentage, 0.0)
        val stacked = ConcentrationCalculations.calculate(listOf(dose("a"), dose("b"), dose("c", hoursAgo = 168.0)), catalog, now, ZoneOffset.UTC).single()
        assertEquals(100.0, stacked.percentage, 0.0)
        assertEquals("higher", stacked.status)
        assertEquals(now, stacked.lastDoseTime)
    }

    @Test
    fun windowIncludesExactCutoffButExcludesOlderRecords() {
        val exact = dose("a", hoursAgo = 168.0)
        val before = exact.copy(id = "b", timestamp = Instant.parse(exact.timestamp).minusMillis(1).toString())
        assertEquals(50.0, ConcentrationCalculations.calculate(listOf(exact, before), catalog, now, ZoneOffset.UTC).single().percentage, 0.00000001)
        assertTrue(ConcentrationCalculations.calculate(listOf(before), catalog, now, ZoneOffset.UTC).isEmpty())
    }

    @Test
    fun sevenCalendarDaysMatchSourceAcrossDaylightSavingTime() {
        val zone = ZoneId.of("America/New_York")
        val cutoff = now.atZone(zone).minusDays(7).toInstant()
        assertEquals(167, java.time.Duration.between(cutoff, now).toHours())
        val exact = dose("a").copy(timestamp = cutoff.toString())
        val before = dose("b").copy(timestamp = cutoff.minusMillis(1).toString())
        val actual = ConcentrationCalculations.calculate(listOf(exact, before), catalog, now, zone).single()
        assertEquals(CatalogCalculations.calculateDecay(semaglutideHalfLife, 167.0), actual.percentage, 0.00000001)
    }

    @Test
    fun unknownMissingAndUnlinkedHalfLivesAreNotInvented() {
        val noHalfLife = catalog.first { it.value("pharmacokinetics") == null }.id
        val results = ConcentrationCalculations.calculate(listOf(dose("a", null), dose("b", "not-in-catalog"), dose("c", noHalfLife)), catalog, now, ZoneOffset.UTC)
        assertTrue(results.isEmpty())
    }

    @Test
    fun sourceStatusThresholdsAndDescendingOrderingArePreserved() {
        val halfLife = 6.0
        val testCatalog = CatalogData.parse("""[
            {"id":"higher","name":"Higher","pharmacokinetics":{"halfLifeHours":6}},
            {"id":"declining","name":"Declining","pharmacokinetics":{"halfLifeHours":6}},
            {"id":"low","name":"Low","pharmacokinetics":{"halfLifeHours":6}}
        ]""")
        val records = listOf(
            dose("l", "low", 24.0),
            dose("d", "declining", 12.0),
            dose("h", "higher", halfLife),
        )
        val levels = ConcentrationCalculations.calculate(records, testCatalog, now, ZoneOffset.UTC)
        assertEquals(listOf("higher", "declining", "low"), levels.map { it.status })
        assertEquals(listOf(50.0, 25.0, 6.25), levels.map { it.percentage })
        val atTen = dose("ten", "low", (ln(0.1) / ln(0.5) * halfLife) + 0.000001)
        val atForty = dose("forty", "declining", (ln(0.4) / ln(0.5) * halfLife) + 0.000001)
        val boundaries = ConcentrationCalculations.calculate(listOf(atTen, atForty), testCatalog, now, ZoneOffset.UTC)
        assertEquals(listOf("declining", "low"), boundaries.map { it.status })
    }

    @Test
    fun futureDosesContributeZeroAndInvalidTimestampsFailExplicitly() {
        val future = ConcentrationCalculations.calculate(listOf(dose("future", hoursAgo = -1.0)), catalog, now, ZoneOffset.UTC).single()
        assertEquals(0.0, future.percentage, 0.0)
        assertEquals("low", future.status)
        assertThrows(DateTimeParseException::class.java) {
            ConcentrationCalculations.calculate(listOf(dose("bad").copy(timestamp = "not a date")), catalog, now, ZoneOffset.UTC)
        }
    }

    @Test
    fun invalidCatalogHalfLifeFailsBeforeRendering() {
        val invalid = CatalogData.parse("""[{"id":"semaglutide","name":"Semaglutide","pharmacokinetics":{"halfLifeHours":-1}}]""")
        assertThrows(IllegalArgumentException::class.java) {
            ConcentrationCalculations.calculate(listOf(dose("a")), invalid, now, ZoneOffset.UTC)
        }
    }
}

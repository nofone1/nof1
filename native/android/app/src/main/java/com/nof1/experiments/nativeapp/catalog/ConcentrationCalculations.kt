package com.nof1.experiments.nativeapp.catalog

import com.nof1.experiments.nativeapp.data.Dose
import java.time.Duration
import java.time.Instant
import java.time.ZoneId

data class ConcentrationLevel(
    val peptideName: String,
    val peptideId: String,
    val percentage: Double,
    val status: String,
    val lastDoseTime: Instant,
    val halfLifeHours: Double,
)

object ConcentrationCalculations {
    fun calculate(
        doses: List<Dose>,
        catalog: List<CatalogItem>,
        now: Instant = Instant.now(),
        zone: ZoneId = ZoneId.systemDefault(),
    ): List<ConcentrationLevel> {
        val cutoff = now.atZone(zone).minusDays(7).toInstant()
        val recent = doses.map { dose -> dose to Instant.parse(dose.timestamp) }
            .filter { (_, time) -> !time.isBefore(cutoff) }
        val pharmacokinetics = catalog.associate { it.id to it.number("pharmacokinetics", "halfLifeHours") }
        return recent.groupBy { (dose, _) -> dose.peptideId ?: dose.name }.values.mapNotNull { group ->
            val first = group.first().first
            val peptideId = first.peptideId ?: return@mapNotNull null
            val halfLife = pharmacokinetics[peptideId] ?: return@mapNotNull null
            require(halfLife.isFinite() && halfLife > 0) { "Catalog half-life must be a finite positive number." }
            val percentage = group.sumOf { (_, time) ->
                val elapsed = Duration.between(time, now).toMillis() / 3_600_000.0
                CatalogCalculations.calculateDecay(halfLife, elapsed)
            }.coerceAtMost(100.0)
            ConcentrationLevel(
                peptideName = first.name,
                peptideId = peptideId,
                percentage = percentage,
                status = when {
                    percentage > 40 -> "higher"
                    percentage > 10 -> "declining"
                    else -> "low"
                },
                lastDoseTime = group.maxOf { it.second },
                halfLifeHours = halfLife,
            )
        }.sortedByDescending { it.percentage }
    }
}

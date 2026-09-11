package com.nof1.experiments.nativeapp.catalog

import java.util.Locale
import kotlin.math.floor
import kotlin.math.pow

data class ReconstitutionResult(
    val concentrationMcgPerMl: Double,
    val volumePerDoseMl: Double,
    val unitsPerDose: Double,
    val dosesPerVial: Double,
)

data class DecayPoint(val hour: Double, val percentage: Double)

object CatalogCalculations {
    fun reconstitute(peptideMg: Double, waterMl: Double, doseMcg: Double): ReconstitutionResult {
        require(peptideMg.isFinite() && peptideMg > 0) { "Peptide amount must be a finite number greater than zero." }
        require(waterMl.isFinite() && waterMl > 0) { "Water volume must be a finite number greater than zero." }
        require(doseMcg.isFinite() && doseMcg > 0) { "Dose must be a finite number greater than zero." }
        val totalMcg = peptideMg * 1000
        require(totalMcg.isFinite()) { "Peptide amount is too large to calculate." }
        require(doseMcg <= totalMcg) { "Dose cannot exceed the amount in the vial." }
        val concentration = totalMcg / waterMl
        val volume = doseMcg / concentration
        val units = floor(volume * 100 + 0.5)
        val doses = floor(totalMcg / doseMcg)
        require(concentration.isFinite() && concentration > 0 && volume.isFinite() && volume > 0 &&
            units.isFinite() && doses.isFinite()) { "These values are outside the calculator's supported range." }
        return ReconstitutionResult(concentration, volume, units, doses)
    }

    fun calculateDecay(halfLifeHours: Double, hoursElapsed: Double): Double {
        require(halfLifeHours.isFinite() && hoursElapsed.isFinite()) { "Half-life and elapsed time must be finite numbers." }
        if (halfLifeHours <= 0 || hoursElapsed < 0) return 0.0
        return 100 * 0.5.pow(hoursElapsed / halfLifeHours)
    }

    fun generateDecayCurve(halfLifeHours: Double, totalHours: Double, points: Int = 12): List<DecayPoint> {
        require(halfLifeHours.isFinite() && halfLifeHours > 0) { "Half-life must be greater than zero." }
        require(totalHours.isFinite() && totalHours >= 0) { "Duration must be a finite nonnegative number." }
        require(points in 2..1000) { "A curve needs between 2 and 1,000 points." }
        val step = totalHours / (points - 1)
        return List(points) { index ->
            val hour = step * index
            DecayPoint(hour, calculateDecay(halfLifeHours, hour))
        }
    }

    fun formatDuration(hours: Double): String {
        require(hours.isFinite() && hours >= 0) { "Duration must be a finite nonnegative number." }
        return when {
            hours < 1 -> "${floor(hours * 60 + 0.5).toLong()} min"
            hours < 48 -> "${floor(hours + 0.5).toLong()} hrs"
            else -> String.format(Locale.ROOT, "%.1f days", hours / 24)
        }
    }
}

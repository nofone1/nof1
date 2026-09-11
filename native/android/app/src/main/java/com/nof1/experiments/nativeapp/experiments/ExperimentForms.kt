package com.nof1.experiments.nativeapp.experiments

import com.nof1.experiments.nativeapp.data.Domain
import com.nof1.experiments.nativeapp.data.Experiment
import com.nof1.experiments.nativeapp.data.ExperimentEntry
import com.nof1.experiments.nativeapp.data.ExperimentInput
import com.nof1.experiments.nativeapp.data.ExperimentMetric
import com.nof1.experiments.nativeapp.data.ExperimentSchedule
import com.nof1.experiments.nativeapp.data.Intervention
import com.nof1.experiments.nativeapp.data.MetricValue
import java.time.LocalDate
import java.time.ZoneOffset
import kotlinx.serialization.json.JsonPrimitive

internal fun experimentInput(
    name: String,
    hypothesis: String,
    interventionName: String,
    dosage: String,
    frequency: String,
    isPeptide: Boolean,
    phaseDuration: String,
    totalCycles: String,
): ExperimentInput {
    val days = phaseDuration.trim().toIntOrNull()
    require(days != null && days > 0) { "Enter a positive whole number of days per phase" }
    val cycles = totalCycles.trim().toIntOrNull()
    require(cycles != null && cycles > 0) { "Enter a positive whole number of on/off cycles" }
    return ExperimentInput(
        name = name.trim(),
        hypothesis = hypothesis.trim(),
        intervention = Intervention(Domain.newId(), interventionName.trim(), if (isPeptide) "peptide" else "supplement", dosage.trim(), frequency.trim()),
        metrics = listOf(ExperimentMetric(Domain.newId(), "Energy Level", "scale", "Overall energy and alertness throughout the day", 1.0, 10.0)),
        schedule = ExperimentSchedule(Domain.nowIso(), days.toDouble(), cycles.toDouble()),
    ).also { Domain.validate(it) }
}

internal fun experimentEntry(
    experiment: Experiment,
    date: String,
    isInterventionDay: Boolean,
    values: Map<String, String>,
    notes: String,
): ExperimentEntry {
    require(experiment.status in setOf("active", "paused")) { "Entries can only be added to active or paused experiments" }
    val day = try { LocalDate.parse(date.trim()) } catch (_: Exception) {
        throw IllegalArgumentException("Enter the entry date as YYYY-MM-DD (UTC)")
    }
    require(!day.isAfter(LocalDate.now(ZoneOffset.UTC))) { "An observation cannot be dated in the future" }
    val metricValues = experiment.metrics.map { metric ->
        val raw = values[metric.id].orEmpty().trim()
        require(raw.isNotEmpty()) { "Enter a value for ${metric.name}" }
        val value = when (metric.type) {
            "boolean" -> {
                require(raw == "true" || raw == "false") { "Choose Yes or No for ${metric.name}" }
                JsonPrimitive(raw.toBoolean())
            }
            "text" -> JsonPrimitive(raw)
            "scale", "number" -> {
                val number = raw.toDoubleOrNull()
                require(number != null && number.isFinite()) { "Enter a finite number for ${metric.name}" }
                require(metric.minValue == null || number >= metric.minValue) { "${metric.name} must be at least ${metric.minValue}" }
                require(metric.maxValue == null || number <= metric.maxValue) { "${metric.name} must be at most ${metric.maxValue}" }
                JsonPrimitive(number)
            }
            else -> throw IllegalArgumentException("${metric.name} has an unsupported metric type")
        }
        MetricValue(metric.id, value)
    }
    require(metricValues.isNotEmpty() || notes.isNotBlank()) { "Record a metric value or add an observation in notes" }
    return ExperimentEntry(
        id = Domain.newId(),
        experimentId = experiment.id,
        date = day.atStartOfDay().toInstant(ZoneOffset.UTC).toString(),
        isInterventionDay = isInterventionDay,
        metricValues = metricValues,
        notes = notes.trim().takeIf { it.isNotEmpty() },
        createdAt = Domain.nowIso(),
    ).also { Domain.validate(it, experiment.metrics) }
}

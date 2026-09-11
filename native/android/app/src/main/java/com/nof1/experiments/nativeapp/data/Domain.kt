package com.nof1.experiments.nativeapp.data

import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatterBuilder
import java.time.temporal.ChronoUnit
import java.util.UUID
import kotlin.math.floor
import kotlin.math.roundToInt
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull

data class PhaseInfo(
    val phaseNumber: Int,
    val dayInPhase: Int,
    val isIntervention: Boolean,
    val hasStarted: Boolean,
    val hasEnded: Boolean,
    val totalDays: Double,
)

object Domain {
    private val isoFormatter = DateTimeFormatterBuilder().appendInstant(3).toFormatter()
    val experimentStatuses = setOf("draft", "active", "paused", "completed", "cancelled")
    val metricTypes = setOf("scale", "boolean", "number", "text")
    val quickMetricTypes = setOf(
        "energy", "mood", "sleep", "focus", "stress", "anxiety", "pain", "weight",
        "headache", "nausea", "injection_site_pain", "fatigue", "appetite", "libido", "custom",
    )
    val injectionSites = setOf(
        "abdomen_left", "abdomen_right", "thigh_left", "thigh_right",
        "arm_left", "arm_right", "glute_left", "glute_right",
    )

    fun newId(): String = UUID.randomUUID().toString()

    fun nowIso(): String = isoFormatter.format(Instant.now())

    fun iso(timestamp: String): String = isoFormatter.format(Instant.parse(timestamp))

    fun utcDate(timestamp: String): String = Instant.parse(timestamp).atOffset(ZoneOffset.UTC).toLocalDate().toString()

    fun todayUtc(): String = utcDate(nowIso())

    fun isInProgress(status: String): Boolean = status in setOf("draft", "active", "paused")

    fun progressPercent(experiment: Experiment): Int {
        validate(experiment.schedule)
        val totalDays = experiment.schedule.phaseDurationDays * experiment.schedule.totalPhases * 2
        return (experiment.entries.size / totalDays * 100).roundToInt().coerceIn(0, 100)
    }

    fun phase(schedule: ExperimentSchedule, now: String = nowIso()): PhaseInfo {
        validate(schedule)
        val elapsedDays = ChronoUnit.DAYS.between(
            LocalDate.parse(utcDate(schedule.startDate)),
            LocalDate.parse(utcDate(now)),
        ).toDouble()
        val totalDays = schedule.phaseDurationDays * schedule.totalPhases * 2
        val boundedDay = elapsedDays.coerceIn(0.0, totalDays - 1)
        val index = floor(boundedDay / schedule.phaseDurationDays).toInt()
        return PhaseInfo(
            phaseNumber = index + 1,
            dayInPhase = (boundedDay % schedule.phaseDurationDays).toInt() + 1,
            isIntervention = index % 2 == 0,
            hasStarted = elapsedDays >= 0,
            hasEnded = elapsedDays >= totalDays ||
                (schedule.endDate?.let { !Instant.parse(now).isBefore(Instant.parse(it)) } ?: false),
            totalDays = totalDays,
        )
    }

    fun adherencePercent(protocol: Protocol): Int = if (protocol.adherence.isEmpty()) 0 else
        (protocol.adherence.count { it.taken }.toDouble() / protocol.adherence.size * 100).roundToInt()

    fun validate(schedule: ExperimentSchedule) {
        Instant.parse(schedule.startDate)
        require(schedule.phaseDurationDays.isFinite() && schedule.phaseDurationDays >= 1 &&
            schedule.phaseDurationDays % 1.0 == 0.0) { "Phase duration must be a positive whole number of days" }
        require(schedule.totalPhases.isFinite() && schedule.totalPhases >= 1 &&
            schedule.totalPhases % 1.0 == 0.0) { "Total phases must be a positive whole number" }
        require(schedule.phaseDurationDays * schedule.totalPhases * 2 <= Int.MAX_VALUE) { "Schedule is too long" }
        schedule.endDate?.let {
            require(!Instant.parse(it).isBefore(Instant.parse(schedule.startDate))) { "End date cannot precede start date" }
        }
        schedule.reminderTime?.let { LocalTime.parse(it) }
    }

    fun validate(input: ExperimentInput) {
        require(input.name.isNotBlank()) { "Please enter an experiment name" }
        require(input.hypothesis.isNotBlank()) { "Please enter your hypothesis" }
        require(input.intervention.name.isNotBlank()) { "Please enter what you're testing" }
        require(input.intervention.dosage.isNotBlank()) { "Please enter the dosage" }
        require(input.status in experimentStatuses) { "Unknown experiment status" }
        require(input.intervention.type in setOf("supplement", "peptide", "medication", "lifestyle", "diet", "other")) {
            "Unknown intervention type"
        }
        validate(input.schedule)
        require(input.metrics.map { it.id }.distinct().size == input.metrics.size) { "Metric IDs must be unique" }
        input.metrics.forEach {
            require(it.name.isNotBlank() && it.type in metricTypes) { "A metric needs a name and a valid type" }
            require(it.minValue?.isFinite() != false && it.maxValue?.isFinite() != false) { "Metric bounds must be finite" }
            require(it.minValue == null || it.maxValue == null || it.minValue <= it.maxValue) { "Metric minimum exceeds maximum" }
        }
    }

    fun validate(input: ProtocolInput) {
        require(input.name.isNotBlank() && input.peptideName.isNotBlank() && input.dosage.isNotBlank()) {
            "Please enter a protocol name, peptide name, and dosage"
        }
        Instant.parse(input.startDate)
        input.endDate?.let {
            require(!Instant.parse(it).isBefore(Instant.parse(input.startDate))) { "End date cannot precede start date" }
        }
    }

    fun validate(input: DoseInput) {
        require(input.name.isNotBlank() && input.dosage.isNotBlank()) { "Please enter a name and dosage" }
        Instant.parse(input.timestamp)
        require(input.injectionSite == null || input.injectionSite in injectionSites) { "Unknown injection site" }
    }

    fun validate(input: MetricInput) {
        require(input.metricType in quickMetricTypes) { "Unknown metric type" }
        require(input.value.isFinite()) { "Metric value must be finite" }
        require(input.numericValue?.isFinite() != false) { "Numeric value must be finite" }
        if (input.metricType != "weight") {
            require(input.value in 1.0..10.0) { "Rating must be between 1 and 10" }
        } else {
            require((input.numericValue ?: input.value) > 0) { "Weight must be positive" }
        }
        Instant.parse(input.timestamp)
    }

    fun validate(input: StackInput) {
        require(input.name.isNotBlank() && input.dosage.isNotBlank()) { "Please enter a name and dosage" }
        Instant.parse(input.addedAt)
    }

    fun validate(entry: AdherenceEntry) {
        LocalDate.parse(entry.date)
        require(!(entry.taken && entry.skipped == true)) { "An entry cannot be both taken and skipped" }
    }

    fun validate(entry: ExperimentEntry, metrics: List<ExperimentMetric>? = null) {
        Instant.parse(entry.date)
        Instant.parse(entry.createdAt)
        require(entry.metricValues.map { it.metricId }.distinct().size == entry.metricValues.size) { "Metric IDs must be unique" }
        entry.metricValues.forEach { recorded ->
            require(recorded.value != JsonNull) { "Metric value cannot be null" }
            if (!recorded.value.isString && recorded.value.booleanOrNull == null) {
                require(recorded.value.doubleOrNull?.isFinite() == true) { "Metric value must be finite" }
            }
            if (metrics != null) {
                val metric = metrics.find { it.id == recorded.metricId }
                    ?: throw IllegalArgumentException("Unknown experiment metric")
                when (metric.type) {
                    "boolean" -> require(!recorded.value.isString && recorded.value.booleanOrNull != null) { "Expected a boolean metric" }
                    "text" -> require(recorded.value.isString) { "Expected a text metric" }
                    "scale", "number" -> {
                        val number = recorded.value.takeUnless { it.isString }?.doubleOrNull
                            ?: throw IllegalArgumentException("Expected a numeric metric")
                        require(metric.minValue == null || number >= metric.minValue) { "Metric value is below its minimum" }
                        require(metric.maxValue == null || number <= metric.maxValue) { "Metric value exceeds its maximum" }
                    }
                    else -> throw IllegalArgumentException("Unknown experiment metric type")
                }
            }
        }
    }
}

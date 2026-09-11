package com.nof1.experiments.nativeapp.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonPrimitive

@Serializable
data class Intervention(
    val id: String,
    val name: String,
    val type: String = "supplement",
    val dosage: String,
    val frequency: String = "Once daily",
    val instructions: String? = null,
)

@Serializable
data class ExperimentMetric(
    val id: String,
    val name: String,
    val type: String = "scale",
    val description: String? = null,
    val minValue: Double? = null,
    val maxValue: Double? = null,
    val unit: String? = null,
)

@Serializable
data class ExperimentSchedule(
    val startDate: String,
    val phaseDurationDays: Double = 7.0,
    val totalPhases: Double = 4.0,
    val endDate: String? = null,
    val reminderTime: String? = null,
)

@Serializable
data class MetricValue(val metricId: String, val value: JsonPrimitive)

@Serializable
data class ExperimentEntry(
    val id: String,
    val experimentId: String,
    val date: String,
    val isInterventionDay: Boolean,
    val metricValues: List<MetricValue> = emptyList(),
    val notes: String? = null,
    val createdAt: String,
)

@Serializable
data class Experiment(
    val id: String,
    val userId: String,
    val name: String,
    val hypothesis: String,
    val intervention: Intervention,
    val metrics: List<ExperimentMetric>,
    val schedule: ExperimentSchedule,
    val status: String,
    val entries: List<ExperimentEntry> = emptyList(),
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class ExperimentInput(
    val name: String,
    val hypothesis: String,
    val intervention: Intervention,
    val metrics: List<ExperimentMetric>,
    val schedule: ExperimentSchedule,
    val status: String = "active",
    val id: String = Domain.newId(),
)

@Serializable
data class AdherenceEntry(
    val date: String,
    val taken: Boolean,
    val skipped: Boolean? = null,
    val notes: String? = null,
)

@Serializable
data class Protocol(
    val id: String,
    val userId: String,
    val name: String,
    val peptideId: String? = null,
    val peptideName: String,
    val dosage: String,
    val frequency: String,
    val route: String,
    val cycleDuration: String,
    val startDate: String,
    val endDate: String? = null,
    val isActive: Boolean,
    val notes: String? = null,
    val adherence: List<AdherenceEntry> = emptyList(),
    val createdAt: String,
)

@Serializable
data class ProtocolInput(
    val name: String,
    val peptideName: String,
    val dosage: String,
    val startDate: String,
    val peptideId: String? = null,
    val frequency: String = "Once daily",
    val route: String = "Subcutaneous",
    val cycleDuration: String = "4 weeks",
    val endDate: String? = null,
    val notes: String? = null,
    val isActive: Boolean = true,
    val id: String = Domain.newId(),
)

@Serializable
data class Dose(
    val id: String,
    val peptideId: String?,
    val name: String,
    val dosage: String,
    val timestamp: String,
    val notes: String? = null,
    val injectionSite: String? = null,
    val userId: String? = null,
)

@Serializable
data class DoseInput(
    val name: String,
    val dosage: String,
    val peptideId: String? = null,
    val timestamp: String = Domain.nowIso(),
    val notes: String? = null,
    val injectionSite: String? = null,
    val id: String = Domain.newId(),
)

@Serializable
data class Metric(
    val id: String,
    val metricType: String,
    val value: Double,
    val timestamp: String,
    val customName: String? = null,
    val notes: String? = null,
    val unit: String? = null,
    val numericValue: Double? = null,
    val userId: String? = null,
)

@Serializable
data class MetricInput(
    val metricType: String,
    val value: Double,
    val timestamp: String = Domain.nowIso(),
    val customName: String? = null,
    val notes: String? = null,
    val unit: String? = null,
    val numericValue: Double? = null,
    val id: String = Domain.newId(),
)

@Serializable
data class StackItem(
    val id: String,
    val peptideId: String?,
    val name: String,
    val dosage: String,
    val frequency: String,
    val isActive: Boolean,
    val addedAt: String,
    val timeOfDay: String? = null,
    val userId: String? = null,
)

@Serializable
data class StackInput(
    val name: String,
    val dosage: String,
    val peptideId: String? = null,
    val frequency: String = "Once daily",
    val timeOfDay: String? = null,
    val isActive: Boolean = true,
    val addedAt: String = Domain.nowIso(),
    val id: String = Domain.newId(),
)

@Serializable
data class TrackingData(
    val doses: List<Dose>,
    val metrics: List<Metric>,
    val stack: List<StackItem>,
)

@Serializable
data class AccessSource(
    val provider: String,
    val status: String,
    val productId: String? = null,
    val expiresAt: String? = null,
)

@Serializable
data class PlusAccess(
    val entitlement: String = "nof1_plus",
    val hasPlus: Boolean,
    val sources: List<AccessSource>,
    val primarySource: String? = null,
    val expiresAt: String? = null,
    val inGracePeriod: Boolean,
    val hasMultipleActiveProviders: Boolean,
)

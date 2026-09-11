package com.nof1.experiments.nativeapp.protocols

import com.nof1.experiments.nativeapp.data.Domain
import com.nof1.experiments.nativeapp.data.Protocol
import com.nof1.experiments.nativeapp.data.ProtocolInput

internal fun protocolInput(
    name: String,
    peptideId: String?,
    peptideName: String,
    dosage: String,
    frequency: String,
    route: String,
    cycleDuration: String,
    notes: String,
    existing: Protocol? = null,
): ProtocolInput = ProtocolInput(
    name = name.trim(),
    peptideId = if (existing != null) existing.peptideId else peptideId,
    peptideName = peptideName.trim(),
    dosage = dosage.trim(),
    frequency = frequency.trim().ifBlank { "Once daily" },
    route = route.trim().ifBlank { "Subcutaneous" },
    cycleDuration = cycleDuration.trim().ifBlank { "4 weeks" },
    startDate = existing?.startDate ?: Domain.nowIso(),
    endDate = existing?.endDate,
    notes = notes.trim().takeIf { it.isNotEmpty() },
    isActive = existing?.isActive ?: true,
    id = existing?.id ?: Domain.newId(),
).also { Domain.validate(it) }

internal fun protocolUpdates(input: ProtocolInput): Map<String, Any?> = mapOf(
    "name" to input.name,
    "peptideName" to input.peptideName,
    "dosage" to input.dosage,
    "frequency" to input.frequency,
    "route" to input.route,
    "cycleDuration" to input.cycleDuration,
    "notes" to input.notes.orEmpty(),
)

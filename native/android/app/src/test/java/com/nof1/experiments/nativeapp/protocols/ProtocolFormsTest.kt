package com.nof1.experiments.nativeapp.protocols

import com.nof1.experiments.nativeapp.data.AdherenceEntry
import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.data.Domain
import com.nof1.experiments.nativeapp.data.Protocol
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class ProtocolFormsTest {
    private val existing = Protocol(
        id = "arbitrary-protocol-id", userId = "synthetic-test-user", name = "Original", peptideId = "catalog-id",
        peptideName = "Synthetic", dosage = "test dose", frequency = "Twice daily", route = "Custom route",
        cycleDuration = "8 weeks", startDate = "2026-01-01T00:00:00Z", endDate = "2026-03-01T00:00:00Z",
        isActive = false, notes = "Original notes", adherence = listOf(AdherenceEntry("2026-01-02", true)), createdAt = "2026-01-01T00:00:00Z",
    )

    @Test fun createUsesSourceDefaultsAndOmitsAbsentFields() {
        val input = protocolInput(" Plan ", null, " Custom ", " dose ", "", "", "", " ")
        assertEquals("Plan", input.name)
        assertEquals("Once daily", input.frequency)
        assertEquals("Subcutaneous", input.route)
        assertEquals("4 weeks", input.cycleDuration)
        assertTrue(input.isActive)
        val call = Api.createProtocol(input)
        assertEquals("protocols:create", call.path)
        val payload = call.args["input"] as Map<*, *>
        listOf("peptideId", "notes", "endDate", "userId").forEach { assertFalse(payload.containsKey(it)) }
    }

    @Test fun editingPreservesCatalogAssociationAndSchedule() {
        val input = protocolInput("Edited", null, "Synthetic", "new dose", "daily", "oral", "6 weeks", "", existing)
        assertEquals(existing.id, input.id)
        assertEquals(existing.peptideId, input.peptideId)
        assertEquals(existing.startDate, input.startDate)
        assertEquals(existing.endDate, input.endDate)
        assertFalse(input.isActive)
        val updates = protocolUpdates(input)
        listOf("id", "userId", "createdAt", "peptideId", "startDate", "endDate", "isActive", "adherence").forEach { assertFalse(updates.containsKey(it)) }
        assertEquals("", updates["notes"])
        assertEquals("new dose", updates["dosage"])
        assertEquals("protocols:update", Api.updateProtocol(existing.id, updates).path)
    }

    @Test fun requiredFieldsRejectEmptyValues() {
        assertThrows(IllegalArgumentException::class.java) { protocolInput(" ", null, "Name", "dose", "", "", "", "") }
        assertThrows(IllegalArgumentException::class.java) { protocolInput("Plan", null, " ", "dose", "", "", "", "") }
        assertThrows(IllegalArgumentException::class.java) { protocolInput("Plan", null, "Name", " ", "", "", "", "") }
    }

    @Test fun adherenceUsesUtcDateAndLoggedOutcomeDenominator() {
        val taken = Api.logAdherence(existing.id, AdherenceEntry(Domain.utcDate("2026-01-02T23:30:00-08:00"), true))
        assertEquals("protocols:logAdherence", taken.path)
        assertEquals("2026-01-03", (taken.args["entry"] as Map<*, *>)["date"])
        val skipped = Api.logAdherence(existing.id, AdherenceEntry("2026-01-04", false, true))
        assertEquals(false, (skipped.args["entry"] as Map<*, *>)["taken"])
        assertEquals(true, (skipped.args["entry"] as Map<*, *>)["skipped"])
        assertEquals(50, Domain.adherencePercent(existing.copy(adherence = existing.adherence + AdherenceEntry("2026-01-04", false, true))))
    }
}

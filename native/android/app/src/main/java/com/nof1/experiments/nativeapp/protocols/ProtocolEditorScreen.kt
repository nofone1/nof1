package com.nof1.experiments.nativeapp.protocols

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.material3.Text
import com.nof1.experiments.nativeapp.Nof1ViewModel
import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.data.Protocol
import com.nof1.experiments.nativeapp.experiments.CatalogSelection
import com.nof1.experiments.nativeapp.experiments.ExperimentField
import com.nof1.experiments.nativeapp.experiments.rememberFormCatalog
import com.nof1.experiments.nativeapp.ui.ActionButton
import com.nof1.experiments.nativeapp.ui.LoadContent
import com.nof1.experiments.nativeapp.ui.MedicalNotice
import com.nof1.experiments.nativeapp.ui.ScreenColumn
import com.nof1.experiments.nativeapp.ui.Section

@Composable
fun ProtocolEditorScreen(vm: Nof1ViewModel, id: String? = null, peptideId: String? = null, onSaved: () -> Unit) {
    val state by vm.protocols.collectAsState()
    ScreenColumn(if (id == null) "New protocol" else "Edit protocol", "Record your plan and track adherence") {
        if (id == null) {
            ProtocolEditor(vm, null, peptideId, onSaved)
        } else {
            LoadContent(state) { protocols ->
                val existing = protocols.find { it.id == id }
                if (existing == null) Text("This protocol is no longer available.")
                else ProtocolEditor(vm, existing, null, onSaved)
            }
        }
    }
}

@Composable
private fun ProtocolEditor(vm: Nof1ViewModel, existing: Protocol?, peptideId: String?, onSaved: () -> Unit) {
    val busy by vm.busy.collectAsState()
    val catalog = rememberFormCatalog()
    var selectedId by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.peptideId ?: peptideId) }
    var initialized by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing != null || peptideId == null) }
    var name by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.name.orEmpty()) }
    var peptideName by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.peptideName.orEmpty()) }
    var dosage by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.dosage.orEmpty()) }
    var frequency by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.frequency.orEmpty()) }
    var route by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.route.orEmpty()) }
    var cycle by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.cycleDuration.orEmpty()) }
    var notes by rememberSaveable(existing?.id, peptideId) { mutableStateOf(existing?.notes.orEmpty()) }
    LaunchedEffect(catalog, peptideId) {
        if (!initialized && catalog?.isSuccess == true) {
            catalog.getOrThrow().find { it.id == peptideId }?.let {
                name = "${it.name} Protocol"
                peptideName = it.name
            }
            initialized = true
        }
    }
    Section("Peptide selection") {
        if (existing == null) {
            CatalogSelection(catalog, selectedId, !busy) { item ->
                selectedId = item?.id
                initialized = true
                peptideName = item?.name.orEmpty()
                if (item != null) name = "${item.name} Protocol"
                dosage = ""
                frequency = ""
                route = ""
                cycle = ""
            }
        } else {
            Text(existing.peptideName)
            Text("The saved catalog association is kept when editing. Create a new protocol to use a different catalog item or custom intervention.")
        }
    }
    Section("Protocol details") {
        ExperimentField("Protocol name", name, !busy, "protocol-name") { name = it }
        if (selectedId == null) ExperimentField("Peptide or supplement name", peptideName, !busy, "protocol-peptide-name") { peptideName = it }
        ExperimentField("Dosage", dosage, !busy, "protocol-dosage") { dosage = it }
        ExperimentField("Frequency", frequency, !busy, "protocol-frequency") { frequency = it }
        ExperimentField("Route", route, !busy, "protocol-route") { route = it }
        ExperimentField("Cycle duration", cycle, !busy, "protocol-cycle") { cycle = it }
        Text("If left blank: frequency is Once daily, route is Subcutaneous, and cycle duration is 4 weeks. These are form defaults, not medical recommendations.")
        ExperimentField("Notes (optional)", notes, !busy, "protocol-notes", multiline = true) { notes = it }
        if (existing != null) {
            Text("Started: ${existing.startDate.take(10)} (UTC)")
            existing.endDate?.let { Text("Ends: ${it.take(10)} (UTC)") }
        } else Text("Starts today when saved.")
    }
    MedicalNotice()
    ActionButton(if (busy) "Saving…" else if (existing == null) "Start protocol" else "Save protocol", !busy) {
        vm.submit({
            require(existing != null || selectedId == null || catalog?.getOrNull()?.any { it.id == selectedId } == true) { "Select an available catalog item or use a custom intervention" }
            val input = protocolInput(name, selectedId, peptideName, dosage, frequency, route, cycle, notes, existing)
            if (existing == null) Api.createProtocol(input) else Api.updateProtocol(existing.id, protocolUpdates(input))
        }, onSaved)
    }
}

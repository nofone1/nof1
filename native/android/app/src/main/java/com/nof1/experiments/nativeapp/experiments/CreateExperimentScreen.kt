package com.nof1.experiments.nativeapp.experiments

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import com.nof1.experiments.nativeapp.Nof1ViewModel
import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.ui.ActionButton
import com.nof1.experiments.nativeapp.ui.MedicalNotice
import com.nof1.experiments.nativeapp.ui.ScreenColumn
import com.nof1.experiments.nativeapp.ui.Section

@Composable
fun CreateExperimentScreen(vm: Nof1ViewModel, peptideId: String?, onSaved: () -> Unit) {
    val busy by vm.busy.collectAsState()
    val catalog = rememberFormCatalog()
    var selectedId by rememberSaveable(peptideId) { mutableStateOf(peptideId) }
    var initialized by rememberSaveable(peptideId) { mutableStateOf(peptideId == null) }
    var name by rememberSaveable(peptideId) { mutableStateOf("") }
    var hypothesis by rememberSaveable(peptideId) { mutableStateOf("") }
    var interventionName by rememberSaveable(peptideId) { mutableStateOf("") }
    var dosage by rememberSaveable(peptideId) { mutableStateOf("") }
    var frequency by rememberSaveable(peptideId) { mutableStateOf("Once daily") }
    var phaseDuration by rememberSaveable(peptideId) { mutableStateOf("7") }
    var totalCycles by rememberSaveable(peptideId) { mutableStateOf("4") }
    LaunchedEffect(catalog, peptideId) {
        if (!initialized && catalog?.isSuccess == true) {
            catalog.getOrThrow().find { it.id == peptideId }?.let { item ->
                interventionName = item.name
                name = "Testing ${item.name}"
                hypothesis = "Testing the effects of ${item.name} on my health and wellbeing."
                dosage = ""
                frequency = ""
            }
            initialized = true
        }
    }
    ScreenColumn("New experiment", "Test what works for you with on/off phases") {
        Section("Basic information") {
            ExperimentField("Experiment name", name, !busy, "experiment-name") { name = it }
            ExperimentField("Hypothesis", hypothesis, !busy, "experiment-hypothesis", multiline = true) { hypothesis = it }
        }
        Section("What you're testing") {
            CatalogSelection(catalog, selectedId, !busy) { item ->
                selectedId = item?.id
                initialized = true
                interventionName = item?.name.orEmpty()
                dosage = ""
                frequency = if (item == null) "Once daily" else ""
            }
            if (selectedId == null) ExperimentField("Supplement or intervention name", interventionName, !busy, "intervention-name") { interventionName = it }
            ExperimentField("Dosage", dosage, !busy, "experiment-dosage") { dosage = it }
            ExperimentField("Frequency", frequency, !busy, "experiment-frequency") { frequency = it }
        }
        Section("Schedule") {
            ExperimentField("Phase duration (days)", phaseDuration, !busy, "phase-duration", numeric = true) { phaseDuration = it }
            ExperimentField("Total on/off cycles", totalCycles, !busy, "total-cycles", numeric = true) { totalCycles = it }
            Text("Each cycle includes one on-intervention phase and one off-intervention phase. Starts today.")
            Text("Reminders are unavailable; this app will not schedule notifications.")
        }
        Section("Metric to record") {
            Text("Energy Level · 1–10")
            Text("Overall energy and alertness throughout the day")
        }
        Text("Free accounts may have one draft, active, or paused experiment. Account limits are checked on save.")
        MedicalNotice()
        ActionButton(if (busy) "Saving…" else "Start experiment", !busy) {
            vm.submit({
                require(selectedId == null || catalog?.getOrNull()?.any { it.id == selectedId } == true) { "Select an available catalog item or use a custom intervention" }
                Api.createExperiment(experimentInput(name, hypothesis, interventionName, dosage, frequency, selectedId != null, phaseDuration, totalCycles))
            }, onSaved)
        }
    }
}

@Composable
internal fun ExperimentField(
    label: String,
    value: String,
    enabled: Boolean,
    tag: String,
    multiline: Boolean = false,
    numeric: Boolean = false,
    onChange: (String) -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        enabled = enabled,
        modifier = Modifier.fillMaxWidth().testTag(tag),
        singleLine = !multiline,
        minLines = if (multiline) 3 else 1,
        keyboardOptions = KeyboardOptions(keyboardType = if (numeric) KeyboardType.Decimal else KeyboardType.Text),
    )
}

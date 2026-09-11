package com.nof1.experiments.nativeapp.experiments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.nof1.experiments.nativeapp.Nof1ViewModel
import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.data.Domain
import com.nof1.experiments.nativeapp.ui.ActionButton
import com.nof1.experiments.nativeapp.ui.LoadContent
import com.nof1.experiments.nativeapp.ui.ScreenColumn
import com.nof1.experiments.nativeapp.ui.Section

@Composable
fun ExperimentEntryScreen(vm: Nof1ViewModel, id: String, onSaved: () -> Unit) {
    val state by vm.experiments.collectAsState()
    val busy by vm.busy.collectAsState()
    ScreenColumn("Record observation", "Save actual metric values, not a placeholder log") {
        LoadContent(state) { experiments ->
            val experiment = experiments.find { it.id == id }
            if (experiment == null) {
                Text("This experiment is no longer available.")
                return@LoadContent
            }
            if (experiment.status !in setOf("active", "paused")) {
                Text("This experiment is not active or paused. Its existing entries can be viewed in the experiment details.")
                return@LoadContent
            }
            var date by remember(id) { mutableStateOf(Domain.todayUtc()) }
            var values by remember(id) { mutableStateOf(emptyMap<String, String>()) }
            var notes by remember(id) { mutableStateOf("") }
            var intervention by remember(id) { mutableStateOf(runCatching { Domain.phase(experiment.schedule).isIntervention }.getOrDefault(true)) }
            Section(experiment.name) {
                ExperimentField("Observation date (YYYY-MM-DD, UTC)", date, !busy, "entry-date") { date = it }
                Text("Did you use the intervention on this date?")
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    FilterChip(intervention, { intervention = true }, enabled = !busy, label = { Text("On intervention") })
                    FilterChip(!intervention, { intervention = false }, enabled = !busy, label = { Text("Off intervention") })
                }
                Text("Confirm the actual on/off status if you change the observation date.")
            }
            experiment.metrics.forEach { metric ->
                Section(metric.name) {
                    metric.description?.let { Text(it) }
                    val raw = values[metric.id].orEmpty()
                    if (metric.type == "boolean") {
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            FilterChip(raw == "true", { values = values + (metric.id to "true") }, enabled = !busy, label = { Text("Yes") }, modifier = Modifier.testTag("metric-${metric.id}-yes"))
                            FilterChip(raw == "false", { values = values + (metric.id to "false") }, enabled = !busy, label = { Text("No") }, modifier = Modifier.testTag("metric-${metric.id}-no"))
                        }
                    } else {
                        ExperimentField(
                            label = metric.name + metric.unit?.let { " ($it)" }.orEmpty(), value = raw, enabled = !busy,
                            tag = "metric-${metric.id}", multiline = metric.type == "text", numeric = metric.type in setOf("scale", "number"),
                        ) { values = values + (metric.id to it) }
                        metric.minValue?.let { Text("Minimum: $it") }
                        metric.maxValue?.let { Text("Maximum: $it") }
                    }
                }
            }
            Section("Notes") {
                ExperimentField("Observations (optional)", notes, !busy, "entry-notes", multiline = true) { notes = it }
            }
            ActionButton(if (busy) "Saving…" else "Save entry", !busy) {
                vm.submit({ Api.addEntry(id, experimentEntry(experiment, date, intervention, values, notes)) }, onSaved)
            }
        }
    }
}

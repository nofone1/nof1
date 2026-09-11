package com.nof1.experiments.nativeapp.experiments

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.nof1.experiments.nativeapp.Nof1ViewModel
import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.data.Domain
import com.nof1.experiments.nativeapp.data.Experiment
import com.nof1.experiments.nativeapp.ui.ActionButton
import com.nof1.experiments.nativeapp.ui.LoadContent
import com.nof1.experiments.nativeapp.ui.MedicalNotice
import com.nof1.experiments.nativeapp.ui.ScreenColumn
import com.nof1.experiments.nativeapp.ui.Section

@Composable
fun ExperimentsScreen(vm: Nof1ViewModel, onCreate: () -> Unit, onOpen: (String) -> Unit) {
    val state by vm.experiments.collectAsState()
    val busy by vm.busy.collectAsState()
    ScreenColumn("Experiments", "Run controlled self-experiments") {
        Section("Your personal trial") {
            Text("Alternate on and off phases, recording the same metrics in each to compare your observations.")
            Text("Free accounts can have one draft, active, or paused experiment at a time. Your account access is checked when you save.")
        }
        ActionButton("New experiment", !busy, onCreate)
        LoadContent(state) { experiments ->
            Text("${experiments.count { it.status == "active" }} active · ${experiments.size} total")
            if (experiments.isEmpty()) {
                Section("No experiments yet") { Text("Create your first experiment to track an intervention and its on/off phases.") }
            }
            experiments.forEach { experiment ->
                Section(experiment.name) {
                    Text(experiment.status.replaceFirstChar { it.titlecase() }, color = MaterialTheme.colorScheme.primary)
                    Text("${experiment.intervention.name} · ${experiment.intervention.dosage}")
                    Text(experiment.hypothesis)
                    ExperimentProgress(experiment)
                    ActionButton("Open ${experiment.name}", !busy) { onOpen(experiment.id) }
                }
            }
        }
        MedicalNotice()
    }
}

@Composable
fun ExperimentDetailScreen(vm: Nof1ViewModel, id: String, onAddEntry: () -> Unit, onDeleted: () -> Unit) {
    val state by vm.experiments.collectAsState()
    val busy by vm.busy.collectAsState()
    var confirmation by remember(id) { mutableStateOf<String?>(null) }
    ScreenColumn("Experiment details") {
        LoadContent(state) { experiments ->
            val experiment = experiments.find { it.id == id }
            if (experiment == null) {
                Text("This experiment is no longer available.")
                return@LoadContent
            }
            Section(experiment.name) {
                Text(experiment.status.replaceFirstChar { it.titlecase() }, color = MaterialTheme.colorScheme.primary)
                Text("${experiment.intervention.name} · ${experiment.intervention.dosage} · ${experiment.intervention.frequency}")
                experiment.intervention.instructions?.let { Text(it) }
            }
            if (experiment.status in setOf("active", "paused")) {
                ActionButton("Log today's entry", !busy, onAddEntry)
            }
            Section("Hypothesis") { Text(experiment.hypothesis) }
            Section("Phase progress") { ExperimentProgress(experiment) }
            Section("Schedule") {
                Text("${experiment.schedule.phaseDurationDays.toInt()} days per phase · ${experiment.schedule.totalPhases.toInt()} on/off cycles")
                Text("Started: ${experiment.schedule.startDate.take(10)} (UTC)")
                experiment.schedule.endDate?.let { Text("Ends: ${it.take(10)} (UTC)") }
                Text("Reminders are unavailable in the native app; no notifications are scheduled.")
            }
            Section("Metrics") {
                if (experiment.metrics.isEmpty()) Text("No metrics configured.")
                experiment.metrics.forEach { metric ->
                    Text(metric.name, style = MaterialTheme.typography.titleSmall)
                    metric.description?.let { Text(it) }
                    Text(buildString {
                        append(metric.type.replaceFirstChar { it.titlecase() })
                        metric.minValue?.let { append(" · minimum $it") }
                        metric.maxValue?.let { append(" · maximum $it") }
                        metric.unit?.let { append(" · $it") }
                    })
                }
            }
            Section("Recorded entries · ${experiment.entries.size}") {
                if (experiment.entries.isEmpty()) Text("No entries yet. Logging an entry saves your actual metric values.")
                experiment.entries.sortedByDescending { it.date }.forEach { entry ->
                    Text("${entry.date.take(10)} (UTC) · ${if (entry.isInterventionDay) "On intervention" else "Off intervention"}", style = MaterialTheme.typography.titleSmall)
                    entry.metricValues.forEach { value ->
                        val metric = experiment.metrics.find { it.id == value.metricId }
                        Text("${metric?.name ?: value.metricId}: ${value.value.content}${metric?.unit?.let { " $it" }.orEmpty()}")
                    }
                    entry.notes?.let { Text(it) }
                }
            }
            if (Domain.isInProgress(experiment.status)) {
                Section("Manage experiment") {
                    ActionButton(when (experiment.status) { "active" -> "Pause experiment"; "draft" -> "Start experiment"; else -> "Resume experiment" }, !busy) {
                        vm.submit({ Api.updateExperimentStatus(id, if (experiment.status == "active") "paused" else "active") })
                    }
                    ActionButton("Mark as complete", !busy) { confirmation = "completed" }
                    ActionButton("Cancel experiment", !busy) { confirmation = "cancelled" }
                }
            }
            TextButton(onClick = { confirmation = "delete" }, enabled = !busy, modifier = Modifier.testTag("delete-experiment")) {
                Text("Delete experiment", color = MaterialTheme.colorScheme.error)
            }
            MedicalNotice()
        }
    }
    confirmation?.let { action ->
        val label = when (action) { "delete" -> "Delete"; "completed" -> "Complete"; else -> "Cancel experiment" }
        AlertDialog(
            onDismissRequest = { if (!busy) confirmation = null },
            title = { Text("$label?") },
            text = { Text(if (action == "delete") "This permanently removes the experiment and all of its entries. This cannot be undone." else "This ends the experiment. Your recorded entries will be kept.") },
            confirmButton = {
                TextButton(enabled = !busy, onClick = {
                    vm.submit(
                        { if (action == "delete") Api.deleteExperiment(id) else Api.updateExperimentStatus(id, action) },
                        { confirmation = null; if (action == "delete") onDeleted() },
                    )
                }) { Text(label) }
            },
            dismissButton = { TextButton(enabled = !busy, onClick = { confirmation = null }) { Text("Keep experiment") } },
        )
    }
}

@Composable
private fun ExperimentProgress(experiment: Experiment) {
    val phase = runCatching { Domain.phase(experiment.schedule) }.getOrNull()
    if (phase == null) {
        Text("Phase progress is unavailable because this schedule is invalid.", color = MaterialTheme.colorScheme.error)
        return
    }
    Text(when {
        !phase.hasStarted -> "Scheduled · not started"
        phase.hasEnded -> "Scheduled phases finished"
        else -> "Phase ${phase.phaseNumber} of ${experiment.schedule.totalPhases.toInt() * 2} · Day ${phase.dayInPhase} · ${if (phase.isIntervention) "On intervention" else "Off intervention"}"
    })
    val percent = Domain.progressPercent(experiment)
    LinearProgressIndicator(progress = { percent / 100f }, modifier = Modifier.fillMaxWidth())
    Text("${experiment.entries.size} entries · $percent% of ${phase.totalDays.toInt()} planned daily logs")
    if (experiment.status == "paused") Text("Paused status does not shift the calendar-based phase schedule.")
}

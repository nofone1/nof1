package com.nof1.experiments.nativeapp.protocols

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
import com.nof1.experiments.nativeapp.data.AdherenceEntry
import com.nof1.experiments.nativeapp.data.Api
import com.nof1.experiments.nativeapp.data.Domain
import com.nof1.experiments.nativeapp.data.Protocol
import com.nof1.experiments.nativeapp.ui.ActionButton
import com.nof1.experiments.nativeapp.ui.LoadContent
import com.nof1.experiments.nativeapp.ui.MedicalNotice
import com.nof1.experiments.nativeapp.ui.ScreenColumn
import com.nof1.experiments.nativeapp.ui.Section

@Composable
fun ProtocolsScreen(vm: Nof1ViewModel, onCreate: () -> Unit, onEdit: (String) -> Unit) {
    val state by vm.protocols.collectAsState()
    val busy by vm.busy.collectAsState()
    var deleting by remember { mutableStateOf<Protocol?>(null) }
    ScreenColumn("My protocols", "A structured plan with honest adherence tracking") {
        ActionButton("Create protocol", !busy, onCreate)
        LoadContent(state) { protocols ->
            Text("${protocols.count { it.isActive }} active · ${protocols.size} total")
            if (protocols.isEmpty()) Section("No protocols yet") { Text("Create a protocol to record your dosing schedule and taken or skipped outcomes.") }
            protocols.sortedByDescending { it.isActive }.forEach { protocol ->
                Section(protocol.name) {
                    Text(if (protocol.isActive) "Active" else "Paused", color = MaterialTheme.colorScheme.primary)
                    Text("${protocol.peptideName} · ${protocol.dosage} · ${protocol.frequency}")
                    Text("${protocol.route} · ${protocol.cycleDuration}")
                    val percent = Domain.adherencePercent(protocol)
                    LinearProgressIndicator(progress = { percent / 100f }, modifier = Modifier.fillMaxWidth())
                    Text("$percent% adherence · ${protocol.adherence.count { it.taken }} taken / ${protocol.adherence.size} logged outcomes")
                    Text("Adherence measures logged outcomes, not all scheduled days.", style = MaterialTheme.typography.bodySmall)
                    val today = Domain.todayUtc()
                    val todayEntry = protocol.adherence.find { it.date == today }
                    if (todayEntry != null) {
                        Text("$today (UTC): ${if (todayEntry.taken) "Taken" else "Skipped"}", modifier = Modifier.testTag("adherence-${protocol.id}"))
                    }
                    if (protocol.isActive && todayEntry == null) {
                        ActionButton("Taken today", !busy) {
                            vm.submit({ Api.logAdherence(protocol.id, AdherenceEntry(date = Domain.todayUtc(), taken = true)) })
                        }
                        ActionButton("Skip today", !busy) {
                            vm.submit({ Api.logAdherence(protocol.id, AdherenceEntry(date = Domain.todayUtc(), taken = false, skipped = true)) })
                        }
                    }
                    ActionButton("Edit ${protocol.name}", !busy) { onEdit(protocol.id) }
                    ActionButton(if (protocol.isActive) "Pause protocol" else "Resume protocol", !busy) {
                        vm.submit({ Api.toggleProtocol(protocol.id) })
                    }
                    TextButton(enabled = !busy, onClick = { deleting = protocol }, modifier = Modifier.testTag("delete-protocol-${protocol.id}")) {
                        Text("Delete protocol", color = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
        MedicalNotice()
    }
    deleting?.let { protocol ->
        AlertDialog(
            onDismissRequest = { if (!busy) deleting = null },
            title = { Text("Delete ${protocol.name}?") },
            text = { Text("This permanently removes the protocol and its adherence history. This cannot be undone.") },
            confirmButton = {
                TextButton(enabled = !busy, onClick = {
                    vm.submit({ Api.deleteProtocol(protocol.id) }, { deleting = null })
                }) { Text("Delete") }
            },
            dismissButton = { TextButton(enabled = !busy, onClick = { deleting = null }) { Text("Keep protocol") } },
        )
    }
}

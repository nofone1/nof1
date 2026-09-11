package com.nof1.experiments.nativeapp.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nof1.experiments.nativeapp.Nof1ViewModel
import com.nof1.experiments.nativeapp.catalog.ConcentrationSection
import com.nof1.experiments.nativeapp.data.*
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.*

@Composable
fun TodayScreen(vm: Nof1ViewModel, onLog: () -> Unit, onBrowse: () -> Unit, onStack: () -> Unit) {
    val doses by vm.doses.collectAsStateWithLifecycle()
    val metrics by vm.metrics.collectAsStateWithLifecycle()
    val stack by vm.stack.collectAsStateWithLifecycle()
    val busy by vm.busy.collectAsStateWithLifecycle()
    var delete by remember { mutableStateOf<MutationCall?>(null) }
    val today = Domain.todayUtc()
    ScreenColumn("Today", DateTimeFormatter.ofPattern("EEEE, MMMM d").withZone(ZoneOffset.UTC).format(Instant.now()) + " · UTC") {
        ActionButton("Log Entry", onClick = onLog)
        Section("Your daily stack") {
            LoadContent(stack) { items ->
                if (items.isEmpty()) Text("Your stack is empty. Add a peptide or supplement to keep it close at hand.")
                items.forEach { item ->
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(item.name, style = MaterialTheme.typography.titleMedium)
                        Text("${item.dosage} · ${item.frequency}" + (item.timeOfDay?.let { " · $it" } ?: ""))
                        if (item.isActive) ActionButton("Log ${item.name}", !busy) {
                            vm.submit({ Api.logDose(DoseInput(item.name, item.dosage, item.peptideId)) })
                        }
                        Row {
                            TextButton(onClick = { vm.submit({ Api.toggleStackItem(item.id) }) }, enabled = !busy) { Text(if (item.isActive) "Pause" else "Activate") }
                            TextButton(onClick = { delete = Api.removeFromStack(item.id) }, enabled = !busy) { Text("Remove") }
                        }
                    }
                    HorizontalDivider()
                }
            }
            OutlinedButton(onClick = onStack, modifier = Modifier.fillMaxWidth()) { Text("Add to stack") }
        }
        Section("Today's doses") {
            LoadContent(doses) { items ->
                val todays = items.filter { runCatching { Domain.utcDate(it.timestamp) == today }.getOrDefault(false) }
                Text("${todays.size} logged")
                if (todays.isEmpty()) Text("No doses logged today. Your first entry will appear here.")
                todays.forEach { item ->
                    Text("${item.name} · ${item.dosage}", style = MaterialTheme.typography.titleSmall)
                    Text(displayTime(item.timestamp))
                    item.injectionSite?.let { Text(it.replace('_', ' ')) }
                    item.notes?.let { Text(it) }
                    TextButton(onClick = { delete = Api.deleteDose(item.id) }, enabled = !busy) { Text("Delete dose") }
                }
            }
        }
        Section("Today's metrics") {
            LoadContent(metrics) { items ->
                val todays = items.filter { runCatching { Domain.utcDate(it.timestamp) == today }.getOrDefault(false) }
                if (todays.isEmpty()) Text("No metrics yet. Check in with energy, mood, sleep, or a custom measure.")
                todays.forEach { item ->
                    Text("${item.customName ?: label(item.metricType)}: ${item.numericValue ?: item.value}${item.unit?.let { " $it" } ?: if (item.metricType == "weight") "" else " / 10"}")
                    item.notes?.let { Text(it) }
                    TextButton(onClick = { delete = Api.deleteMetric(item.id) }, enabled = !busy) { Text("Delete metric") }
                }
            }
        }
        LoadContent(doses) { entries -> ConcentrationSection(entries) }
        Section("Explore with context") {
            Text("Browse the research library, safety notes, and dosing references before planning an experiment.")
            OutlinedButton(onClick = onBrowse, modifier = Modifier.fillMaxWidth()) { Text("Explore peptides") }
            MedicalNotice()
        }
    }
    delete?.let { call ->
        AlertDialog(onDismissRequest = { delete = null }, title = { Text("Delete this record?") },
            text = { Text("This removes the selected record from ${if (vm.local) "this development profile" else "your account"}.") },
            confirmButton = { TextButton(onClick = { vm.submit({ call }); delete = null }, enabled = !busy) { Text("Delete") } },
            dismissButton = { TextButton(onClick = { delete = null }) { Text("Keep record") } })
    }
}

@Composable
fun QuickLogScreen(vm: Nof1ViewModel, peptideId: String?, initialMode: String, onSaved: () -> Unit, onExperiments: () -> Unit) {
    var mode by rememberSaveable(peptideId, initialMode) { mutableStateOf(initialMode) }
    var selectedId by rememberSaveable(peptideId) { mutableStateOf(peptideId) }
    var name by rememberSaveable(peptideId) { mutableStateOf("") }
    var dosage by rememberSaveable { mutableStateOf("") }
    var notes by rememberSaveable { mutableStateOf("") }
    var frequency by rememberSaveable { mutableStateOf("Once daily") }
    var timeOfDay by rememberSaveable { mutableStateOf("") }
    var site by rememberSaveable { mutableStateOf("none") }
    var addToStack by rememberSaveable { mutableStateOf(false) }
    var metricType by rememberSaveable { mutableStateOf("energy") }
    var rating by rememberSaveable { mutableFloatStateOf(5f) }
    var numeric by rememberSaveable { mutableStateOf("") }
    var unit by rememberSaveable { mutableStateOf("kg") }
    var customName by rememberSaveable { mutableStateOf("") }
    val busy by vm.busy.collectAsStateWithLifecycle()
    val catalog = rememberCatalog()
    LaunchedEffect(peptideId, catalog) {
        if (peptideId != null && name.isEmpty()) name = catalog.getOrNull()?.firstOrNull { it["id"]?.jsonPrimitive?.content == peptideId }?.get("name")?.jsonPrimitive?.content.orEmpty()
    }
    ScreenColumn(if (mode == "stack") "Add to stack" else "Log Entry", "Small observations. Better understanding.") {
        ChoiceRow(listOf("dose", "metric", "experiment", "stack"), mode, { mode = it })
        if (mode == "experiment") {
            Section("Log an experiment entry") {
                Text("Choose an experiment to record its own measures and intervention phase. This saves a real experiment entry.")
                ActionButton("Choose experiment", onClick = onExperiments)
            }
        } else if (mode == "metric") {
            Section("How are you feeling?") {
                ChoiceRow(Domain.quickMetricTypes.toList(), metricType, { metricType = it })
                if (metricType == "custom") Field("Custom metric name", customName, { customName = it })
                if (metricType == "weight") {
                    Field("Weight", numeric, { numeric = it })
                    ChoiceRow(listOf("kg", "lb"), unit, { unit = it })
                } else {
                    Text("${label(metricType)}: ${rating.toInt()} / 10")
                    Slider(rating, { rating = it }, valueRange = 1f..10f, steps = 8,
                        modifier = Modifier.testTag("metric-rating").semantics { contentDescription = "${label(metricType)} rating from 1 to 10" })
                }
                Field("Notes (optional)", notes, { notes = it }, multiline = true)
                ActionButton("Save metric", !busy && (metricType != "custom" || customName.isNotBlank()) && (metricType != "weight" || numeric.toDoubleOrNull()?.let { it > 0 && it.isFinite() } == true)) {
                    vm.submit({ Api.logMetric(MetricInput(metricType, if (metricType == "weight") numeric.toDouble() else rating.toDouble(),
                        customName = customName.takeIf { metricType == "custom" && it.isNotBlank() }, notes = notes.takeIf { it.isNotBlank() },
                        unit = unit.takeIf { metricType == "weight" }, numericValue = numeric.toDoubleOrNull().takeIf { metricType == "weight" })) }, onSaved)
                }
            }
        } else {
            Section(if (mode == "stack") "Your routine" else "Dose details") {
                CatalogPicker(catalog, selectedId) { id, selectedName -> selectedId = id; name = selectedName; site = "none" }
                Field(if (selectedId == null) "Peptide or supplement name" else "Selected compound", name, { name = it; selectedId = null })
                Field("Dosage (include units)", dosage, { dosage = it })
                if (mode == "stack") {
                    Field("Frequency", frequency, { frequency = it })
                    Field("Time of day (optional)", timeOfDay, { timeOfDay = it })
                } else {
                    Text("Injection site (optional)")
                    ChoiceRow(listOf("none") + Domain.injectionSites.toList(), site, { site = it })
                    Field("Notes (optional)", notes, { notes = it }, multiline = true)
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Checkbox(addToStack, { addToStack = it }, enabled = !busy,
                            modifier = Modifier.semantics { contentDescription = "Add to Stack" })
                        Text("Add to Stack")
                    }
                }
                ActionButton(if (mode == "stack") "Save stack item" else "Save dose", !busy && name.isNotBlank() && dosage.isNotBlank()) {
                    if (mode == "stack") vm.submit({ Api.addToStack(StackInput(name.trim(), dosage.trim(), selectedId, frequency.trim(), timeOfDay.takeIf { it.isNotBlank() })) }, onSaved)
                    else vm.logDoseAndStack(
                        DoseInput(name.trim(), dosage.trim(), selectedId, notes = notes.takeIf { it.isNotBlank() }, injectionSite = site.takeUnless { it == "none" }),
                        if (addToStack) StackInput(name.trim(), dosage.trim(), selectedId, "Not specified") else null,
                        onSaved = onSaved,
                        onDoseOnly = { mode = "stack"; addToStack = false },
                    )
                }
            }
        }
        MedicalNotice()
    }
}

@Composable
private fun rememberCatalog(): Result<List<JsonObject>> {
    val context = LocalContext.current
    val result by produceState<Result<List<JsonObject>>>(Result.success(emptyList()), context) {
        value = withContext(Dispatchers.IO) {
            runCatching { context.assets.open("catalog.json").bufferedReader().use { Json.parseToJsonElement(it.readText()).jsonArray.map { item -> item.jsonObject } } }
        }
    }
    return result
}

@Composable
private fun CatalogPicker(catalog: Result<List<JsonObject>>, selectedId: String?, onSelect: (String?, String) -> Unit) {
    var search by rememberSaveable { mutableStateOf("") }
    var expanded by rememberSaveable { mutableStateOf(false) }
    OutlinedButton(onClick = { expanded = !expanded }, modifier = Modifier.fillMaxWidth()) { Text(if (selectedId == null) "Choose from library or enter custom" else "Change compound") }
    if (!expanded) return
    Field("Search compounds", search, { search = it })
    TextButton(onClick = { onSelect(null, ""); expanded = false }) { Text("Use custom entry") }
    catalog.fold(onSuccess = { items ->
        val matches = items.filter { it["name"]?.jsonPrimitive?.content.orEmpty().contains(search, ignoreCase = true) }
        if (items.isEmpty()) Text("Loading catalog…") else if (matches.isEmpty()) Text("No matching compounds")
        matches.take(12).forEach { item ->
            TextButton(onClick = { onSelect(item.getValue("id").jsonPrimitive.content, item.getValue("name").jsonPrimitive.content); expanded = false }, modifier = Modifier.fillMaxWidth()) { Text(item.getValue("name").jsonPrimitive.content) }
        }
        if (matches.size > 12) Text("${matches.size} matches. Narrow your search to see more.")
    }, onFailure = { Text("Catalog unavailable. You can still enter a custom record.", color = MaterialTheme.colorScheme.error) })
}

private fun displayTime(timestamp: String): String = runCatching { DateTimeFormatter.ofPattern("HH:mm 'UTC'").withZone(ZoneOffset.UTC).format(Instant.parse(timestamp)) }.getOrDefault(timestamp)
private fun label(value: String): String = value.replace('_', ' ').replaceFirstChar { it.titlecase() }

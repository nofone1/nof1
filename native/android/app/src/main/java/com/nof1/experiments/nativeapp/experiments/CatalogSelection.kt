package com.nof1.experiments.nativeapp.experiments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.nof1.experiments.nativeapp.catalog.CatalogData
import com.nof1.experiments.nativeapp.catalog.CatalogItem
import com.nof1.experiments.nativeapp.catalog.CatalogStore
import com.nof1.experiments.nativeapp.ui.ActionButton
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
internal fun rememberFormCatalog(): Result<List<CatalogItem>>? {
    val context = LocalContext.current.applicationContext
    val catalog by produceState<Result<List<CatalogItem>>?>(null, context) {
        value = withContext(Dispatchers.IO) { runCatching { CatalogStore.load(context) } }
    }
    return catalog
}

@Composable
internal fun CatalogSelection(
    catalog: Result<List<CatalogItem>>?,
    selectedId: String?,
    enabled: Boolean,
    onSelect: (CatalogItem?) -> Unit,
) {
    var showPicker by remember { mutableStateOf(false) }
    var search by remember { mutableStateOf("") }
    val items = catalog?.getOrNull().orEmpty()
    val selected = items.find { it.id == selectedId }
    when {
        catalog == null -> Text("Loading bundled catalog…")
        catalog.isFailure -> Text("The bundled catalog is unavailable. Custom entry is still available.", color = MaterialTheme.colorScheme.error)
        else -> ActionButton(if (selected == null) "Choose from ${items.size} catalog items" else "Change ${selected.name}", enabled) { showPicker = true }
    }
    TextButton(enabled = enabled, onClick = { onSelect(null) }) { Text("Use a custom intervention") }
    if (selectedId != null && selected == null && catalog?.isSuccess == true) {
        Text("The selected catalog item is unavailable. Choose another item or use a custom entry.", color = MaterialTheme.colorScheme.error)
    }
    selected?.let { item ->
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(item.name, style = MaterialTheme.typography.titleLarge)
            Text(item.subtitle)
            Text(item.researchLevel.replace('_', ' '), color = MaterialTheme.colorScheme.primary)
            Text(item.text("overview", "description"))
            Text("Research reference, not a dosing recommendation", style = MaterialTheme.typography.titleSmall)
            listOf("typicalDose" to "Reported dose", "frequency" to "Reported frequency", "route" to "Route", "cycleDuration" to "Reported cycle").forEach { (field, label) ->
                item.text("dosing", field).takeIf { it.isNotBlank() }?.let { Text("$label: $it") }
            }
            Text("Enter your own plan below. Catalog selection does not choose a dose for you.", style = MaterialTheme.typography.bodySmall)
        }
    }
    if (showPicker) {
        AlertDialog(
            onDismissRequest = { if (enabled) showPicker = false },
            title = { Text("Select a catalog item") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(search, { search = it }, enabled = enabled, label = { Text("Search all catalog items") }, modifier = Modifier.fillMaxWidth().testTag("catalog-search"), singleLine = true)
                    val filtered = CatalogData.filter(items, search)
                    Text("${filtered.size} results")
                    LazyColumn(Modifier.heightIn(max = 360.dp)) {
                        items(filtered, key = { it.id }) { item ->
                            TextButton(enabled = enabled, modifier = Modifier.fillMaxWidth(), onClick = {
                                onSelect(item)
                                showPicker = false
                                search = ""
                            }) {
                                Column(Modifier.fillMaxWidth()) {
                                    Text(item.name, style = MaterialTheme.typography.titleSmall)
                                    Text(item.subtitle, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(enabled = enabled, onClick = { showPicker = false }) { Text("Close") } },
        )
    }
}

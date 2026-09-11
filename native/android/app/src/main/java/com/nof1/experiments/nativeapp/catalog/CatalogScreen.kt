package com.nof1.experiments.nativeapp.catalog

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp

@Composable
fun CatalogScreen(onOpen: (String) -> Unit) {
    WithCatalog { items -> CatalogBrowseContent(items, onOpen) }
}

@Composable
internal fun CatalogBrowseContent(catalog: List<CatalogItem>, onOpen: (String) -> Unit) {
    var query by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf<String?>(null) }
    var research by rememberSaveable { mutableStateOf<String?>(null) }
    val filtered = remember(catalog, query, category, research) { CatalogData.filter(catalog, query, category, research) }
    val categories = remember(catalog) { catalog.flatMap { it.categories }.distinct().sortedBy(::catalogLabel) }
    val researchLevels = remember(catalog) { catalog.map { it.researchLevel }.distinct().sortedBy(::catalogLabel) }
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).testTag("catalog-list"),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item("header") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("THE RESEARCH LIBRARY", style = MaterialTheme.typography.labelMedium, color = CatalogSageText)
                CatalogHeading("Peptide Database")
                Text(
                    "${filtered.size} of ${catalog.size} peptides",
                    modifier = Modifier.testTag("catalog-count").semantics { liveRegion = LiveRegionMode.Polite },
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        item("search") {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                label = { Text("Search peptides") },
                placeholder = { Text("Name, subtitle, or description") },
                modifier = Modifier.fillMaxWidth().testTag("catalog-search"),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search, autoCorrectEnabled = false),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
            )
        }
        item("category-filters") {
            CatalogFilterRow("Category", "category", categories, category) { category = it }
        }
        item("research-filters") {
            CatalogFilterRow("Research level", "research", researchLevels, research) { research = it }
        }
        if (query.isNotEmpty() || category != null || research != null) {
            item("clear-filters") {
                TextButton(
                    onClick = { query = ""; category = null; research = null },
                    modifier = Modifier.heightIn(min = 48.dp).testTag("catalog-clear-filters"),
                ) { Text("Clear search and filters") }
            }
        }
        if (filtered.isEmpty()) {
            item("empty") {
                CatalogSection("No peptides found", Modifier.testTag("catalog-empty")) {
                    Text("Try a different search, category, or research level. Clear the filters to return to the full catalog.")
                }
            }
        }
        items(filtered, key = { it.id }) { peptide ->
            Card(
                onClick = { onOpen(peptide.id) },
                modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("catalog-item-${peptide.id}")
                    .semantics { contentDescription = "Open ${peptide.name} details" },
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            ) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(peptide.name, style = MaterialTheme.typography.titleLarge)
                            Text(peptide.subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        CatalogBadge(peptide.shortCode)
                    }
                    CatalogBadge(catalogLabel(peptide.researchLevel), purple = true)
                    Text(
                        peptide.categories.joinToString(" · ", transform = ::catalogLabel),
                        style = MaterialTheme.typography.labelMedium,
                        color = CatalogPurple,
                    )
                    Text(
                        listOf(peptide.text("dosing", "typicalDose"), peptide.text("dosing", "frequency"))
                            .filter(String::isNotBlank).joinToString(" · "),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text("Explore research →", style = MaterialTheme.typography.labelLarge, color = CatalogSageText)
                }
            }
        }
        item("disclaimer") {
            Text(
                "For education and research. Inclusion in this catalog is not an endorsement or a dosing recommendation.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(vertical = 12.dp),
            )
        }
    }
}

@Composable
private fun CatalogFilterRow(label: String, tag: String, values: List<String>, selected: String?, onSelect: (String?) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.testTag("catalog-$tag-filters")) {
            item {
                FilterChip(
                    selected = selected == null,
                    onClick = { onSelect(null) },
                    label = { Text("All") },
                    modifier = Modifier.heightIn(min = 48.dp).testTag("catalog-$tag-all")
                        .semantics { contentDescription = "All ${label.lowercase()} options" },
                )
            }
            items(values) { value ->
                FilterChip(
                    selected = selected == value,
                    onClick = { onSelect(if (selected == value) null else value) },
                    label = { Text(catalogLabel(value)) },
                    modifier = Modifier.heightIn(min = 48.dp).testTag("catalog-$tag-$value"),
                )
            }
        }
    }
}

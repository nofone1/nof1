package com.nof1.experiments.nativeapp.catalog

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.PrimaryScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

@Composable
fun PeptideDetailScreen(
    peptideId: String,
    onCreateExperiment: (String) -> Unit,
    onCreateProtocol: (String) -> Unit,
    onAddToStack: (String) -> Unit,
    onLogDose: (String) -> Unit,
) {
    WithCatalog { items ->
        val peptide = remember(items, peptideId) { items.find { it.id == peptideId } }
        if (peptide == null) {
            Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                CatalogHeading("Peptide not found", Modifier.testTag("catalog-detail-not-found"))
                Text("The catalog does not contain this peptide. Go back to the database to choose an available entry.")
            }
        } else {
            PeptideDetailContent(peptide, onCreateExperiment, onCreateProtocol, onAddToStack, onLogDose)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun PeptideDetailContent(
    peptide: CatalogItem,
    onCreateExperiment: (String) -> Unit,
    onCreateProtocol: (String) -> Unit,
    onAddToStack: (String) -> Unit,
    onLogDose: (String) -> Unit,
) {
    var selectedTabName by rememberSaveable(peptide.id) { mutableStateOf(CatalogDetailTab.Overview.name) }
    val tab = CatalogDetailTab.entries.firstOrNull { it.name == selectedTabName } ?: CatalogDetailTab.Overview
    val listState = rememberLazyListState()
    val additionalFields = remember(peptide) { peptide.additionalFields() }
    LaunchedEffect(peptide.id, tab) { listState.scrollToItem(0) }
    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).testTag("catalog-detail")) {
        PrimaryScrollableTabRow(
            selectedTabIndex = tab.ordinal,
            edgePadding = 12.dp,
            containerColor = MaterialTheme.colorScheme.background,
        ) {
            CatalogDetailTab.entries.forEach { candidate ->
                Tab(
                    selected = tab == candidate,
                    onClick = { selectedTabName = candidate.name },
                    text = { Text(candidate.label) },
                    modifier = Modifier.heightIn(min = 48.dp).testTag("catalog-tab-${candidate.name.lowercase()}")
                        .semantics { contentDescription = "${candidate.label} for ${peptide.name}" },
                )
            }
        }
        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).testTag("catalog-detail-content"),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item("header") {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            CatalogHeading(peptide.name, Modifier.testTag("catalog-detail-name"))
                            Text(peptide.subtitle, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        CatalogBadge(peptide.shortCode)
                    }
                    CatalogBadge(catalogLabel(peptide.researchLevel), purple = true)
                    Text(peptide.categories.joinToString(" · ", transform = ::catalogLabel), color = CatalogPurple)
                    Text(
                        "Administration: ${peptide.administrationRoutes.joinToString(", ", transform = ::catalogLabel)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text("Catalog ID: ${peptide.id}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            item("notice") { EducationalNotice() }
            if (tab == CatalogDetailTab.Tools) {
                item("reconstitution-calculator") {
                    ReconstitutionTool(peptide)
                }
                item("dose-decay-calculator") {
                    DoseDecayTool(peptide)
                }
            } else {
                items(tab.fields, key = { it }) { field ->
                    CatalogSection(catalogLabel(field), Modifier.testTag("catalog-field-$field")) {
                        val value = peptide.data[field]
                        if (value == null) {
                            Text("Not provided in this catalog. Missing information does not establish safety or effectiveness.", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        } else {
                            CatalogJsonContent(value, field)
                        }
                    }
                }
                if (tab == CatalogDetailTab.Overview && additionalFields.isNotEmpty()) {
                    item("additional-information") {
                        CatalogSection("Additional catalog information", Modifier.testTag("catalog-additional-fields")) {
                            CatalogJsonContent(additionalFields)
                        }
                    }
                }
            }
            item("actions") {
                CatalogSection("Your research", Modifier.testTag("catalog-detail-actions")) {
                    Text("Track your records without treating this catalog as a recommendation.", style = MaterialTheme.typography.bodySmall)
                    Button(
                        onClick = { onLogDose(peptide.id) },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("catalog-log-dose"),
                    ) { Text("Log dose") }
                    OutlinedButton(
                        onClick = { onCreateExperiment(peptide.id) },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("catalog-create-experiment"),
                    ) { Text("Use in experiment") }
                    OutlinedButton(
                        onClick = { onCreateProtocol(peptide.id) },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("catalog-create-protocol"),
                    ) { Text("Use in protocol") }
                    OutlinedButton(
                        onClick = { onAddToStack(peptide.id) },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("catalog-add-to-stack"),
                    ) { Text("Add to stack") }
                }
            }
        }
    }
}

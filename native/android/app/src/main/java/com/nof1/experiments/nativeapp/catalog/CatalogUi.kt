package com.nof1.experiments.nativeapp.catalog

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull

internal val CatalogSage = Color(0xFF5B8A72)
internal val CatalogSageText = Color(0xFFA1C6AD)
internal val CatalogPurple = Color(0xFFC4B5FD)

private sealed interface CatalogLoadState {
    data object Loading : CatalogLoadState
    data class Loaded(val items: List<CatalogItem>) : CatalogLoadState
    data class Failed(val message: String) : CatalogLoadState
}

@Composable
internal fun WithCatalog(content: @Composable (List<CatalogItem>) -> Unit) {
    val context = LocalContext.current.applicationContext
    var attempt by remember { mutableIntStateOf(0) }
    val state by produceState<CatalogLoadState>(CatalogLoadState.Loading, context, attempt) {
        value = CatalogLoadState.Loading
        value = withContext(Dispatchers.IO) {
            try {
                CatalogLoadState.Loaded(CatalogStore.load(context))
            } catch (error: CatalogLoadException) {
                CatalogLoadState.Failed(error.message ?: "The bundled catalog could not be loaded.")
            }
        }
    }
    when (val result = state) {
        CatalogLoadState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                CircularProgressIndicator()
                Text("Loading peptide catalog", Modifier.testTag("catalog-loading"))
            }
        }
        is CatalogLoadState.Failed -> Column(
            Modifier.fillMaxSize().padding(24.dp).testTag("catalog-error"),
            verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
        ) {
            CatalogHeading("Catalog unavailable")
            Text(result.message, Modifier.semantics { liveRegion = LiveRegionMode.Polite })
            Button(onClick = { attempt++ }, modifier = Modifier.heightIn(min = 48.dp)) { Text("Retry loading catalog") }
        }
        is CatalogLoadState.Loaded -> content(result.items)
    }
}

@Composable
internal fun CatalogHeading(text: String, modifier: Modifier = Modifier) {
    Text(text, modifier.semantics { heading() }, style = MaterialTheme.typography.titleLarge)
}

@Composable
internal fun CatalogSection(title: String, modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            CatalogHeading(title)
            content()
        }
    }
}

@Composable
internal fun CatalogBadge(text: String, purple: Boolean = false) {
    val foreground = if (purple) CatalogPurple else CatalogSageText
    Surface(color = foreground.copy(alpha = 0.10f), contentColor = foreground, shape = RoundedCornerShape(8.dp)) {
        Text(text, Modifier.padding(horizontal = 10.dp, vertical = 6.dp), style = MaterialTheme.typography.labelMedium)
    }
}

@Composable
internal fun EducationalNotice() {
    Surface(
        color = Color(0xFFD69E2E).copy(alpha = 0.10f),
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, Color(0xFFD69E2E).copy(alpha = 0.30f)),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Educational information only", style = MaterialTheme.typography.titleSmall, color = Color(0xFFF0CE86))
            Text(
                "Not medical advice or a recommendation to use this compound. Research claims may be preliminary or based on animal studies. Consult a qualified clinician before making health decisions.",
                style = MaterialTheme.typography.bodySmall,
            )
        }
    }
}

@Composable
internal fun CatalogJsonContent(value: JsonElement, field: String = "") {
    if (value.isNotProvided()) {
        Text("Not provided in this catalog.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        return
    }
    when (value) {
        is JsonObject -> Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            value.forEach { (key, child) ->
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(catalogLabel(key), style = MaterialTheme.typography.titleSmall, color = CatalogSageText)
                    CatalogJsonContent(child, key)
                }
            }
        }
        is JsonArray -> Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            value.forEachIndexed { index, child ->
                if (child is JsonPrimitive) {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(if (field == "steps") "${index + 1}." else "•", color = CatalogSageText)
                        Box(Modifier.weight(1f)) { CatalogJsonContent(child, field) }
                    }
                } else {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.background,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Box(Modifier.padding(14.dp)) { CatalogJsonContent(child, field) }
                    }
                }
            }
        }
        is JsonPrimitive -> {
            val text = value.contentOrNull.orEmpty()
            val display = if (field in setOf("effectiveness", "researchLevel", "categories", "administrationRoutes")) {
                catalogLabel(text)
            } else text
            SelectionContainer {
                Text(display, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.fillMaxWidth())
            }
            if (field == "doi") StudyLink(text)
        }
    }
}

@Composable
private fun StudyLink(doi: String) {
    val identifier = doi.removePrefix("https://doi.org/").removePrefix("http://doi.org/")
    if (!identifier.matches(Regex("10\\.\\d{4,9}/\\S+"))) return
    val handler = LocalUriHandler.current
    var failed by remember(doi) { mutableStateOf(false) }
    OutlinedButton(
        onClick = {
            try {
                handler.openUri("https://doi.org/$identifier")
                failed = false
            } catch (_: IllegalArgumentException) {
                failed = true
            } catch (_: android.content.ActivityNotFoundException) {
                failed = true
            }
        },
        modifier = Modifier.heightIn(min = 48.dp),
    ) { Text("Open published study") }
    if (failed) Text("No browser is available. You can select and copy the DOI above.", color = MaterialTheme.colorScheme.error)
}

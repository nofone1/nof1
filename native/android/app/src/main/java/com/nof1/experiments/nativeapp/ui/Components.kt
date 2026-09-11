package com.nof1.experiments.nativeapp.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.nof1.experiments.nativeapp.data.LoadState

@Composable
fun Nof1Theme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF8BBFA7), onPrimary = Color(0xFF0A3A22),
            primaryContainer = Color(0xFF3A6A52), onPrimaryContainer = Color(0xFFEDF5F1),
            secondary = Color(0xFFC4B5FD), background = Color(0xFF0A0B0F),
            surface = Color(0xFF14151A), surfaceVariant = Color(0xFF1A1B22),
            onBackground = Color(0xFFEAEAEA), onSurface = Color(0xFFEAEAEA),
            onSurfaceVariant = Color(0xFFB0B0B8), error = Color(0xFFE89B9B),
        ), content = content,
    )
}

@Composable
fun ScreenColumn(title: String, subtitle: String? = null, content: @Composable ColumnScope.() -> Unit) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        Text(title, style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold, modifier = Modifier.semantics { heading() })
        subtitle?.let { Text(it, color = MaterialTheme.colorScheme.onSurfaceVariant) }
        content()
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
fun Section(title: String, content: @Composable ColumnScope.() -> Unit) {
    Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, style = MaterialTheme.typography.titleMedium, modifier = Modifier.semantics { heading() })
            content()
        }
    }
}

@Composable
fun ActionButton(label: String, enabled: Boolean = true, onClick: () -> Unit) {
    Button(onClick, Modifier.fillMaxWidth().heightIn(min = 48.dp), enabled = enabled) { Text(label) }
}

@Composable
fun Field(label: String, value: String, onValueChange: (String) -> Unit, multiline: Boolean = false) {
    OutlinedTextField(value, onValueChange, Modifier.fillMaxWidth(), label = { Text(label) }, singleLine = !multiline, minLines = if (multiline) 3 else 1)
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ChoiceRow(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { value ->
            FilterChip(selected == value, { onSelect(value) }, label = { Text(value.replace('_', ' ').replaceFirstChar { it.titlecase() }) }, modifier = Modifier.heightIn(min = 48.dp))
        }
    }
}

@Composable
fun <T> LoadContent(state: LoadState<T>, content: @Composable (T) -> Unit) {
    when (state) {
        LoadState.Loading -> Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) { CircularProgressIndicator(Modifier.size(24.dp)); Text("Loading your records…") }
        is LoadState.Failed -> Text("Records unavailable. Check your connection and sign-in, then return to this screen to reconnect. Your data has not been replaced with local records.", color = MaterialTheme.colorScheme.error)
        is LoadState.Ready -> content(state.value)
    }
}

@Composable
fun MedicalNotice() {
    Text("Educational self-tracking only. Not medical advice. Research, dose, and concentration information can be inaccurate; confirm decisions with a licensed clinician.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
}

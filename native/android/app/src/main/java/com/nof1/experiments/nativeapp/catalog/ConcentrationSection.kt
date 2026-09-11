package com.nof1.experiments.nativeapp.catalog

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.nof1.experiments.nativeapp.data.Dose
import java.time.Instant
import java.time.format.DateTimeParseException
import kotlin.math.roundToInt
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun ConcentrationSection(doses: List<Dose>) {
    if (doses.isEmpty()) return
    val context = LocalContext.current.applicationContext
    val catalog by produceState<Result<List<CatalogItem>>?>(null, context) {
        value = withContext(Dispatchers.IO) {
            try {
                Result.success(CatalogStore.load(context))
            } catch (error: CatalogLoadException) {
                Result.failure(error)
            }
        }
    }
    val estimates = remember(doses, catalog) {
        catalog?.mapCatching { items -> ConcentrationCalculations.calculate(doses, items, Instant.now()) }
    }
    CatalogSection("Estimated concentrations", Modifier.testTag("concentration-section")) {
        Text(
            "Simplified equal-dose model for the last seven calendar days. Recorded dose amounts are not used; estimates add together and are capped at 100%. This is not a blood concentration measurement, a dose-aware prediction, or a safe-dosing recommendation.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        val result = estimates
        if (result == null) {
            Text("Loading catalog half-lives…")
        } else if (result.isFailure) {
            Text(
                if (result.exceptionOrNull() is DateTimeParseException) {
                    "Estimates are unavailable because a dose has an invalid timestamp. Check your dose history."
                } else {
                    "Estimates are unavailable because the catalog could not be read or its half-life data is invalid."
                },
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.testTag("concentration-error"),
            )
        } else {
            val levels = result.getOrThrow()
            if (levels.isEmpty()) {
                Text("No recent catalog-linked doses with half-life data. Missing half-lives are not inferred.")
            }
            levels.forEach { level ->
                val label = when (level.status) {
                    "higher" -> "Higher estimate"
                    "declining" -> "Declining estimate"
                    else -> "Low estimate"
                }
                val color = when (level.status) {
                    "higher" -> CatalogSageText
                    "declining" -> Color(0xFFF0CE86)
                    else -> MaterialTheme.colorScheme.onSurfaceVariant
                }
                Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.testTag("concentration-${level.peptideId}")) {
                    Text(level.peptideName, style = MaterialTheme.typography.titleMedium)
                    Text("$label · ${level.percentage.roundToInt()}%", color = color)
                    LinearProgressIndicator(
                        progress = { (level.percentage / 100).toFloat() },
                        modifier = Modifier.fillMaxWidth(),
                        color = color,
                    )
                    Text("Catalog half-life: ${CatalogCalculations.formatDuration(level.halfLifeHours)}", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

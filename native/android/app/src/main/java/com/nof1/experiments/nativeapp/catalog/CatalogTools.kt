package com.nof1.experiments.nativeapp.catalog

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import java.util.Locale

private fun decimal(text: String): Double? = text.trim().replace(',', '.').toDoubleOrNull()?.takeIf { it.isFinite() }

private fun formatNumber(number: Double, places: Int = 2): String = String.format(Locale.ROOT, "%.${places}f", number)

@Composable
internal fun ReconstitutionTool(peptide: CatalogItem) {
    var peptideMg by rememberSaveable(peptide.id) {
        mutableStateOf(peptide.number("reconstitution", "defaultPeptideMg")?.toString().orEmpty())
    }
    var waterMl by rememberSaveable(peptide.id) {
        mutableStateOf(peptide.number("reconstitution", "defaultVialMl")?.toString().orEmpty())
    }
    var doseMcg by rememberSaveable(peptide.id) { mutableStateOf("250") }
    var submitted by rememberSaveable(peptide.id) { mutableStateOf(false) }
    val calculation = remember(peptideMg, waterMl, doseMcg, submitted) {
        if (!submitted) null else runCatching {
            CatalogCalculations.reconstitute(
                decimal(peptideMg) ?: throw IllegalArgumentException("Enter a valid peptide amount in mg."),
                decimal(waterMl) ?: throw IllegalArgumentException("Enter a valid water volume in mL."),
                decimal(doseMcg) ?: throw IllegalArgumentException("Enter a valid dose in mcg."),
            )
        }
    }
    CatalogSection("Reconstitution calculator", Modifier.testTag("catalog-reconstitution-tool")) {
        Text(
            "Arithmetic only, not preparation instructions or a prescription. Verify the formulation, solvent, concentration, vial capacity, syringe markings, and dose with a clinician or pharmacist. 1 mg = 1,000 mcg.",
            style = MaterialTheme.typography.bodySmall,
        )
        if (peptide.data["reconstitution"] == null) {
            Text("This catalog has no reconstitution instructions for ${peptide.name}. Blank inputs are intentional; this tool does not establish suitability for injection.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            Text("Catalog solvent: ${peptide.text("reconstitution", "solvent")}. Full instructions and quality indicators are in Dosing.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        CalculatorInput("Peptide in vial (mg)", "reconstitution-peptide-mg", peptideMg) { peptideMg = it; submitted = false }
        CalculatorInput("Water added / final volume (mL)", "reconstitution-water-ml", waterMl) { waterMl = it; submitted = false }
        CalculatorInput("Dose per injection (mcg)", "reconstitution-dose-mcg", doseMcg) { doseMcg = it; submitted = false }
        Button(
            onClick = { submitted = true },
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("reconstitution-calculate"),
        ) { Text("Calculate concentration") }
        calculation?.exceptionOrNull()?.let {
            Text(it.message.orEmpty(), Modifier.testTag("reconstitution-error").semantics { liveRegion = LiveRegionMode.Polite }, color = MaterialTheme.colorScheme.error)
        }
        calculation?.getOrNull()?.let { result ->
            Column(
                Modifier.testTag("reconstitution-result").semantics { liveRegion = LiveRegionMode.Polite },
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text("${formatNumber(result.concentrationMcgPerMl)} mcg/mL", style = MaterialTheme.typography.headlineSmall, color = CatalogSageText)
                Text("Volume per dose: ${formatNumber(result.volumePerDoseMl, 4)} mL")
                Text("U-100 syringe markings: ${formatNumber(result.unitsPerDose, 0)} units per dose (rounded)")
                Text("Whole doses per vial: ${formatNumber(result.dosesPerVial, 0)}")
                Text("Assumes 100 U-100 syringe units per mL and the entered final solution volume. Rounding can materially change a small dose; the rounded unit count is not an injection instruction.", style = MaterialTheme.typography.bodySmall)
                if (result.unitsPerDose < 1 || result.unitsPerDose > 100) {
                    Text("The calculated amount is outside 1–100 units on a 1 mL U-100 syringe. Do not use this result as a syringe instruction.", color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
internal fun DoseDecayTool(peptide: CatalogItem) {
    val catalogHalfLife = peptide.number("pharmacokinetics", "halfLifeHours")
    var halfLife by rememberSaveable(peptide.id) { mutableStateOf(catalogHalfLife?.toString().orEmpty()) }
    var elapsed by rememberSaveable(peptide.id) { mutableStateOf(catalogHalfLife?.toString().orEmpty()) }
    var submitted by rememberSaveable(peptide.id) { mutableStateOf(catalogHalfLife != null && catalogHalfLife > 0) }
    val calculation = remember(halfLife, elapsed, submitted) {
        if (!submitted) null else runCatching {
            val halfLifeHours = decimal(halfLife)
                ?: throw IllegalArgumentException("Enter a valid half-life in hours.")
            val hoursElapsed = decimal(elapsed)
                ?: throw IllegalArgumentException("Enter valid elapsed hours.")
            require(halfLifeHours > 0) { "Half-life must be greater than zero." }
            require(hoursElapsed >= 0) { "Elapsed time cannot be negative." }
            val points = CatalogCalculations.generateDecayCurve(halfLifeHours, halfLifeHours * 5, 10)
            CatalogCalculations.calculateDecay(halfLifeHours, hoursElapsed) to points
        }
    }
    CatalogSection("Dose decay model", Modifier.testTag("catalog-decay-tool")) {
        Text(
            "A simplified single-dose exponential model: 100 × 0.5^(elapsed hours ÷ half-life). It does not model absorption, dose size, accumulation, active metabolites, or individual differences. It cannot determine a safe dose, interval, or clearance time.",
            style = MaterialTheme.typography.bodySmall,
        )
        if (catalogHalfLife == null) {
            Text("No half-life is provided for ${peptide.name}; none has been inferred.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            Text("Catalog half-life: ${peptide.text("pharmacokinetics", "halfLife")} ($catalogHalfLife hours). Additional pharmacokinetic data is in Research.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        CalculatorInput("Half-life (hours)", "decay-half-life", halfLife) { halfLife = it; submitted = false }
        CalculatorInput("Elapsed time (hours)", "decay-elapsed", elapsed) { elapsed = it; submitted = false }
        Button(
            onClick = { submitted = true },
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp).testTag("decay-calculate"),
        ) { Text("Calculate estimated remaining") }
        calculation?.exceptionOrNull()?.let {
            Text(it.message.orEmpty(), Modifier.testTag("decay-error").semantics { liveRegion = LiveRegionMode.Polite }, color = MaterialTheme.colorScheme.error)
        }
        calculation?.getOrNull()?.let { (percentage, curve) ->
            Text(
                "${formatNumber(percentage)}% estimated remaining",
                Modifier.testTag("decay-result").semantics { liveRegion = LiveRegionMode.Polite },
                style = MaterialTheme.typography.headlineSmall,
                color = CatalogSageText,
            )
            DecayChart(curve)
            Text("Model over five half-lives", style = MaterialTheme.typography.titleSmall)
            curve.forEach { point ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(CatalogCalculations.formatDuration(point.hour), Modifier.weight(1f))
                    Text("${formatNumber(point.percentage)}%", Modifier.padding(start = 12.dp))
                }
            }
        }
    }
}

@Composable
private fun CalculatorInput(label: String, tag: String, value: String, onChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        modifier = Modifier.fillMaxWidth().testTag(tag),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        singleLine = true,
    )
}

@Composable
private fun DecayChart(curve: List<DecayPoint>) {
    Canvas(
        Modifier.fillMaxWidth().height(110.dp).testTag("decay-chart").semantics {
            contentDescription = "Exponential decay from 100 percent to 3.125 percent over five half-lives. All data points are listed below."
        },
    ) {
        val slot = size.width / curve.size
        curve.forEachIndexed { index, point ->
            val height = size.height * (point.percentage / 100).toFloat()
            drawRect(
                color = if (point.percentage > 50) CatalogSage else if (point.percentage > 20) CatalogPurple else CatalogSageText.copy(alpha = 0.5f),
                topLeft = Offset(index * slot, size.height - height),
                size = Size(slot * 0.7f, height),
            )
        }
    }
}

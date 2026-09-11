package com.nof1.experiments.nativeapp.catalog

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.assertTextContains
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.junit4.v2.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performScrollToNode
import androidx.compose.ui.test.performTextReplacement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [35])
class CatalogSemanticsTest {
    @get:Rule val compose = createComposeRule()
    private val catalog = CatalogData.parse(sharedFixture("catalog.json"))

    @Test
    fun searchEmptyStateAndClearAreNativeAccessibleControls() {
        var opened: String? = null
        compose.setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface { CatalogBrowseContent(catalog) { opened = it } }
            }
        }
        compose.onNodeWithTag("catalog-search").performTextReplacement("BPC-157")
        compose.onNodeWithTag("catalog-count").assertTextContains("3 of 71 peptides")
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-item-bpc-157"))
        compose.onNodeWithTag("catalog-item-bpc-157").performClick()
        assertEquals("bpc-157", opened)
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-search"))
        compose.onNodeWithTag("catalog-search").performTextReplacement("no-such-peptide-123456")
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-empty"))
        compose.onNodeWithTag("catalog-empty").assertIsDisplayed()
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-clear-filters"))
        compose.onNodeWithTag("catalog-clear-filters").performClick()
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-count"))
        compose.onNodeWithTag("catalog-count").assertTextContains("71 of 71 peptides")
    }

    @Test
    fun categoryAndResearchFiltersCombine() {
        compose.setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface { CatalogBrowseContent(catalog) {} }
            }
        }
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-category-filters"))
        compose.onNodeWithTag("catalog-category-filters").performScrollToNode(hasTestTag("catalog-category-weight_loss"))
        compose.onNodeWithTag("catalog-category-weight_loss").performClick().assertIsSelected()
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-research-filters"))
        compose.onNodeWithTag("catalog-research-filters").performScrollToNode(hasTestTag("catalog-research-fda_approved"))
        compose.onNodeWithTag("catalog-research-fda_approved").performClick().assertIsSelected()
        compose.onNodeWithTag("catalog-list").performScrollToNode(hasTestTag("catalog-count"))
        val expected = CatalogData.filter(catalog, category = "weight_loss", researchLevel = "fda_approved").size
        compose.onNodeWithTag("catalog-count").assertTextContains("$expected of 71 peptides")
    }

    @Test
    fun detailTabsKeepRichFieldsAndAllActionsReachable() {
        val original = catalog.first { it.id == "bpc-157" }
        val item = CatalogItem(JsonObject(original.data + ("futureInformation" to JsonPrimitive("Future catalog content"))))
        val actions = mutableListOf<String>()
        compose.setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface {
                    PeptideDetailContent(item,
                        onCreateExperiment = { actions += "experiment:$it" },
                        onCreateProtocol = { actions += "protocol:$it" },
                        onAddToStack = { actions += "stack:$it" },
                        onLogDose = { actions += "dose:$it" },
                    )
                }
            }
        }
        compose.onNodeWithTag("catalog-detail-content").performScrollToNode(hasTestTag("catalog-additional-fields"))
        compose.onNodeWithText("Future catalog content").assertIsDisplayed()
        compose.onNodeWithTag("catalog-tab-dosing").performClick()
        compose.onNodeWithTag("catalog-tab-dosing").assertIsSelected()
        compose.onNodeWithTag("catalog-detail-content").performScrollToNode(hasTestTag("catalog-field-reconstitution"))
        compose.onNodeWithTag("catalog-field-reconstitution").assertIsDisplayed()
        listOf("log-dose", "create-experiment", "create-protocol", "add-to-stack").forEach { action ->
            compose.onNodeWithTag("catalog-detail-content").performScrollToNode(hasTestTag("catalog-$action"))
            compose.onNodeWithTag("catalog-$action").performClick()
        }
        assertEquals(listOf("dose:bpc-157", "experiment:bpc-157", "protocol:bpc-157", "stack:bpc-157"), actions)
    }

    @Test
    fun calculatorRejectsZeroAndShowsAValidResult() {
        compose.setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface {
                    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                        ReconstitutionTool(catalog.first { it.id == "bpc-157" })
                    }
                }
            }
        }
        compose.onNodeWithTag("reconstitution-peptide-mg").performTextReplacement("0")
        compose.onNodeWithTag("reconstitution-calculate").performScrollTo().performClick()
        compose.onNodeWithTag("reconstitution-error").performScrollTo().assertTextContains("greater than zero", substring = true)
        compose.onNodeWithTag("reconstitution-peptide-mg").performScrollTo().performTextReplacement("5")
        compose.onNodeWithTag("reconstitution-calculate").performScrollTo().performClick()
        compose.onNodeWithText("2500.00 mcg/mL").performScrollTo().assertIsDisplayed()
    }
}

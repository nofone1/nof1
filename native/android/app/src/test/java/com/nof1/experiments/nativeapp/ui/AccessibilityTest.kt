package com.nof1.experiments.nativeapp.ui

import androidx.compose.ui.test.assertHasClickAction
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [35])
class AccessibilityTest {
    @get:Rule val compose = createComposeRule()

    @Test fun disabledWritesRemainClearlyDisabled() {
        compose.setContent { Nof1Theme { ActionButton("Save dose", enabled = false, onClick = {}) } }
        compose.onNodeWithText("Save dose").assertHasClickAction().assertIsNotEnabled()
    }

    @Test fun activeWriteHasAnAccessibleTextLabel() {
        compose.setContent { Nof1Theme { ActionButton("Log Entry", onClick = {}) } }
        compose.onNodeWithText("Log Entry").assertHasClickAction().assertIsEnabled()
    }

    @Test fun selectedChoicesExposeSelectionState() {
        compose.setContent { Nof1Theme { ChoiceRow(listOf("dose", "metric"), "metric", {}) } }
        compose.onNodeWithText("Metric").assertIsSelected().assertHasClickAction()
    }
}

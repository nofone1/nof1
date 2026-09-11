package com.nof1.experiments.nativeapp.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.nof1.experiments.nativeapp.Nof1ViewModel
import com.nof1.experiments.nativeapp.BuildConfig
import kotlinx.serialization.json.*

@Composable
fun ProfileScreen(vm: Nof1ViewModel, onOpen: (String) -> Unit, onSignOut: () -> Unit) {
    var confirmSignOut by remember { mutableStateOf(false) }
    var deletionStep by remember { mutableIntStateOf(0) }
    val busy by vm.busy.collectAsStateWithLifecycle()
    ScreenColumn("Profile", if (vm.local) "Development profile · ${vm.identity.removePrefix("local:")}" else "Your secure Nof1 account") {
        Section("Your research") {
            ProfileLink("My Experiments", "Create, compare, and track your N-of-1 experiments") { onOpen("experiments") }
            ProfileLink("Nof1 Plus", "View authoritative subscription access") { onOpen("subscription") }
            ProfileLink("Health connections", "Native integration status") { onOpen("health") }
        }
        Section("Preferences & support") {
            ProfileLink("Settings", "Notifications, appearance, and export status") { onOpen("settings") }
            Text("Profile editing is not available in this native release. Your account identity is managed by Clerk.", style = MaterialTheme.typography.bodySmall)
            Text("Support: anam@revyl.ai")
        }
        Section("Privacy & safety") {
            ProfileLink("Privacy Policy") { onOpen("privacy") }
            ProfileLink("Terms of Service") { onOpen("terms") }
            ProfileLink("Medical Safety") { onOpen("medical") }
            if (!vm.local && BuildConfig.ENABLE_ACCOUNT_DELETION) {
                OutlinedButton(onClick = { deletionStep = 1 }, enabled = !busy, modifier = Modifier.fillMaxWidth()) { Text("Delete account") }
            } else Text("Account deletion is disabled in this development build. Contact support to request account and app-data deletion. Deleting an account does not cancel store or Whop subscriptions.", style = MaterialTheme.typography.bodySmall)
        }
        ActionButton(if (vm.local) "Leave development profile" else "Sign out") { confirmSignOut = true }
        MedicalNotice()
    }
    if (confirmSignOut) AlertDialog(onDismissRequest = { confirmSignOut = false }, title = { Text("Sign out?") },
        text = { Text(if (vm.local) "Your local records remain separated under this development profile. Signing out clears the visible account state." else "Your account records remain in Convex. This clears the active screen state and signs out of Clerk.") },
        confirmButton = { TextButton(onClick = { confirmSignOut = false; onSignOut() }) { Text("Sign out") } },
        dismissButton = { TextButton(onClick = { confirmSignOut = false }) { Text("Stay signed in") } })
    if (deletionStep > 0) AlertDialog(onDismissRequest = { deletionStep = 0 },
        title = { Text(if (deletionStep == 1) "Delete account?" else "Permanently delete your account?") },
        text = { Text("This permanently removes your experiments, protocols, tracking records, billing-access links, and Clerk identity. It cannot be undone and does not cancel store or Whop subscriptions.") },
        confirmButton = { TextButton(onClick = {
            if (deletionStep == 1) deletionStep = 2 else { deletionStep = 0; vm.deleteAccount() }
        }, enabled = !busy) { Text(if (deletionStep == 1) "Continue" else "Delete permanently") } },
        dismissButton = { TextButton(onClick = { deletionStep = 0 }) { Text("Keep account") } })
}

@Composable
private fun ProfileLink(label: String, hint: String? = null, onClick: () -> Unit) {
    OutlinedButton(onClick, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
        Column(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
            Text(label, style = MaterialTheme.typography.titleSmall)
            hint?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
        }
    }
}

@Composable
fun SubscriptionScreen(vm: Nof1ViewModel) {
    val access by vm.billing.collectAsStateWithLifecycle()
    ScreenColumn("Nof1 Plus", "Subscription access belongs to your account, not this device.") {
        Section(if (vm.local) "Local development access" else "Your plan") {
            if (vm.local) Text("Local development uses the free experiment limit. This is not a real subscription entitlement.")
            else LoadContent(access) { value ->
                Text(if (value.hasPlus) "Nof1 Plus" else "Free plan", style = MaterialTheme.typography.headlineMedium)
                Text(if (value.hasPlus) "Unlimited experiments while your access is active." else "One experiment in draft, active, or paused state at a time.")
                value.expiresAt?.let { Text("Access expires: $it") }
                if (value.inGracePeriod) Text("Your billing provider reports a grace period.")
                value.sources.forEach { source -> Text("${source.provider}: ${source.status}") }
                if (value.hasMultipleActiveProviders) Text("Multiple active providers. Manage each subscription separately to avoid duplicate billing.")
            }
        }
        Section("Purchases and connected memberships") {
            Text("Purchases, restore, and Whop linking are unavailable until the isolated native application is registered with the billing providers. This screen never grants access locally or claims a purchase succeeded.")
            Button(onClick = {}, enabled = false, modifier = Modifier.fillMaxWidth()) { Text("Purchase unavailable") }
            OutlinedButton(onClick = {}, enabled = false, modifier = Modifier.fillMaxWidth()) { Text("Restore unavailable") }
            Text("Manage an existing subscription with the store or provider that processed it. Disconnecting access or deleting Nof1 does not cancel renewal.")
        }
    }
}

@Composable
fun UnavailableScreen(title: String, explanation: String) {
    ScreenColumn(title) { Section("Not connected") { Text(explanation) }; MedicalNotice() }
}

@Composable
fun LegalScreen(document: String) {
    val context = LocalContext.current
    val data = remember(document) {
        runCatching { context.assets.open("legal.json").bufferedReader().use { Json.parseToJsonElement(it.readText()).jsonObject.getValue(document).jsonObject } }
    }
    data.fold(onSuccess = { content ->
        ScreenColumn(content.getValue("title").jsonPrimitive.content, "Last updated ${content.getValue("updated").jsonPrimitive.content}") {
            Text("Native integration notice: purchases, health connections, and exports are currently unavailable. Account deletion is disabled by default in development builds; contact support when the deletion control is unavailable.", color = MaterialTheme.colorScheme.secondary)
            content.getValue("sections").jsonArray.forEach { entry ->
                Section(entry.jsonObject.getValue("heading").jsonPrimitive.content) { Text(entry.jsonObject.getValue("body").jsonPrimitive.content) }
            }
        }
    }, onFailure = { ScreenColumn("Document unavailable") { Text("The bundled legal document could not be read. Contact anam@revyl.ai before continuing.") } })
}

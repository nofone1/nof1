package com.nof1.experiments.nativeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.session.Session
import com.clerk.ui.auth.AuthView
import com.nof1.experiments.nativeapp.catalog.*
import com.nof1.experiments.nativeapp.data.*
import com.nof1.experiments.nativeapp.experiments.*
import com.nof1.experiments.nativeapp.protocols.*
import com.nof1.experiments.nativeapp.ui.*
import dev.convex.android.AuthState
import dev.convex.android.ConvexClientWithAuth
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { Nof1Theme { SessionGate(application as Nof1Application) } }
    }
}

@Composable
private fun SessionGate(app: Nof1Application) {
    var localIdentity by rememberSaveable { mutableStateOf<String?>(null) }
    if (BuildConfig.LOCAL_DEMO) {
        val identity = localIdentity
        if (identity == null) {
            var name by rememberSaveable { mutableStateOf("developer") }
            Scaffold { padding -> Box(Modifier.padding(padding)) {
                ScreenColumn("Nof1", "A little more evidence. A little less guesswork.") {
                    Section("Local development only") {
                        Text("No Clerk login, cloud sync, billing, or health connection. Records stay on this device, separated by the development profile you choose.")
                        Field("Development profile", name, { name = it })
                        ActionButton("Enter local development", name.isNotBlank()) { localIdentity = "local:${name.trim()}" }
                    }
                    MedicalNotice()
                }
            } }
        } else {
            val repository = remember(identity) { LocalRepository(app, identity) }
            IdentityContent(identity, repository, local = true, onSignOut = { localIdentity = null })
        }
        return
    }
    app.configurationError?.let { error ->
        Scaffold { padding -> Box(Modifier.padding(padding)) { ScreenColumn("Cloud setup required") { Text(error); MedicalNotice() } } }
        return
    }
    val initialized by Clerk.isInitialized.collectAsStateWithLifecycle()
    val user by Clerk.userFlow.collectAsStateWithLifecycle()
    val session by Clerk.sessionFlow.collectAsStateWithLifecycle()
    val authFlowComplete by Clerk.isAuthFlowCompleteFlow.collectAsStateWithLifecycle()
    var initializationDelayed by remember { mutableStateOf(false) }
    LaunchedEffect(initialized) { if (!initialized) { delay(20_000); initializationDelayed = true } }
    when {
        !initialized -> Scaffold { padding -> Box(Modifier.padding(padding)) { ScreenColumn("Nof1", "Initializing secure sign-in…") {
            if (initializationDelayed) Text("Secure sign-in is taking longer than expected. Check your network and cloud configuration, then reopen the app.") else CircularProgressIndicator()
        } } }
        user == null || !authFlowComplete || session?.status != Session.SessionStatus.ACTIVE ->
            Scaffold { padding -> Box(Modifier.fillMaxSize().padding(padding)) { AuthView() } }
        else -> key(requireNotNull(user).id, requireNotNull(session).id) {
            CloudIdentityGate(app, requireNotNull(user).id, requireNotNull(session).id)
        }
    }
}

@Composable
private fun CloudIdentityGate(app: Nof1Application, identity: String, sessionId: String) {
    val provider = remember { ClerkTemplateAuthProvider(identity, sessionId) }
    val client = remember { ConvexClientWithAuth(BuildConfig.CONVEX_URL, provider) }
    val state by client.authState.collectAsStateWithLifecycle()
    var attempted by remember { mutableStateOf(false) }
    var retry by remember { mutableIntStateOf(0) }
    var signOutError by remember { mutableStateOf<String?>(null) }
    var signingOut by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val signOut: () -> Unit = {
        if (!signingOut) {
            signingOut = true
            scope.launch {
                when (Clerk.auth.signOut()) {
                    is ClerkResult.Success -> { provider.retire(); client.logout(app) }
                    is ClerkResult.Failure -> signOutError = "Sign-out failed. Your session is still active. Check your connection and try again."
                }
                signingOut = false
            }
        }
    }
    DisposableEffect(provider) { onDispose { provider.retire() } }
    LaunchedEffect(client, retry) {
        attempted = false
        client.loginFromCache()
        attempted = true
    }
    if (signOutError != null) AlertDialog(onDismissRequest = { signOutError = null },
        title = { Text("Sign-out failed") }, text = { Text(signOutError.orEmpty()) },
        confirmButton = { TextButton(onClick = { signOutError = null }) { Text("OK") } })
    when {
        state is AuthState.Authenticated -> {
            val repository = remember(client) { CloudRepository(client) }
            IdentityContent(identity, repository, local = false, onSignOut = signOut)
        }
        !attempted || state is AuthState.AuthLoading -> Scaffold { padding -> Box(Modifier.padding(padding)) {
            ScreenColumn("Connecting your account…") { CircularProgressIndicator() }
        } }
        else -> Scaffold { padding -> Box(Modifier.padding(padding)) {
            ScreenColumn("Unable to connect") {
                Text("Convex authentication could not be established or refreshed. Check the Clerk convex JWT template, deployment configuration, and connection. No local fallback is active.")
                ActionButton("Retry authentication") { retry++ }
                ActionButton("Sign out", !signingOut, signOut)
            }
        } }
    }
}

@Composable
private fun IdentityContent(identity: String, repository: Repository, local: Boolean, onSignOut: () -> Unit) {
    key(identity, repository) {
        val context = LocalContext.current
        val owner = remember { object : ViewModelStoreOwner { override val viewModelStore = ViewModelStore() } }
        DisposableEffect(owner) { onDispose { owner.viewModelStore.clear() } }
        val vm: Nof1ViewModel = viewModel(viewModelStoreOwner = owner, factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T = Nof1ViewModel(repository, identity, local,
                if (local) null else AccountDeletionStore(File(context.noBackupFilesDir, "account-deletion"), identity)) as T
        })
        NativeApp(vm, onSignOut)
    }
}

@Composable
fun NativeApp(vm: Nof1ViewModel, onSignOut: () -> Unit) {
    var tab by rememberSaveable { mutableStateOf("Today") }
    var route by rememberSaveable { mutableStateOf<String?>(null) }
    var recordId by rememberSaveable { mutableStateOf<String?>(null) }
    var selectedPeptide by rememberSaveable { mutableStateOf<String?>(null) }
    val message by vm.message.collectAsStateWithLifecycle()
    val busy by vm.busy.collectAsStateWithLifecycle()
    val deletionPending by vm.deletionPending.collectAsStateWithLifecycle()
    val snack = remember { SnackbarHostState() }
    LaunchedEffect(message) { message?.let { snack.showSnackbar(it); vm.clearMessage() } }
    fun open(screen: String, id: String? = null) { vm.clearMessage(); route = screen; recordId = id }
    fun close() { route = null; recordId = null; selectedPeptide = null }
    BackHandler(route != null) { close() }
    Scaffold(
        snackbarHost = { SnackbarHost(snack) },
        topBar = {
            Column(Modifier.windowInsetsPadding(WindowInsets.statusBars)) {
                if (vm.local) Surface(color = MaterialTheme.colorScheme.secondaryContainer) {
                    Text("LOCAL DEVELOPMENT · ON-DEVICE DATA ONLY", Modifier.fillMaxWidth().padding(8.dp), style = MaterialTheme.typography.labelSmall)
                }
                if (route != null) TextButton(onClick = { close() }, modifier = Modifier.heightIn(min = 48.dp)) { Text("Back") }
                if (busy) LinearProgressIndicator(Modifier.fillMaxWidth())
            }
        },
        bottomBar = {
            NavigationBar {
                listOf("Today", "Peptides", "Log", "Protocols", "Profile").forEachIndexed { index, label ->
                    NavigationBarItem(
                        selected = tab == label && route == null,
                        onClick = { tab = label; close() },
                        icon = { Text(listOf("◷", "◇", "+", "▤", "○")[index], style = MaterialTheme.typography.titleLarge) },
                        label = { Text(label) }, modifier = Modifier.testTag("tab-${label.lowercase()}"),
                    )
                }
            }
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            if (deletionPending) {
                ScreenColumn("Account deletion pending") {
                    Text("New writes are blocked because account deletion has started. Your app records may already have been removed. Finish deletion or contact support; subscriptions are not cancelled automatically.")
                    ActionButton("Complete account deletion", !busy && BuildConfig.ENABLE_ACCOUNT_DELETION) { vm.deleteAccount() }
                    ActionButton("Sign out", !busy, onSignOut)
                    Text("Support: anam@revyl.ai")
                }
                return@Box
            }
            when (route) {
                "peptide" -> PeptideDetailScreen(recordId.orEmpty(),
                    onCreateExperiment = { selectedPeptide = it; open("new-experiment") },
                    onCreateProtocol = { selectedPeptide = it; open("new-protocol") },
                    onAddToStack = { selectedPeptide = it; open("stack") },
                    onLogDose = { selectedPeptide = it; open("dose") },
                )
                "experiments" -> ExperimentsScreen(vm, { open("new-experiment") }, { open("experiment", it) })
                "new-experiment" -> CreateExperimentScreen(vm, selectedPeptide) { selectedPeptide = null; open("experiments") }
                "experiment" -> ExperimentDetailScreen(vm, recordId.orEmpty(), { open("entry", recordId) }, { open("experiments") })
                "entry" -> ExperimentEntryScreen(vm, recordId.orEmpty()) { open("experiment", recordId) }
                "new-protocol" -> ProtocolEditorScreen(vm, peptideId = selectedPeptide) { tab = "Protocols"; close() }
                "edit-protocol" -> ProtocolEditorScreen(vm, id = recordId) { tab = "Protocols"; close() }
                "stack" -> QuickLogScreen(vm, selectedPeptide, "stack", { tab = "Today"; close() }, { open("experiments") })
                "dose" -> QuickLogScreen(vm, selectedPeptide, "dose", { tab = "Today"; close() }, { open("experiments") })
                "subscription" -> SubscriptionScreen(vm)
                "health" -> UnavailableScreen("Health connections", "Terra and Health Connect are not configured for this native app. No health account is connected and no health measurements are imported.")
                "settings" -> UnavailableScreen("Settings", "The native app follows the source dark theme. Notification scheduling and data export are not implemented. No reminder or export is created by viewing this screen.")
                "privacy", "terms", "medical" -> LegalScreen(route.orEmpty())
                else -> when (tab) {
                    "Today" -> TodayScreen(vm, { tab = "Log" }, { tab = "Peptides" }, { open("stack") })
                    "Peptides" -> CatalogScreen { open("peptide", it) }
                    "Log" -> QuickLogScreen(vm, null, "dose", { tab = "Today" }, { open("experiments") })
                    "Protocols" -> ProtocolsScreen(vm, { open("new-protocol") }, { open("edit-protocol", it) })
                    "Profile" -> ProfileScreen(vm, { open(it) }, onSignOut)
                }
            }
        }
    }
}

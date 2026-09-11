package com.nof1.experiments.nativeapp

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.user.delete
import com.nof1.experiments.nativeapp.data.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class Nof1ViewModel(val repository: Repository, val identity: String, val local: Boolean, private val deletionStore: AccountDeletionStore? = null) : ViewModel() {
    val experiments = repository.experiments.asLoadStates().stateIn(viewModelScope, SharingStarted.WhileSubscribed(0), LoadState.Loading)
    val protocols = repository.protocols.asLoadStates().stateIn(viewModelScope, SharingStarted.WhileSubscribed(0), LoadState.Loading)
    val doses = repository.doses.asLoadStates().stateIn(viewModelScope, SharingStarted.WhileSubscribed(0), LoadState.Loading)
    val metrics = repository.metrics.asLoadStates().stateIn(viewModelScope, SharingStarted.WhileSubscribed(0), LoadState.Loading)
    val stack = repository.stack.asLoadStates().stateIn(viewModelScope, SharingStarted.WhileSubscribed(0), LoadState.Loading)
    val billing = repository.billing.asLoadStates().stateIn(viewModelScope, SharingStarted.WhileSubscribed(0), LoadState.Loading)
    private val _busy = MutableStateFlow(false)
    val busy = _busy.asStateFlow()
    private val _message = MutableStateFlow<String?>(null)
    val message = _message.asStateFlow()
    private val _deletionPending = MutableStateFlow(!local && deletionStore?.isPending() == true)
    val deletionPending = _deletionPending.asStateFlow()

    fun clearMessage() { _message.value = null }

    fun submit(call: () -> MutationCall, onSuccess: () -> Unit = {}) {
        if (_deletionPending.value) {
            _message.value = "Complete or resolve the pending account deletion before creating new records."
            return
        }
        if (_busy.value) return
        _busy.value = true
        _message.value = null
        viewModelScope.launch {
            try {
                repository.mutate(call())
                _message.value = if (local) "Saved on this device · local development only" else "Saved to your account"
                onSuccess()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (error: Exception) {
                _message.value = if (error is IllegalArgumentException) error.message else
                    "The operation could not be confirmed. Check your connection and account access, then check your records before trying again."
            } finally {
                _busy.value = false
            }
        }
    }

    fun deleteAccount() {
        if (local || !BuildConfig.ENABLE_ACCOUNT_DELETION || _busy.value) return
        _busy.value = true
        viewModelScope.launch {
            var appDataDeleted = false
            try {
                val user = Clerk.user ?: error("No signed-in account")
                val expectedSession = Clerk.activeSession?.id ?: error("No active session")
                require(user.id == identity) { "The active account changed" }
                deletionStore?.markPending()
                _deletionPending.value = true
                repository.mutate("account:deleteMyData")
                appDataDeleted = true
                require(Clerk.user?.id == identity && Clerk.activeSession?.id == expectedSession) { "The active account changed" }
                when (user.delete()) {
                    is ClerkResult.Failure -> error("Clerk account deletion failed")
                    is ClerkResult.Success -> {
                        deletionStore?.clear()
                        when (Clerk.auth.signOut()) {
                            is ClerkResult.Success -> Unit
                            is ClerkResult.Failure -> _message.value = "Your account was deleted, but local sign-out cleanup failed. Sign out again or close the app. Store subscriptions were not cancelled."
                        }
                    }
                }
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (error: Exception) {
                _message.value = if (appDataDeleted)
                    "Your Nof1 app data was deleted, but account deletion could not be completed. Contact support or retry account deletion. Store subscriptions were not cancelled."
                else "Deletion could not be confirmed. Your account has not been deleted. Check your connection and contact support before retrying."
            } finally {
                _busy.value = false
            }
        }
    }

    fun logDoseAndStack(dose: DoseInput, stack: StackInput?, onSaved: () -> Unit, onDoseOnly: () -> Unit) {
        if (_busy.value || _deletionPending.value) return
        _busy.value = true
        _message.value = null
        viewModelScope.launch {
            var doseSaved = false
            try {
                val doseCall = Api.logDose(dose)
                val stackCall = stack?.let { Api.addToStack(it) }
                repository.mutate(doseCall)
                doseSaved = true
                stackCall?.let { repository.mutate(it) }
                _message.value = if (local) "Saved on this device · local development only" else "Saved to your account"
                onSaved()
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (error: Exception) {
                if (doseSaved) {
                    _message.value = "Dose saved. The stack update could not be confirmed. Check your stack before saving a stack item; do not log this dose again."
                    onDoseOnly()
                } else _message.value = if (error is IllegalArgumentException) error.message else
                    "The dose could not be confirmed. Check your records before trying again."
            } finally {
                _busy.value = false
            }
        }
    }
}

package com.nof1.experiments.nativeapp

import java.io.File
import java.security.MessageDigest

class AccountDeletionStore(directory: File, identity: String) {
    private val digest = MessageDigest.getInstance("SHA-256").digest(identity.toByteArray())
        .joinToString("") { "%02x".format(it) }
    private val marker = File(directory, "$digest.pending")

    fun isPending(): Boolean = marker.exists()

    fun markPending() {
        check(marker.parentFile?.let { it.isDirectory || it.mkdirs() } == true) { "Cannot preserve account deletion state" }
        check(marker.exists() || marker.createNewFile()) { "Cannot preserve account deletion state" }
    }

    fun clear() {
        check(!marker.exists() || marker.delete()) { "Cannot clear account deletion state" }
    }
}

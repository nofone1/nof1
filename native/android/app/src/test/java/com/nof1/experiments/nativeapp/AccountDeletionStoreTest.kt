package com.nof1.experiments.nativeapp

import java.nio.file.Files
import org.junit.Assert.*
import org.junit.Test

class AccountDeletionStoreTest {
    @Test fun pendingDeletionSurvivesReopeningWithoutCrossingAccounts() {
        val directory = Files.createTempDirectory("nof1-deletion-test").toFile()
        try {
            val first = AccountDeletionStore(directory, "account-a")
            first.markPending()
            assertTrue(AccountDeletionStore(directory, "account-a").isPending())
            assertFalse(AccountDeletionStore(directory, "account-b").isPending())
            first.clear()
            assertFalse(AccountDeletionStore(directory, "account-a").isPending())
        } finally { directory.deleteRecursively() }
    }
}

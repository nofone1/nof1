# QA Manual Testing Guide

This document provides step-by-step instructions for manually testing the N-of-1 Experiment Tracker app.

---

## Setup Instructions

### Prerequisites

- Node.js installed (v18 or higher)
- Xcode installed (for iOS Simulator on Mac)
- Android Studio installed (for Android Emulator)

---

## Option 1: Simulator Build (Recommended for QA)

This creates a standalone app that runs without needing the Expo CLI or development server.

### One-Time Setup

1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to Expo (create free account at expo.dev if needed):
   ```bash
   eas login
   ```

3. Configure EAS Build (first time only):
   ```bash
   eas build:configure
   ```

### Building for iOS Simulator

```bash
# Create iOS Simulator build
eas build --profile development --platform ios --local

# Or build on Expo's servers (no local Xcode needed):
eas build --profile development --platform ios
```

Once complete, you'll get a `.app` file (local) or download link (cloud).

### Installing on iOS Simulator

```bash
# If you built locally, the .app file is in your project
# Drag and drop the .app file onto the Simulator

# Or install via command line:
xcrun simctl install booted /path/to/your-app.app

# To launch:
xcrun simctl launch booted com.nof1.experiments
```

### Building for Android Emulator

```bash
# Create Android Emulator build
eas build --profile development --platform android --local

# Or build on Expo's servers:
eas build --profile development --platform android
```

Once complete, you'll get an `.apk` file.

### Installing on Android Emulator

```bash
# Drag and drop the .apk file onto the Emulator

# Or install via command line:
adb install /path/to/your-app.apk
```

### EAS Build Configuration

Add this to your `eas.json` file (create if it doesn't exist):

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {}
  }
}
```

---

## Option 2: Development Mode (For Developers)

Use this when you need hot reloading during development.

### Starting the App

1. Open terminal in the project directory
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Choose how to run the app:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on physical device

---

## Resetting App State (Clean Slate)

Before running a full test pass, reset the app to a clean state:

- **iOS Simulator:** Long press the app icon > Remove App > Delete App
- **Android Emulator:** Long press the app icon > App Info > Clear Data
- **Expo Go:** Shake device > "Clear Expo Go Data"

---

## Test Credentials

The app uses mock authentication. Use these credentials:

| Email | Password |
|-------|----------|
| `test@nof1.app` | `test123` |

> **Note:** Any email containing `@` with a password of 6+ characters will work.

---

## Test Checklist

### Section 1: Authentication

#### Test 1.1: Sign In - Valid Credentials
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Launch app | Sign In screen displays |
| 2 | Enter email: `test@nof1.app` | Email field populated |
| 3 | Enter password: `test123` | Password field populated (masked) |
| 4 | Tap "Sign In" button | Loading indicator appears briefly |
| 5 | Verify | Home screen displays with "Your Experiments" header |

**Result:** ☐ Pass ☐ Fail

---

#### Test 1.2: Sign In - Invalid Email
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Sign In screen, enter email: `invalid` | Email field populated |
| 2 | Enter password: `test123` | Password field populated |
| 3 | Tap "Sign In" button | Error message: "Please enter a valid email" |

**Result:** ☐ Pass ☐ Fail

---

#### Test 1.3: Sign In - Short Password
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Sign In screen, enter email: `test@nof1.app` | Email field populated |
| 2 | Enter password: `123` | Password field populated |
| 3 | Tap "Sign In" button | Error message about password length |

**Result:** ☐ Pass ☐ Fail

---

#### Test 1.4: Sign Up Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Sign In screen, tap "Sign Up" link | Sign Up screen displays |
| 2 | Enter email: `newuser@nof1.app` | Email field populated |
| 3 | Enter password: `test123` | Password field populated |
| 4 | Enter confirm password: `test123` | Confirm password field populated |
| 5 | Tap "Sign Up" button | Verification code screen displays |
| 6 | Enter code: `123456` | Code field populated |
| 7 | Tap "Verify" button | Home screen displays |

**Result:** ☐ Pass ☐ Fail

---

#### Test 1.5: Session Persistence
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sign in with valid credentials | Home screen displays |
| 2 | Close the app completely | App closes |
| 3 | Reopen the app | Home screen displays (still signed in) |

**Result:** ☐ Pass ☐ Fail

---

#### Test 1.6: Sign Out
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | While signed in, tap "Profile" tab | Profile screen displays |
| 2 | Scroll down and tap "Sign Out" | Confirmation dialog appears |
| 3 | Tap "Confirm" or "Sign Out" | Sign In screen displays |

**Result:** ☐ Pass ☐ Fail

---

### Section 2: Experiment Creation

#### Test 2.1: Create Experiment - Happy Path
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sign in and tap "New" tab | Create Experiment screen (Step 1) |
| 2 | Enter name: `Creatine Energy Test` | Name field populated |
| 3 | Enter hypothesis: `Taking creatine will improve my energy levels` | Hypothesis field populated |
| 4 | Tap "Next" | Step 2 (Intervention) displays |
| 5 | Enter intervention name: `Creatine Monohydrate` | Name field populated |
| 6 | Select type: `Supplement` | Type selected |
| 7 | Enter dosage: `5g` | Dosage field populated |
| 8 | Select frequency: `Daily` | Frequency selected |
| 9 | Tap "Next" | Step 3 (Schedule) displays |
| 10 | Set phase duration: `7` days | Duration set |
| 11 | Set total cycles: `4` | Cycles set |
| 12 | Tap "Create Experiment" | Home screen displays |
| 13 | Verify | New experiment card visible in list |

**Result:** ☐ Pass ☐ Fail

---

#### Test 2.2: Create Experiment - Validation (Empty Name)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "New" tab | Create Experiment screen displays |
| 2 | Leave name field empty | Name field empty |
| 3 | Tap "Next" | Error message displayed, cannot proceed |

**Result:** ☐ Pass ☐ Fail

---

#### Test 2.3: Back Navigation Preserves Data
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Create Experiment, enter name: `Test Experiment` | Name field populated |
| 2 | Tap "Next" to go to Step 2 | Step 2 displays |
| 3 | Tap back button | Step 1 displays |
| 4 | Verify | Name field still contains `Test Experiment` |

**Result:** ☐ Pass ☐ Fail

---

### Section 3: Experiment Management

> **Prerequisite:** Create an experiment first (Test 2.1) before running these tests.

#### Test 3.1: View Experiment Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Home screen, tap an experiment card | Detail screen displays |
| 2 | Verify content | Name, status, intervention details, hypothesis visible |
| 3 | Verify stats | Entry count, metrics count displayed |
| 4 | Verify schedule | Phase duration, cycles, start date displayed |

**Result:** ☐ Pass ☐ Fail

---

#### Test 3.2: Pause Experiment
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open an active experiment's detail screen | Detail screen displays, status is "active" |
| 2 | Tap "Pause" button | Status changes to "paused" |
| 3 | Verify | Status badge shows "paused" |

**Result:** ☐ Pass ☐ Fail

---

#### Test 3.3: Resume Experiment
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open a paused experiment's detail screen | Detail screen displays, status is "paused" |
| 2 | Tap "Resume" button | Status changes to "active" |
| 3 | Verify | Status badge shows "active" |

**Result:** ☐ Pass ☐ Fail

---

#### Test 3.4: Complete Experiment
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open an active experiment's detail screen | Detail screen displays |
| 2 | Tap "Complete" button | Status changes to "completed" |
| 3 | Verify | Status badge shows "completed" |
| 4 | Verify | Pause/Resume buttons no longer visible |

**Result:** ☐ Pass ☐ Fail

---

#### Test 3.5: Delete Experiment - Confirm
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open an experiment's detail screen | Detail screen displays |
| 2 | Tap "Delete" button | Confirmation dialog appears |
| 3 | Tap "Confirm" or "Delete" | Navigate to Home screen |
| 4 | Verify | Experiment no longer in list |

**Result:** ☐ Pass ☐ Fail

---

#### Test 3.6: Delete Experiment - Cancel
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open an experiment's detail screen | Detail screen displays |
| 2 | Tap "Delete" button | Confirmation dialog appears |
| 3 | Tap "Cancel" | Dialog closes |
| 4 | Verify | Still on detail screen, experiment exists |

**Result:** ☐ Pass ☐ Fail

---

### Section 4: Navigation

#### Test 4.1: Tab Navigation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "Experiments" tab (Home icon) | Home screen displays |
| 2 | Tap "New" tab | Create Experiment screen displays |
| 3 | Tap "Profile" tab | Profile screen displays |
| 4 | Tap "Experiments" tab again | Home screen displays |

**Result:** ☐ Pass ☐ Fail

---

#### Test 4.2: Back Navigation from Detail
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Home, tap an experiment card | Detail screen displays |
| 2 | Tap back button (top left) | Home screen displays |

**Result:** ☐ Pass ☐ Fail

---

#### Test 4.3: Pull to Refresh
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Home screen, pull down on the list | Loading indicator appears |
| 2 | Release | List refreshes, loading indicator disappears |

**Result:** ☐ Pass ☐ Fail

---

### Section 5: Edge Cases

#### Test 5.1: Empty State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Sign in with a fresh account (no experiments) | Home screen displays |
| 2 | Verify | Empty state message displayed |
| 3 | Verify | Call-to-action to create first experiment visible |

**Result:** ☐ Pass ☐ Fail

---

#### Test 5.2: Long Text Handling
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Create experiment with very long name (50+ characters) | Experiment created |
| 2 | View in Home list | Name truncates with ellipsis (...) |
| 3 | View in Detail screen | Full name displays (may wrap) |

**Result:** ☐ Pass ☐ Fail

---

## Quick Smoke Test (5 minutes)

Use this abbreviated checklist for quick verification:

| # | Test | Result |
|---|------|--------|
| 1 | Sign in with `test@nof1.app` / `test123` | ☐ Pass ☐ Fail |
| 2 | Create a new experiment | ☐ Pass ☐ Fail |
| 3 | View experiment detail | ☐ Pass ☐ Fail |
| 4 | Pause and Resume experiment | ☐ Pass ☐ Fail |
| 5 | Delete experiment | ☐ Pass ☐ Fail |
| 6 | Sign out | ☐ Pass ☐ Fail |

---

## Bug Report Template

When a test fails, document the issue using this template:

```
**Test ID:** [e.g., Test 2.1]
**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**Device:** [e.g., iPhone 15 Simulator, Pixel 7 Emulator]
**OS Version:** [e.g., iOS 17.2, Android 14]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshot/Video:**
[Attach if applicable]

**Severity:** [Critical / High / Medium / Low]
```

---

## Test Run Summary

| Date | Tester | Platform | Tests Passed | Tests Failed | Notes |
|------|--------|----------|--------------|--------------|-------|
| | | | /20 | | |

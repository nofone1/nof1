# Release Guide: N-of-1 Experiments

Step-by-step instructions for building and submitting the app to TestFlight (iOS) and Google Play internal testing (Android).

## Prerequisites

### For all releases

- [Node.js](https://nodejs.org) 18+
- [EAS CLI](https://docs.expo.dev/build/setup/): `npm install -g eas-cli`
- Logged into EAS: `eas login`

### iOS (TestFlight)

- **Apple Developer Program** membership ($99/year): [developer.apple.com](https://developer.apple.com/programs/)
- First time: EAS will prompt for your Apple ID and can create the App Store Connect app record and provisioning profiles.

### Android (Play Store)

- **Google Play Developer** account ($25 one-time): [play.google.com/console](https://play.google.com/console)
- Create an app in the Play Console and complete the initial setup (e.g. store listing, content rating).

---

## Building

### iOS (production build for TestFlight)

```bash
eas build --platform ios --profile production
```

- Build runs on EAS servers.
- When prompted, sign in with your Apple ID if needed.
- When the build finishes, note the build ID or artifact URL.

### Android (production build for Play Store)

```bash
eas build --platform android --profile production
```

- Produces an **App Bundle** (`.aab`), which is required for Play Store.
- When the build finishes, note the build ID or artifact URL.

### Build both platforms

```bash
eas build --platform all --profile production
```

---

## Submitting

### iOS: Submit to TestFlight

1. Ensure you have a completed **production** iOS build (see above).
2. Run:
   ```bash
   eas submit --platform ios
   ```
3. Select the build to submit (or pass `--latest` to use the most recent production build).
4. If `eas.json` has empty `appleId` / `ascAppId`, EAS will prompt you. You can fill them in `eas.json` under `submit.production.ios` to skip prompts next time:
   - `appleId`: your Apple ID email
   - `ascAppId`: the App Store Connect app ID (numeric, from App Store Connect → your app → General → App Information).

After upload, the build appears in [App Store Connect](https://appstoreconnect.apple.com) under TestFlight. Add internal testers and (optionally) external testers there.

### Android: Submit to internal testing

1. Ensure you have a completed **production** Android build (App Bundle).
2. Run:
   ```bash
   eas submit --platform android
   ```
3. Select the build to submit (or use `--latest`).
4. The app is uploaded to the **internal testing** track (configured in `eas.json`). You can promote it to closed/open testing or production from the Play Console.

---

## Version numbers for future releases

Each new store release must use a **higher** version than the previous one.

### User-facing version (both platforms)

In `app.json`, under `expo`:

- **version**: e.g. `"1.0.0"` → `"1.0.1"` or `"1.1.0"`.

### iOS: build number

In `app.json`, under `expo.ios`:

- **buildNumber**: string, e.g. `"1"` → `"2"` → `"3"`. Must increase for every build you submit to App Store Connect (including TestFlight).

### Android: version code

In `app.json`, under `expo.android`:

- **versionCode**: integer, e.g. `1` → `2` → `3`. Must increase for every build you upload to Play Console.

### Checklist before each release

1. Bump `expo.version` if you want a new user-visible version.
2. Bump `expo.ios.buildNumber`.
3. Bump `expo.android.versionCode`.
4. Run `eas build` then `eas submit` as above.

---

## Troubleshooting

### Build fails: missing icon or assets

- Ensure `assets/icon.png` and `assets/adaptive-icon.png` exist and are valid PNGs (e.g. 1024×1024).
- Run `npx expo prebuild --clean` locally to verify native projects pick up assets (optional).

### iOS: "No valid code signing identity"

- EAS usually manages certificates. Run `eas credentials` and follow prompts to fix or reset iOS credentials.
- Ensure your Apple Developer account has the right capabilities and that the app’s bundle ID matches.

### Android: "You need to use a different version code"

- Each upload must have a **versionCode** higher than the last one. Increment `versionCode` in `app.json` and rebuild.

### Submit fails: "App not found" or wrong app

- **iOS**: Confirm `ascAppId` in `eas.json` matches the app in App Store Connect. Create the app in App Store Connect first if it doesn’t exist.
- **Android**: Ensure the app is created in the Play Console and the package name in `app.json` (`expo.android.package`) matches.

### EAS project not linked

- Ensure `app.json` has `extra.eas.projectId` (already set for this project). If you created a new Expo account or project, run `eas init` to link the project.

---

## Quick reference

| Action              | Command                                      |
|---------------------|----------------------------------------------|
| Build iOS           | `eas build --platform ios --profile production`   |
| Build Android       | `eas build --platform android --profile production` |
| Submit iOS          | `eas submit --platform ios`                   |
| Submit Android      | `eas submit --platform android`               |
| View build status   | [expo.dev](https://expo.dev) → your project → Builds |

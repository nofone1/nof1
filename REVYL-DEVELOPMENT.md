# Revyl-First Development Cheatsheet

**Revyl-first development** means writing an end-to-end test that describes the user journey before implementing the feature, then coding until the test passes.

**Core loop:** Write Test → Fail → Build → Pass → Ship

---

## Commands Cheatsheet

| Action | Command |
|--------|---------|
| Start dev session | `revyl --dev open test <name> --interactive --hotreload --variant ios` |
| Run single test | `revyl --dev run test <name>` |
| Run all tests | `revyl --dev run workflow nof1-all-tests` |
| Create new test | `revyl create test <name>` |
| Sync tests | `revyl sync` |
| Debug mode | `revyl --dev run test <name> --debug` |

---

## Test Template

Copy this into `.revyl/tests/<feature-name>.yaml`:

```yaml
test:
  metadata:
    name: feature-name
    platform: ios
  blocks:
    - id: setup
      type: instructions
      step_description: |
        1. Sign in with test@nof1.app / test123
    - id: action
      type: instructions
      step_description: |
        1. Do the thing
    - id: validate
      type: validation
      step_description: Expected result
```

---

## Available Variants

| Variant | Description |
|---------|-------------|
| `ios` | iOS dev build |
| `android` | Android dev build |
| `revyl-ios-skip-login` | iOS without auth |
| `revyl-android-skip-login` | Android without auth |

---

## Existing Tests

| Test | What it covers |
|------|----------------|
| `app-open-ios` | App launches on iOS |
| `app-open-android` | App launches on Android |
| `login-flow` | Sign in with test credentials |
| `experiments` | Create experiment flow (login → create) |
| `experiments-no-login` | Experiment flow without auth |
| `peptide-view` | View peptide details |
| `open` | Basic open flow |
| `styshi` | Custom test |

---

## Development Workflow

1. **Write test** describing the feature (add or edit a YAML file in `.revyl/tests/`).
2. **Run test** — expect it to fail: `revyl --dev run test <name>`.
3. **Start interactive session** with hot reload: `revyl --dev open test <name> --interactive --hotreload --variant ios`.
4. **Code until test passes** — save and watch the test re-run.
5. **Run regression tests**: `revyl --dev run workflow nof1-all-tests`.
6. **Build production and submit**: `eas build --platform ios --profile production` then `eas submit --platform ios --latest`.

---

## Tips

- Use `--hotreload` during development for fast iteration.
- Use `--interactive` to watch test execution step-by-step.
- Run the `nof1-all-tests` workflow before submitting to TestFlight.
- Test credentials: `test@nof1.app` / `test123`.

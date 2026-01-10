# N-of-1 Experiments

A React Native mobile app for conducting personal N-of-1 experiments to discover what supplements, peptides, and interventions actually work for you.

## What is an N-of-1 Experiment?

An N-of-1 experiment is a clinical trial where you are both the subject and the scientist. Instead of relying on population-level studies, you systematically test interventions on yourself using controlled on/off phases to determine what actually works for YOUR body.

**Why it matters:**
- Population studies show averages; your response may differ significantly
- Personal data is more actionable than general recommendations
- Systematic tracking eliminates confirmation bias
- Build evidence-based confidence in your supplement stack

## Features

- **Create Experiments** - Set up N-of-1 trials for any supplement or intervention
- **Track Metrics** - Log daily observations with customizable metrics
- **Structured Phases** - Alternating on/off periods for controlled testing
- **Progress Tracking** - Visualize your experiment progress
- **Authentication** - Mock auth (ready for Clerk integration)
- **Offline Support** - Local data persistence with AsyncStorage
- **Observability** - Built-in logging for debugging and analytics

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | [Expo](https://expo.dev) SDK 52+ | Cross-platform React Native development |
| Language | TypeScript | Type safety and better developer experience |
| Navigation | [React Navigation](https://reactnavigation.org) v7 | Type-safe navigation |
| Authentication | Mock Auth (Clerk-ready) | User authentication |
| State Management | [Zustand](https://zustand-demo.pmnd.rs) | Lightweight global state |
| Storage | AsyncStorage | Persistent local storage |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) 18+ 
- [npm](https://www.npmjs.com) or [yarn](https://yarnpkg.com)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Navigate to the project**
   ```bash
   cd irvine
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
irvine/
├── App.tsx                      # Entry point
├── src/
│   ├── providers/
│   │   └── providers.tsx        # Context providers (Auth, SafeArea)
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── loading.tsx
│   │   └── experiment/
│   │       └── experiment-card.tsx
│   ├── config/
│   │   └── env.ts               # Environment configuration
│   ├── hooks/
│   │   ├── use-experiments.ts
│   │   └── use-logger.ts
│   ├── navigation/
│   │   ├── index.tsx            # Root navigator
│   │   ├── auth-navigator.tsx
│   │   └── main-navigator.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── sign-in.tsx
│   │   │   └── sign-up.tsx
│   │   ├── home/
│   │   │   └── index.tsx
│   │   ├── experiment/
│   │   │   ├── create.tsx
│   │   │   └── detail.tsx
│   │   └── profile/
│   │       └── index.tsx
│   ├── services/
│   │   ├── auth/
│   │   │   ├── auth-context.tsx # Mock auth provider
│   │   │   └── auth-service.ts
│   │   └── logging/
│   │       ├── logger.ts
│   │       └── types.ts
│   ├── stores/
│   │   └── experiment-store.ts  # Zustand store
│   ├── theme/
│   │   └── colors.ts            # Color definitions
│   ├── types/
│   │   ├── experiment.ts
│   │   ├── navigation.ts
│   │   └── user.ts
│   └── utils/
│       └── constants.ts
└── assets/
    └── images/
```

## Authentication

The app currently uses **mock authentication** for development. It mimics Clerk's API structure so switching to real auth is straightforward.

### Mock Auth Behavior
- **Sign In**: Accepts any email containing `@` and password with 6+ characters
- **Sign Up**: Same as sign in, with a mock verification step (enter any 6 digits)
- **Persistence**: Login state is stored in AsyncStorage

### Adding Real Authentication (Clerk)

When Clerk releases a version compatible with Expo SDK 52:

1. Install dependencies:
   ```bash
   npm install @clerk/clerk-expo expo-auth-session expo-web-browser expo-secure-store --legacy-peer-deps
   ```

2. Update `src/providers/providers.tsx` to use `ClerkProvider`

3. Update auth imports in screens to use `@clerk/clerk-expo`

## Observability & Logging

### Using the Logger

```typescript
import { logger } from '@/services/logging';

// Basic logging
logger.info('User created experiment', { experimentId: '123' });
logger.warn('API response slow', { extra: { responseTime: 5000 } });
logger.error('Failed to save', {}, error);

// With screen context (in components)
const { log } = useLogger('HomeScreen');
log.info('Button pressed');
```

### Log Levels

| Level | Use Case |
|-------|----------|
| `DEBUG` | Detailed diagnostic information |
| `INFO` | General operational events |
| `WARN` | Potentially problematic situations |
| `ERROR` | Errors that affect functionality |

## Development

### Running the App

```bash
# Start development server
npx expo start

# Clear cache and start
npx expo start --clear

# Run on specific platform
npx expo start --ios
npx expo start --android
```

### Building

```bash
# Development build
npx expo run:ios
npx expo run:android

# Production build (requires EAS)
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### Common Issues

**Metro bundler issues**
```bash
npx expo start --clear
```

**Dependency conflicts**
```bash
rm -rf node_modules
npm install --legacy-peer-deps
```

**iOS build fails**
```bash
cd ios && pod install && cd ..
```

**Android build fails**
```bash
cd android && ./gradlew clean && cd ..
```

## Data Models

### Experiment

```typescript
interface Experiment {
  id: string;
  userId: string;
  name: string;                    // "Testing Creatine for Energy"
  hypothesis: string;              // What you expect to observe
  intervention: {
    name: string;                  // "Creatine Monohydrate"
    type: InterventionType;        // supplement, peptide, etc.
    dosage: string;                // "5g"
    frequency: string;             // "Once daily"
  };
  metrics: Metric[];               // Energy, Sleep, Focus, etc.
  schedule: {
    startDate: Date;
    phaseDurationDays: number;     // Days per on/off phase
    totalPhases: number;           // Number of cycles
  };
  status: ExperimentStatus;        // draft, active, paused, completed
  entries: ExperimentEntry[];      // Daily logs
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for the quantified self community.

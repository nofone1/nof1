/**
 * Navigation types for type-safe routing throughout the app.
 * These types ensure compile-time safety when navigating between screens.
 */

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps } from "@react-navigation/native";

/**
 * Root stack navigator parameter list.
 * Defines the top-level navigation structure.
 */
export type RootStackParamList = {
  /** Authentication flow screens */
  Auth: undefined;
  /** Main app screens (requires authentication) */
  Main: undefined;
};

/**
 * Authentication stack navigator parameter list.
 * Defines screens available before user signs in.
 */
export type AuthStackParamList = {
  /** Sign in screen */
  SignIn: undefined;
  /** Sign up/registration screen */
  SignUp: undefined;
};

/**
 * Main tab navigator parameter list.
 * Defines the bottom tab navigation structure.
 */
export type MainTabParamList = {
  /** Daily log screen - main home screen */
  Daily: undefined;
  /** Peptide database browse screen */
  Peptides: undefined;
  /** Quick log entry screen */
  Log: undefined;
  /** Protocols list screen */
  Protocols: undefined;
  /** User profile and settings */
  Profile: undefined;
};

/**
 * Main stack navigator parameter list.
 * Defines screens that can be pushed on top of the tab navigator.
 */
export type MainStackParamList = {
  /** Tab navigator container */
  Tabs: {
    /** Optional nested screen to navigate to */
    screen?: keyof MainTabParamList;
    /** Optional params for the nested screen */
    params?: MainTabParamList[keyof MainTabParamList];
  } | undefined;
  /** Create new experiment screen */
  CreateExperiment: {
    /** Optional peptide ID to pre-fill intervention data */
    peptideId?: string;
  } | undefined;
  /** Experiment detail screen */
  ExperimentDetail: {
    /** ID of the experiment to display */
    experimentId: string;
  };
  /** Add entry to experiment screen */
  AddEntry: {
    /** ID of the experiment to add entry to */
    experimentId: string;
  };
  /** Peptide detail screen */
  PeptideDetail: {
    /** ID of the peptide to display */
    peptideId: string;
  };
  /** Experiments list screen */
  Experiments: undefined;
  /** Create protocol screen */
  CreateProtocol: undefined;
  /** Health connections management */
  HealthConnections: undefined;
};

/**
 * Props type for Root stack screens.
 * @template T - Screen name from RootStackParamList
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Props type for Auth stack screens.
 * @template T - Screen name from AuthStackParamList
 */
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

/**
 * Props type for Main tab screens.
 * Composes tab props with root stack props for nested navigation.
 * @template T - Screen name from MainTabParamList
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<MainStackParamList>
  >;

/**
 * Props type for Main stack screens (screens pushed on top of tabs).
 * @template T - Screen name from MainStackParamList
 */
export type MainStackScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

/**
 * Global declaration for React Navigation to enable type checking.
 * This allows useNavigation() to be type-safe throughout the app.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

/**
 * Clerk-backed authentication adapter.
 * Preserves the app's existing auth hook API.
 */

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useAuth as useClerkAuth,
  useClerk,
  useSignIn as useClerkSignIn,
  useSignUp as useClerkSignUp,
  useUser as useClerkUser,
} from "@clerk/clerk-expo";
import { env } from "@/config/env";
import { logger } from "@/services/logging";
import { setConvexTokenGetter } from "@/services/backend/convex-client";
import { convexMutation } from "@/services/backend/convex-client";
import { migrateLocalCoreDataIfNeeded } from "@/services/backend/local-migration";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: User | null;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const DEV_SKIP_USER: User = {
  id: "dev-user",
  email: "dev@local.nof1",
  firstName: "Dev",
  lastName: "User",
};

const DEV_BYPASS_USER: User = {
  id: "dev-bypass-user",
  email: "test@gmail.com",
  firstName: "Test",
  lastName: "User",
};

// Dev-only convenience bypass for local testing of auth flow.
// Active in development builds only and intentionally hardcoded.
const DEV_SKIP_SESSION_ID = "dev-skip-session";
const DEV_BYPASS_SESSION_ID = "dev-bypass-session";
const DEV_BYPASS_EMAIL = "test@gmail.com";
const DEV_BYPASS_PASSWORD = "peptideking";

type LocalAuthMode = "skip-auth" | "dev-bypass" | "none";

// Dogfood: omit Clerk (env.skipAuth) but start signed-out so before_session +
// auth_bypass can prove the deep-link round trip via acceptRevylAuthBypass().
let skipAuthSignedInState = false;
let skipAuthMode: LocalAuthMode = "none";
const skipAuthListeners = new Set<() => void>();

/**
 * Signs in the local dogfood session after a validated Revyl auth-bypass link.
 *
 * Params:
 *   role: Allowlisted role from the deep-link query (logged only).
 *
 * Returns:
 *   void.
 *
 * Edge cases:
 *   Safe to call more than once; identical state is a no-op.
 */
export function acceptRevylAuthBypass(role: string = "tester"): void {
  logger.info("Revyl auth bypass accepted", { extra: { role } });
  setSkipAuthSignedInState(true, "dev-bypass");
}

/**
 * Registers a listener for skip-auth signed-in state changes.
 *
 * Params:
 *   listener: Callback invoked when skip-auth state changes.
 *
 * Returns:
 *   Unsubscribe function.
 */
function subscribeSkipAuth(listener: () => void): () => void {
  skipAuthListeners.add(listener);
  return () => {
    skipAuthListeners.delete(listener);
  };
}

/**
 * Returns the current skip-auth signed-in snapshot for useSyncExternalStore.
 *
 * Returns:
 *   True when the local skip-auth session is signed in.
 */
function getSkipAuthSnapshot(): boolean {
  return skipAuthSignedInState;
}

/**
 * Updates the local skip-auth signed-in state and notifies listeners.
 *
 * Params:
 *   nextState: Whether the local session should be signed in.
 *   nextMode: Local auth mode to associate when signed in.
 *
 * Edge cases:
 *   No-ops when both state and mode are unchanged.
 */
function setSkipAuthSignedInState(
  nextState: boolean,
  nextMode: LocalAuthMode = "none"
): void {
  if (
    skipAuthSignedInState === nextState &&
    skipAuthMode === (nextState ? nextMode : "none")
  ) {
    return;
  }

  skipAuthSignedInState = nextState;
  skipAuthMode = nextState ? nextMode : "none";
  skipAuthListeners.forEach((listener) => listener());
}

/**
 * Subscribes to the local skip-auth signed-in flag.
 *
 * Returns:
 *   Current skip-auth signed-in boolean.
 */
function useSkipAuthSignedInState(): boolean {
  return useSyncExternalStore(subscribeSkipAuth, getSkipAuthSnapshot, getSkipAuthSnapshot);
}

/**
 * Returns the current skip-auth mode snapshot.
 *
 * Returns:
 *   Active LocalAuthMode value.
 */
function getSkipAuthModeSnapshot(): LocalAuthMode {
  return skipAuthMode;
}

/**
 * Subscribes to the local skip-auth mode.
 *
 * Returns:
 *   Current LocalAuthMode.
 */
/**
 * Subscribes to the local skip-auth mode for UI (e.g. Profile auth hint).
 *
 * Returns:
 *   Current LocalAuthMode (`dev-bypass` after a successful Revyl deep link).
 */
export function useLocalAuthMode(): LocalAuthMode {
  return useSyncExternalStore(
    subscribeSkipAuth,
    getSkipAuthModeSnapshot,
    getSkipAuthModeSnapshot
  );
}

function useSkipAuthMode(): LocalAuthMode {
  return useLocalAuthMode();
}

/**
 * Returns whether the given credentials match the hardcoded dev bypass login.
 *
 * Params:
 *   identifier: Email/username entered by the user.
 *   password: Password entered by the user.
 *
 * Returns:
 *   True only in development builds with the exact bypass credentials.
 */
function isDevBypassCredential(identifier: string, password: string): boolean {
  return (
    env.isDevelopment &&
    // Keep this login shortcut explicit and intentionally scoped to dev only.
    identifier === DEV_BYPASS_EMAIL &&
    password === DEV_BYPASS_PASSWORD
  );
}

/**
 * Returns auth loaded/signed-in/signOut state for the app shell.
 *
 * Returns:
 *   Auth control fields used by navigation and settings.
 *
 * Edge cases:
 *   When EXPO_PUBLIC_SKIP_AUTH is enabled, Clerk hooks are not called because
 *   ClerkProvider is omitted from the tree.
 */
type AuthControls = Pick<
  AuthContextValue,
  "isLoaded" | "isSignedIn" | "signOut" | "deleteAccount"
>;

/** Returns auth controls for builds that intentionally omit Clerk. */
function useSkipAuthControls(): AuthControls {
  const isSkipAuthSignedIn = useSkipAuthSignedInState();

  return {
    isLoaded: true,
    isSignedIn: isSkipAuthSignedIn,
    signOut: async () => {
      logger.info("Skip-auth sign out");
      setSkipAuthSignedInState(false);
    },
    deleteAccount: async () => {
      try {
        await AsyncStorage.clear();
      } catch (error) {
        logger.warn("Failed to clear local data after account deletion", {
          extra: { error: error instanceof Error ? error.message : String(error) },
        });
      }
      logger.clearContext();
      setSkipAuthSignedInState(false);
    },
  };
}

/** Returns Clerk-backed auth controls for signed production builds. */
function useClerkAuthControls(): AuthControls {
  const isSkipAuthSignedIn = useSkipAuthSignedInState();

  const { isLoaded, isSignedIn } = useClerkAuth();
  const { signOut, user } = useClerk();

  if (isSkipAuthSignedIn) {
    return {
      isLoaded: true,
      isSignedIn: true,
      signOut: async () => {
        logger.info("Skip-auth sign out");
        setSkipAuthSignedInState(false);
      },
      deleteAccount: async () => {
        try {
          await AsyncStorage.clear();
        } catch (error) {
          logger.warn("Failed to clear local data after account deletion", {
            extra: { error: error instanceof Error ? error.message : String(error) },
          });
        }
        logger.clearContext();
        setSkipAuthSignedInState(false);
      },
    };
  }

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    signOut,
    deleteAccount: async () => {
      if (!user) {
        throw new Error("Your account is still loading. Try again in a moment.");
      }

      // Delete app-owned records while the Clerk token is still valid, then
      // remove the identity and finally clear all on-device app data.
      await convexMutation("account:deleteMyData");
      await user.delete();
      try {
        await AsyncStorage.clear();
      } catch (error) {
        logger.warn("Failed to clear local data after account deletion", {
          extra: { error: error instanceof Error ? error.message : String(error) },
        });
      }
      logger.clearContext();
    },
  };
}

const useAuthControlsImplementation = env.skipAuth
  ? useSkipAuthControls
  : useClerkAuthControls;

export function useAuth(): AuthControls {
  return useAuthControlsImplementation();
}

/**
 * Returns the current user profile for UI display.
 *
 * Returns:
 *   Object with `user` set to the active profile, or null when signed out.
 */
/** Returns the synthetic profile used by skip-auth builds. */
function useSkipAuthUser(): { user: User | null } {
  const isSkipAuthSignedIn = useSkipAuthSignedInState();
  const skipAuthMode = useSkipAuthMode();

  if (skipAuthMode === "dev-bypass") {
    return { user: isSkipAuthSignedIn ? DEV_BYPASS_USER : null };
  }

  return { user: isSkipAuthSignedIn ? DEV_SKIP_USER : null };
}

/** Returns the current Clerk profile, including local dev-bypass state. */
function useClerkUserProfile(): { user: User | null } {
  const isSkipAuthSignedIn = useSkipAuthSignedInState();
  const skipAuthMode = useSkipAuthMode();
  const { user } = useClerkUser();

  if (isSkipAuthSignedIn) {
    if (skipAuthMode === "dev-bypass") {
      return { user: DEV_BYPASS_USER };
    }

    return { user: DEV_SKIP_USER };
  }

  if (!user) {
    return { user: null };
  }

  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses[0]?.emailAddress ||
    "";

  if (!email) {
    return { user: null };
  }

  return {
    user: {
      id: user.id,
      email,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
    },
  };
}

const useUserImplementation = env.skipAuth
  ? useSkipAuthUser
  : useClerkUserProfile;

export function useUser(): { user: User | null } {
  return useUserImplementation();
}

/**
 * Returns sign-in helpers used by the login screen.
 *
 * Returns:
 *   `signIn`, `setActive`, and `isLoaded` for the login flow.
 *
 * Throws:
 *   Error when Clerk is still loading and a real sign-in is attempted.
 */
interface SignInControls {
  signIn: {
    create: (params: {
      identifier: string;
      password: string;
    }) => Promise<{ status: string; createdSessionId: string | null }>;
  };
  setActive: (params: { session: string | null }) => Promise<void>;
  isLoaded: boolean;
}

/** Returns local sign-in controls when Clerk is intentionally absent. */
function useSkipSignIn(): SignInControls {
  return {
    signIn: {
      create: async () => {
        logger.info("Skip-auth sign in");
        return {
          status: "complete",
          createdSessionId: DEV_SKIP_SESSION_ID,
        };
      },
    },
    setActive: async ({ session }) => {
      setSkipAuthSignedInState(Boolean(session), "skip-auth");
    },
    isLoaded: true,
  };
}

/** Returns Clerk-backed sign-in controls. */
function useClerkSignInControls(): SignInControls {
  const { isLoaded, signIn, setActive } = useClerkSignIn();

  return {
    signIn: {
      create: async ({ identifier, password }) => {
        if (isDevBypassCredential(identifier.trim(), password)) {
          logger.info("Dev auth bypass sign in used");
          return {
            status: "complete",
            createdSessionId: DEV_BYPASS_SESSION_ID,
          };
        }

        if (!isLoaded || !signIn) {
          throw new Error("Authentication is still loading");
        }

        const result = await signIn.create({ identifier, password });
        return {
          status: result.status ?? "",
          createdSessionId: result.createdSessionId,
        };
      },
    },
    setActive: async ({ session }) => {
      if (!isLoaded || !setActive) {
        return;
      }

      if (session === DEV_BYPASS_SESSION_ID) {
        setSkipAuthSignedInState(true, "dev-bypass");
        return;
      }

      await setActive({ session: session ?? undefined });
    },
    isLoaded,
  };
}

const useSignInImplementation = env.skipAuth
  ? useSkipSignIn
  : useClerkSignInControls;

export function useSignIn(): SignInControls {
  return useSignInImplementation();
}

/**
 * Returns sign-up helpers used by the registration screen.
 *
 * Returns:
 *   `signUp`, `setActive`, and `isLoaded` for the sign-up flow.
 *
 * Throws:
 *   Error when Clerk is still loading and a real sign-up step is attempted.
 */
interface SignUpControls {
  signUp: {
    create: (params: { emailAddress: string; password: string }) => Promise<void>;
    prepareEmailAddressVerification: (params: { strategy: "email_code" }) => Promise<void>;
    attemptEmailAddressVerification: (params: {
      code: string;
    }) => Promise<{ status: string; createdSessionId: string | null }>;
  };
  setActive: (params: { session: string | null }) => Promise<void>;
  isLoaded: boolean;
}

/** Returns local sign-up controls when Clerk is intentionally absent. */
function useSkipSignUp(): SignUpControls {
  return {
    signUp: {
      create: async () => undefined,
      prepareEmailAddressVerification: async () => undefined,
      attemptEmailAddressVerification: async () => {
        logger.info("Skip-auth sign up verification");
        return {
          status: "complete",
          createdSessionId: DEV_SKIP_SESSION_ID,
        };
      },
    },
    setActive: async ({ session }) => {
      setSkipAuthSignedInState(Boolean(session), "skip-auth");
    },
    isLoaded: true,
  };
}

/** Returns Clerk-backed sign-up controls. */
function useClerkSignUpControls(): SignUpControls {
  const { isLoaded, signUp, setActive } = useClerkSignUp();

  return {
    signUp: {
      create: async ({ emailAddress, password }) => {
        if (!isLoaded || !signUp) {
          throw new Error("Authentication is still loading");
        }

        await signUp.create({ emailAddress, password });
      },
      prepareEmailAddressVerification: async ({ strategy }) => {
        if (!isLoaded || !signUp) {
          throw new Error("Authentication is still loading");
        }

        await signUp.prepareEmailAddressVerification({ strategy });
      },
      attemptEmailAddressVerification: async ({ code }) => {
        if (!isLoaded || !signUp) {
          throw new Error("Authentication is still loading");
        }

        const result = await signUp.attemptEmailAddressVerification({ code });
        return {
          status: result.status ?? "",
          createdSessionId: result.createdSessionId,
        };
      },
    },
    setActive: async ({ session }) => {
      if (!isLoaded || !setActive) {
        return;
      }

      await setActive({ session: session ?? undefined });
    },
    isLoaded,
  };
}

const useSignUpImplementation = env.skipAuth
  ? useSkipSignUp
  : useClerkSignUpControls;

export function useSignUp(): SignUpControls {
  return useSignUpImplementation();
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Configures Convex token forwarding and logger context for auth.
 *
 * Params:
 *   children: App tree rendered under auth side-effects.
 *
 * Returns:
 *   Children unchanged. Skip-auth builds avoid Clerk hooks entirely.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  if (env.skipAuth) {
    return <SkipAuthProvider>{children}</SkipAuthProvider>;
  }

  return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
}

/**
 * Auth side-effects for EXPO_PUBLIC_SKIP_AUTH development builds.
 *
 * Params:
 *   children: App tree to render.
 *
 * Returns:
 *   Children with skip-auth Convex/logger wiring applied.
 */
function SkipAuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const isSkipAuthSignedIn = useSkipAuthSignedInState();
  const skipAuthMode = useSkipAuthMode();

  useEffect(() => {
    logger.info("EXPO_PUBLIC_SKIP_AUTH enabled: Convex auth token forwarding is disabled.");
    setConvexTokenGetter(async () => null);

    return () => {
      setConvexTokenGetter(null);
    };
  }, []);

  useEffect(() => {
    if (isSkipAuthSignedIn) {
      logger.setContext({
        userId:
          skipAuthMode === "dev-bypass" ? DEV_BYPASS_USER.id : DEV_SKIP_USER.id,
      });
    } else {
      logger.clearContext();
    }
  }, [isSkipAuthSignedIn, skipAuthMode]);

  return <>{children}</>;
}

/**
 * Auth side-effects for Clerk-backed builds.
 *
 * Params:
 *   children: App tree to render.
 *
 * Returns:
 *   Children with Clerk token forwarding and migration wiring.
 */
function ClerkAuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const { isLoaded, isSignedIn, userId, getToken } = useClerkAuth();
  const migratedUserRef = useRef<string | null>(null);
  const isSkipAuthSignedIn = useSkipAuthSignedInState();
  const skipAuthMode = useSkipAuthMode();

  useEffect(() => {
    if (isSkipAuthSignedIn) {
      logger.info("EXPO_PUBLIC_SKIP_AUTH enabled: Convex auth token forwarding is disabled.");
      setConvexTokenGetter(async () => null);

      return () => {
        setConvexTokenGetter(null);
      };
    }

    setConvexTokenGetter(async () => {
      if (!isSignedIn) {
        return null;
      }

      try {
        const token = await getToken({ template: "convex" });
        return token ?? null;
      } catch (error) {
        logger.warn("Failed to fetch Clerk token for Convex", {
          userId: userId ?? undefined,
          extra: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        return null;
      }
    });

    return () => {
      setConvexTokenGetter(null);
    };
  }, [getToken, isSignedIn, userId, isSkipAuthSignedIn]);

  useEffect(() => {
    if (isSkipAuthSignedIn) {
      if (isSkipAuthSignedIn) {
        logger.setContext({
          userId:
            skipAuthMode === "dev-bypass" ? DEV_BYPASS_USER.id : DEV_SKIP_USER.id,
        });
      } else {
        logger.clearContext();
      }
      return;
    }

    if (userId) {
      logger.setContext({ userId });
      return;
    }

    logger.clearContext();
  }, [isSkipAuthSignedIn, userId, skipAuthMode]);

  useEffect(() => {
    if (isSkipAuthSignedIn) {
      return;
    }

    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    if (migratedUserRef.current === userId) {
      return;
    }

    migratedUserRef.current = userId;
    migrateLocalCoreDataIfNeeded(userId).catch((error) => {
      logger.error(
        "Local data migration failed",
        { userId },
        error instanceof Error ? error : new Error(String(error))
      );
    });
  }, [isLoaded, isSignedIn, userId, isSkipAuthSignedIn]);

  return <>{children}</>;
}

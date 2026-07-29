/**
 * Clerk-backed authentication adapter.
 * Preserves the app's existing auth hook API.
 */

import React, { useEffect, useRef, useSyncExternalStore } from "react";
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

let skipAuthSignedInState = env.skipAuth;
let skipAuthMode: LocalAuthMode = env.skipAuth ? "skip-auth" : "none";
const skipAuthListeners = new Set<() => void>();

function subscribeSkipAuth(listener: () => void): () => void {
  skipAuthListeners.add(listener);
  return () => {
    skipAuthListeners.delete(listener);
  };
}

function getSkipAuthSnapshot(): boolean {
  return skipAuthSignedInState;
}

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

function useSkipAuthSignedInState(): boolean {
  return useSyncExternalStore(subscribeSkipAuth, getSkipAuthSnapshot, getSkipAuthSnapshot);
}

function getSkipAuthModeSnapshot(): LocalAuthMode {
  return skipAuthMode;
}

function useSkipAuthMode(): LocalAuthMode {
  return useSyncExternalStore(
    subscribeSkipAuth,
    getSkipAuthModeSnapshot,
    getSkipAuthModeSnapshot
  );
}

function isDevBypassCredential(identifier: string, password: string): boolean {
  return (
    env.isDevelopment &&
    // Keep this login shortcut explicit and intentionally scoped to dev only.
    identifier === DEV_BYPASS_EMAIL &&
    password === DEV_BYPASS_PASSWORD
  );
}

export function useAuth(): Pick<AuthContextValue, "isLoaded" | "isSignedIn" | "signOut"> {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { signOut } = useClerk();
  const isSkipAuthSignedIn = useSkipAuthSignedInState();

  if (env.skipAuth || isSkipAuthSignedIn) {
    return {
      isLoaded: true,
      isSignedIn: isSkipAuthSignedIn,
      signOut: async () => {
        logger.info("Skip-auth sign out");
        setSkipAuthSignedInState(false);
      },
    };
  }

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    signOut,
  };
}

export function useUser(): { user: User | null } {
  const { user } = useClerkUser();
  const isSkipAuthSignedIn = useSkipAuthSignedInState();
  const skipAuthMode = useSkipAuthMode();

  if (env.skipAuth || isSkipAuthSignedIn) {
    if (skipAuthMode === "dev-bypass") {
      return { user: isSkipAuthSignedIn ? DEV_BYPASS_USER : null };
    }

    return { user: isSkipAuthSignedIn ? DEV_SKIP_USER : null };
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

export function useSignIn(): {
  signIn: {
    create: (params: {
      identifier: string;
      password: string;
    }) => Promise<{ status: string; createdSessionId: string | null }>;
  };
  setActive: (params: { session: string | null }) => Promise<void>;
  isLoaded: boolean;
} {
  const { isLoaded, signIn, setActive } = useClerkSignIn();

  if (env.skipAuth) {
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

export function useSignUp(): {
  signUp: {
    create: (params: { emailAddress: string; password: string }) => Promise<void>;
    prepareEmailAddressVerification: (params: { strategy: "email_code" }) => Promise<void>;
    attemptEmailAddressVerification: (params: {
      code: string;
    }) => Promise<{ status: string; createdSessionId: string | null }>;
  };
  setActive: (params: { session: string | null }) => Promise<void>;
  isLoaded: boolean;
} {
  const { isLoaded, signUp, setActive } = useClerkSignUp();

  if (env.skipAuth) {
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

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const { isLoaded, isSignedIn, userId, getToken } = useClerkAuth();
  const migratedUserRef = useRef<string | null>(null);
  const isSkipAuthSignedIn = useSkipAuthSignedInState();
  const skipAuthMode = useSkipAuthMode();

  useEffect(() => {
    if (env.skipAuth || isSkipAuthSignedIn) {
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
    if (env.skipAuth || isSkipAuthSignedIn) {
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
    if (env.skipAuth || isSkipAuthSignedIn) {
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
  }, [isLoaded, isSignedIn, userId]);

  return <>{children}</>;
}

/**
 * Mock authentication context.
 * Replace with Clerk integration for production.
 * 
 * To add Clerk later:
 * 1. npm install @clerk/clerk-expo expo-auth-session expo-web-browser
 * 2. Replace this mock with ClerkProvider
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@/services/logging";

const AUTH_STORAGE_KEY = "@nof1/auth";

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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook to access authentication state and methods.
 */
export function useAuth(): Pick<AuthContextValue, "isLoaded" | "isSignedIn"> {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return { isLoaded: context.isLoaded, isSignedIn: context.isSignedIn };
}

/**
 * Hook to access current user.
 */
export function useUser(): { user: User | null } {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within AuthProvider");
  }
  return { user: context.user };
}

/**
 * Hook to access sign in method.
 */
export function useSignIn(): {
  signIn: { create: (params: { identifier: string; password: string }) => Promise<{ status: string; createdSessionId: string | null }> };
  setActive: (params: { session: string | null }) => Promise<void>;
  isLoaded: boolean;
} {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSignIn must be used within AuthProvider");
  }

  return {
    signIn: {
      create: async ({ identifier, password }) => {
        const result = await context.signIn(identifier, password);
        if (result.success) {
          return { status: "complete", createdSessionId: "mock-session" };
        }
        throw new Error(result.error || "Sign in failed");
      },
    },
    setActive: async () => {},
    isLoaded: context.isLoaded,
  };
}

/**
 * Hook to access sign up method.
 */
export function useSignUp(): {
  signUp: {
    create: (params: { emailAddress: string; password: string }) => Promise<void>;
    prepareEmailAddressVerification: (params: { strategy: string }) => Promise<void>;
    attemptEmailAddressVerification: (params: { code: string }) => Promise<{ status: string; createdSessionId: string | null }>;
  };
  setActive: (params: { session: string | null }) => Promise<void>;
  isLoaded: boolean;
} {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSignUp must be used within AuthProvider");
  }

  return {
    signUp: {
      create: async ({ emailAddress, password }) => {
        // Store pending signup
        await AsyncStorage.setItem("@nof1/pending_signup", JSON.stringify({ email: emailAddress, password }));
      },
      prepareEmailAddressVerification: async () => {
        // Mock - in production this would send an email
      },
      attemptEmailAddressVerification: async ({ code }) => {
        // For mock: accept any 6-digit code
        if (code.length === 6) {
          const pending = await AsyncStorage.getItem("@nof1/pending_signup");
          if (pending) {
            const { email, password } = JSON.parse(pending);
            const result = await context.signUp(email, password);
            if (result.success) {
              await AsyncStorage.removeItem("@nof1/pending_signup");
              return { status: "complete", createdSessionId: "mock-session" };
            }
          }
        }
        throw new Error("Invalid verification code");
      },
    },
    setActive: async () => {},
    isLoaded: context.isLoaded,
  };
}

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component.
 * Wraps app with auth context.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Load persisted auth state
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const userData = JSON.parse(stored);
          setUser(userData);
          logger.info("Auth state restored", { userId: userData.id });
        }
      } catch (error) {
        logger.error("Failed to load auth state", {}, error instanceof Error ? error : undefined);
      } finally {
        setIsLoaded(true);
      }
    };
    loadAuth();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // Mock authentication - accept any valid email/password
    if (!email.includes("@") || password.length < 6) {
      return { success: false, error: "Invalid email or password" };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName: email.split("@")[0],
    };

    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      logger.info("User signed in", { userId: newUser.id });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to sign in" };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    // Same as sign in for mock
    return signIn(email, password);
  }, [signIn]);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      logger.info("User signed out");
    } catch (error) {
      logger.error("Failed to sign out", {}, error instanceof Error ? error : undefined);
    }
  }, []);

  const value: AuthContextValue = {
    isLoaded,
    isSignedIn: !!user,
    user,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

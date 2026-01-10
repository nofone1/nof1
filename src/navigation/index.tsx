/**
 * Root navigation container.
 */

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import type { RootStackParamList } from "@/types/navigation";
import { AuthNavigator } from "./auth-navigator";
import { MainNavigator } from "./main-navigator";
import { logger } from "@/services/logging";
import { useAuth } from "@/services/auth";
import { colors } from "@/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen(): React.JSX.Element {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
    </View>
  );
}

export function RootNavigator(): React.JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();

  const onStateChange = React.useCallback(() => {
    logger.debug("Navigation state changed");
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer onStateChange={onStateChange}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.primary,
  },
});

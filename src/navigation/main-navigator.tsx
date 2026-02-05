/**
 * Main app navigator with bottom tabs.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, StyleSheet } from "react-native";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";
import { HomeScreen } from "@/screens/home";
import { CreateExperimentScreen } from "@/screens/experiment/create";
import { ExperimentDetailScreen } from "@/screens/experiment/detail";
import { PeptideBrowseScreen, PeptideDetailScreen } from "@/screens/peptide";
import { ProfileScreen } from "@/screens/profile";
import { colors } from "@/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

interface TabIconProps {
  name: string;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps): React.JSX.Element {
  const iconMap: Record<string, string> = {
    Home: "🏠",
    CreateExperiment: "➕",
    PeptideBrowse: "💊",
    Profile: "👤",
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabIconText, focused && styles.tabIconFocused]}>
        {iconMap[name] || "●"}
      </Text>
    </View>
  );
}

function TabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Experiments" }}
      />
      <Tab.Screen
        name="PeptideBrowse"
        component={PeptideBrowseScreen}
        options={{ tabBarLabel: "Peptides" }}
      />
      <Tab.Screen
        name="CreateExperiment"
        component={CreateExperimentScreen}
        options={{ tabBarLabel: "New" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ExperimentDetail" component={ExperimentDetailScreen} />
      <Stack.Screen name="PeptideDetail" component={PeptideDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface.default,
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconText: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

/**
 * Main app navigator with bottom tabs.
 * Features Feather icons, light tab bar, and teal active state.
 */

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { MainStackParamList, MainTabParamList } from "@/types/navigation";
import { DailyLogScreen } from "@/screens/daily";
import { QuickLogScreen } from "@/screens/log";
import { ProtocolsScreen } from "@/screens/protocol";
import { ExperimentsScreen } from "@/screens/experiments";
import { CreateExperimentScreen } from "@/screens/experiment/create";
import { ExperimentDetailScreen } from "@/screens/experiment/detail";
import { PeptideBrowseScreen, PeptideDetailScreen } from "@/screens/peptide";
import { CreateProtocolScreen } from "@/screens/protocol/create";
import { ProfileScreen } from "@/screens/profile";
import { HealthConnectionsScreen } from "@/screens/profile/health-connections";
import { colors, spacing } from "@/theme";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface TabIconProps {
  name: FeatherIconName;
  focused: boolean;
}

/**
 * Tab icon component using Feather icons.
 *
 * @param name - Feather icon name
 * @param focused - Whether the tab is currently active
 * @returns The tab icon JSX element
 */
function TabIcon({ name, focused }: TabIconProps): React.JSX.Element {
  return (
    <View style={styles.tabIcon}>
      <Feather
        name={name}
        size={22}
        color={focused ? colors.primary[500] : colors.text.tertiary}
      />
    </View>
  );
}

/**
 * Bottom tab navigator component.
 *
 * @returns The tab navigator JSX element
 */
function TabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Daily"
        component={DailyLogScreen}
        options={{
          tabBarLabel: "Today",
          tabBarIcon: ({ focused }) => <TabIcon name="sun" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Peptides"
        component={PeptideBrowseScreen}
        options={{
          tabBarLabel: "Peptides",
          tabBarIcon: ({ focused }) => <TabIcon name="book-open" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Log"
        component={QuickLogScreen}
        options={{
          tabBarLabel: "Log",
          tabBarIcon: ({ focused }) => <TabIcon name="plus-circle" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Protocols"
        component={ProtocolsScreen}
        options={{
          tabBarLabel: "Protocols",
          tabBarIcon: ({ focused }) => <TabIcon name="clipboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main stack navigator component.
 *
 * @returns The main navigator JSX element
 */
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
      <Stack.Screen name="CreateExperiment" component={CreateExperimentScreen} />
      <Stack.Screen name="ExperimentDetail" component={ExperimentDetailScreen} />
      <Stack.Screen name="PeptideDetail" component={PeptideDetailScreen} />
      <Stack.Screen name="Experiments" component={ExperimentsScreen} />
      <Stack.Screen name="CreateProtocol" component={CreateProtocolScreen} />
      <Stack.Screen name="HealthConnections" component={HealthConnectionsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    height: 85,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 0,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
});

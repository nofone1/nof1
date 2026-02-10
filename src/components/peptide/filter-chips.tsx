import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { colors, spacing, typography } from "@/theme";

interface FilterChipItem {
  label: string;
  value: string;
}

interface FilterChipsProps {
  label?: string;
  items: FilterChipItem[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export function FilterChips({
  label,
  items,
  selected,
  onSelect,
}: FilterChipsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => {
          const isSelected = selected === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => onSelect(isSelected ? null : item.value)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionSmall,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  chipSelected: {
    backgroundColor: "rgba(91, 138, 114, 0.2)",
    borderColor: colors.primary[500],
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  chipTextSelected: {
    color: colors.primary[400],
  },
});

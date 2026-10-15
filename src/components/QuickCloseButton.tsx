import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, typography, radius, spacing } from "../theme";
import { EyeOffIcon } from "./Icons";

interface Props {
  onPress: () => void;
  label?: string;
}

/**
 * Tombol Tutup Cepat (Panic/Stealth Trigger).
 * Menyamarkan atau mengalihkan tampilan seketika ke layar netral demi privasi.
 */
export const QuickCloseButton: React.FC<Props> = ({
  onPress,
  label = "Tutup Cepat",
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Tutup Cepat untuk Privasi"
      activeOpacity={0.7}
      style={styles.btn}
      onPress={onPress}
    >
      <EyeOffIcon size={14} color={colors.onSurfaceVariant} />
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
});

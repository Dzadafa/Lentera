import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';

interface Props {
  condensed?: boolean;
}

export const ScreeningDisclaimer: React.FC<Props> = ({ condensed = false }) => {
  return (
    <View style={[styles.container, condensed && styles.containerCondensed]}>
      <Text style={styles.title}>Skrining Awal • Bukan Diagnosis</Text>
      {!condensed && (
        <Text style={styles.body}>
          Hasil ini mencerminkan keluhan yang kamu rasakan dalam 7 hari terakhir. Untuk evaluasi klinis menyeluruh, konsultasikan ke dokter atau psikolog di puskesmas/klinik BPJS terdekat.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryContainer,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
    marginVertical: spacing.sm,
  },
  containerCondensed: {
    paddingVertical: spacing.xs + 2,
  },
  title: {
    ...typography.labelSm,
    color: colors.onPrimaryContainer,
  },
  body: {
    ...typography.bodySm,
    color: colors.onPrimaryContainer,
    marginTop: 2,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, DocumentIcon, PhoneAlertIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { ScreeningDisclaimer } from '../components/ScreeningDisclaimer';
import { REFERRAL_STEPS, EMERGENCY_CONTACT } from '../content/referral';

interface Props {
  onBack: () => void;
  onQuickClose: () => void;
}

export const ReferralGuideScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
          <ChevronLeftIcon size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Panduan Faskes BPJS</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>Tiga langkah, tanpa rasa malu.</Text>
        <Text style={styles.sub}>
          Layanan kesehatan jiwa di puskesmas dan rumah sakit ditanggung BPJS. Kamu hanya perlu mengikuti alur ini.
        </Text>

        <ScreeningDisclaimer condensed />

        {REFERRAL_STEPS.map((step) => (
          <View key={step.id} style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.id}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepBody}>{step.body}</Text>

            {step.script && (
              <View style={styles.scriptBox}>
                <Text style={styles.scriptLabel}>UCAPKAN INI DI LOKET</Text>
                <Text style={styles.scriptText}>{step.script}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => handleCopy(step.script!)}
                  activeOpacity={0.85}
                >
                  <DocumentIcon size={14} color={colors.primary} />
                  <Text style={styles.copyBtnText}>Salin Kalimat</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.emergencyRow}
          onPress={() => Linking.openURL(EMERGENCY_CONTACT.tel)}
          activeOpacity={0.85}
        >
          <PhoneAlertIcon size={18} color={colors.crisis} />
          <Text style={styles.emergencyText}>
            Darurat sekarang? Hubungi {EMERGENCY_CONTACT.display}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  topTitle: { ...typography.headlineMd, color: colors.primary },
  content: { paddingHorizontal: spacing.marginMobile, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  headline: { ...typography.displayLg, color: colors.onBackground },
  sub: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginTop: spacing.xs, marginBottom: spacing.sm },
  stepCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginTop: spacing.gapCard,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: { ...typography.labelLg, color: colors.onPrimary },
  stepTitle: { ...typography.headlineMd, color: colors.primary, flex: 1 },
  stepBody: { ...typography.bodyMd, color: colors.onSurface, lineHeight: 22 },
  scriptBox: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginTop: spacing.sm,
  },
  scriptLabel: { ...typography.labelSm, color: colors.onPrimaryContainer, marginBottom: 4 },
  scriptText: { ...typography.bodyMd, color: colors.onPrimaryContainer, fontStyle: 'italic' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  copyBtnText: { ...typography.labelSm, color: colors.primary },
  emergencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.crisisContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginTop: spacing.lg,
  },
  emergencyText: { ...typography.labelMd, color: colors.onCrisisContainer, flex: 1 },
});

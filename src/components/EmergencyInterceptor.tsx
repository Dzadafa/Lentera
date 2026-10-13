import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { PhoneAlertIcon, CloseIcon } from './Icons';
import { CRISIS_COPY } from '../content/crisis';
import { EMERGENCY_CONTACT } from '../content/referral';
import { useAppStore } from '../store/appStore';

export const EmergencyInterceptor: React.FC = () => {
  const visible = useAppStore((s) => s.isCrisisModalVisible);
  const close = useAppStore((s) => s.closeCrisisModal);
  const recordDial = useAppStore((s) => s.recordCrisisDial);

  const handleCall = async () => {
    await recordDial();
    try {
      await Linking.openURL(EMERGENCY_CONTACT.tel);
    } catch {
      // fallback
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.iconCircle}>
              <PhoneAlertIcon size={22} color={colors.crisis} />
            </View>
            <TouchableOpacity
              onPress={close}
              style={styles.closeBtn}
              accessibilityLabel="Tutup dialog krisis"
            >
              <CloseIcon size={18} color={colors.onCrisisContainer} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{CRISIS_COPY.interceptorTitle}</Text>
          <Text style={styles.body}>{CRISIS_COPY.interceptorBody}</Text>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCall}
            activeOpacity={0.85}
          >
            <PhoneAlertIcon size={20} color="#FFFFFF" />
            <Text style={styles.callLabel}>{CRISIS_COPY.callLabel}</Text>
          </TouchableOpacity>

          <Text style={styles.helperNote}>{CRISIS_COPY.crisisNote}</Text>

          <TouchableOpacity style={styles.secondaryCloseBtn} onPress={close}>
            <Text style={styles.secondaryCloseLabel}>{CRISIS_COPY.closeLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(19, 31, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.marginMobile,
  },
  card: {
    backgroundColor: colors.crisisContainer,
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1.5,
    borderColor: colors.crisis,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onCrisisContainer,
    marginBottom: spacing.xs,
  },
  body: {
    ...typography.bodyMd,
    color: colors.onCrisisContainer,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  callBtn: {
    backgroundColor: colors.crisis,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  callLabel: {
    ...typography.labelLg,
    color: '#FFFFFF',
  },
  helperNote: {
    ...typography.bodySm,
    color: colors.onCrisisContainer,
    fontSize: 11,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  secondaryCloseBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryCloseLabel: {
    ...typography.bodySm,
    color: colors.onCrisisContainer,
    textDecorationLine: 'underline',
  },
});

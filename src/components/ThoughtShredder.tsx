import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { haptics } from '../services/haptics';

export const ThoughtShredder: React.FC = () => {
  const [text, setText] = useState('');
  const [shredded, setShredded] = useState(false);

  const handleShred = () => {
    if (!text.trim()) return;
    haptics.alert();
    setShredded(true);
    setTimeout(() => {
      setText('');
      setShredded(false);
      haptics.success();
    }, 1200);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Tulis & Lepaskan</Text>
      <Text style={styles.sub}>
        Tulis pikiran yang membebani kamu sekarang. Setelah ditekan, tulisan ini hancur dan hilang permanen tanpa pernah disimpan.
      </Text>

      <TextInput
        style={[styles.input, shredded && styles.inputShredded]}
        multiline
        placeholder="Ketik unek-unek atau beban pikiranmu di sini..."
        placeholderTextColor={colors.onSurfaceVariant}
        value={shredded ? '••• melepaskan beban pikiran •••' : text}
        onChangeText={setText}
        editable={!shredded}
      />

      <TouchableOpacity
        style={[styles.shredBtn, !text.trim() && styles.shredBtnDisabled]}
        disabled={!text.trim() || shredded}
        onPress={handleShred}
      >
        <Text style={styles.shredLabel}>
          {shredded ? 'Sedang Dihancurkan...' : 'Hancurkan & Lepaskan'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  title: {
    ...typography.labelLg,
    color: colors.primary,
    marginBottom: 4,
  },
  sub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    minHeight: 90,
    textAlignVertical: 'top',
    ...typography.bodyMd,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  inputShredded: {
    opacity: 0.3,
    backgroundColor: colors.errorContainer,
  },
  shredBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shredBtnDisabled: {
    opacity: 0.4,
  },
  shredLabel: {
    ...typography.labelMd,
    color: '#FFFFFF',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import { ChevronLeftIcon, SparkleIcon, TrashIcon, ShieldLockIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { CURATED_STORIES } from '../content/storyWall';
import { addStoryLetter, deleteStoryLetter, getStoryLetters, type StoryLetter } from '../db';
import { haptics } from '../services/haptics';

interface Props {
  onBack?: () => void;
  onQuickClose: () => void;
}

type Filter = 'all' | 'high' | 'moderate';

/**
 * Dinding Cerita (I4).
 * Cerita kurasi dibundel luring. Pengguna juga bisa menulis surat untuk dirinya
 * sendiri yang hanya tersimpan di SQLite lokal perangkat ini.
 */
export const StoryWallScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [letters, setLetters] = useState<StoryLetter[]>([]);
  const [draft, setDraft] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);

  const refresh = async () => setLetters(await getStoryLetters(10));

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = CURATED_STORIES.filter((s) => (filter === 'all' ? true : s.fromTier === filter));

  const saveLetter = async () => {
    if (!draft.trim()) return;
    await addStoryLetter(draft.trim());
    setDraft('');
    setComposerOpen(false);
    void haptics.success();
    await refresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
            <ChevronLeftIcon size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.topTitle}>Dinding Cerita</Text>
        <QuickCloseButton onPress={onQuickClose} label="" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Pengalaman orang lain yang pernah berada di titik berat: bagaimana mulanya, langkah kecil
          apa yang diambil, dan apa yang mulai membaik.
        </Text>

        <View style={styles.filterRow}>
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'moderate', label: 'Dari sedang' },
              { id: 'high', label: 'Dari tinggi' },
            ] as { id: Filter; label: string }[]
          ).map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterBtn, filter === f.id && styles.filterBtnActive]}
              onPress={() => {
                void haptics.tap();
                setFilter(f.id);
              }}
            >
              <Text style={[styles.filterLabel, filter === f.id && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.map((s) => (
          <View key={s.id} style={styles.storyCard}>
            <View style={styles.storyTop}>
              <View
                style={[
                  styles.tierTag,
                  {
                    backgroundColor:
                      s.fromTier === 'high'
                        ? colors.tierHighContainer
                        : colors.tierModerateContainer,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tierTagText,
                    {
                      color:
                        s.fromTier === 'high'
                          ? colors.onTierHighContainer
                          : colors.onTierModerateContainer,
                    },
                  ]}
                >
                  {s.fromTier === 'high' ? 'Dulu kondisi tinggi' : 'Dulu kondisi sedang'}
                </Text>
              </View>
              <Text style={styles.authorTag}>{s.authorLabel}</Text>
            </View>

            <Text style={styles.quote}>{s.quote}</Text>
            <Text style={styles.storyText}>{s.story}</Text>

            <View style={styles.nowBox}>
              <Text style={styles.nowLabel}>SEKARANG</Text>
              <Text style={styles.nowText}>{s.nowStatus}</Text>
            </View>

            <View style={styles.actionRow}>
              <SparkleIcon size={14} color={colors.tertiary} />
              <Text style={styles.actionText}>Langkah nyata: {s.actionTaken}</Text>
            </View>
          </View>
        ))}

        <View style={styles.letterSection}>
          <Text style={styles.sectionHeading}>Surat untuk Dirimu Nanti</Text>
          <Text style={styles.sectionSub}>
            Tidak ada kolom komentar dan tidak ada unggahan. Tulisanmu hanya tersimpan di perangkat
            ini, dan bisa kamu hapus kapan saja.
          </Text>

          {composerOpen ? (
            <View>
              <TextInput
                style={styles.letterInput}
                placeholder="Tulis apa yang ingin kamu ingat saat membuka ini lagi..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={draft}
                onChangeText={setDraft}
                multiline
              />
              <View style={styles.composerRow}>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => {
                    setDraft('');
                    setComposerOpen(false);
                  }}
                >
                  <Text style={styles.ghostBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={saveLetter}>
                  <Text style={styles.primaryBtnText}>Simpan di perangkat</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setComposerOpen(true)}>
              <Text style={styles.primaryBtnText}>Tulis surat</Text>
            </TouchableOpacity>
          )}

          {letters.map((l) => (
            <View key={l.id} style={styles.letterCard}>
              <Text style={styles.letterDate}>
                {new Date(l.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.letterBody}>{l.body}</Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={async () => {
                  await deleteStoryLetter(l.id);
                  await refresh();
                }}
                accessibilityLabel="Hapus surat ini"
              >
                <TrashIcon size={14} color={colors.onSurfaceVariant} />
                <Text style={styles.deleteText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.privacyNote}>
            <ShieldLockIcon size={16} color={colors.primary} />
            <Text style={styles.privacyBody}>
              Cerita kurasi di atas dibundel di dalam aplikasi. Aplikasi ini tidak mengunggah apa pun
              dan tidak menampilkan tulisanmu ke pengguna lain.
            </Text>
          </View>
        </View>
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  topTitle: { ...typography.headlineMd, color: colors.primary, fontSize: 18 },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xs,
    paddingBottom: 96,
  },
  intro: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  filterBtnActive: { backgroundColor: colors.primary },
  filterLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  filterLabelActive: { color: colors.onPrimary },
  storyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  storyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tierTag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  tierTagText: { ...typography.labelSm },
  authorTag: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
    textAlign: 'right',
  },
  quote: { ...typography.labelLg, color: colors.primary, marginBottom: spacing.sm },
  storyText: { ...typography.bodyMd, color: colors.onSurface, marginBottom: spacing.sm },
  nowBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  nowLabel: { ...typography.labelSm, color: colors.onSurfaceVariant },
  nowText: { ...typography.bodySm, color: colors.onSurface, marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryContainer,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  actionText: { ...typography.bodySm, color: colors.onPrimaryContainer, flex: 1 },
  letterSection: { marginTop: spacing.lg },
  sectionHeading: { ...typography.headlineMd, color: colors.primary },
  sectionSub: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  letterInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    minHeight: 110,
    textAlignVertical: 'top',
    ...typography.bodyMd,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  composerRow: { flexDirection: 'row', gap: spacing.sm },
  ghostBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostBtnText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { ...typography.labelMd, color: colors.onPrimary },
  letterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginTop: spacing.sm,
  },
  letterDate: { ...typography.labelSm, color: colors.onSurfaceVariant, marginBottom: 4 },
  letterBody: { ...typography.bodyMd, color: colors.onSurface },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  deleteText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textDecorationLine: 'underline',
  },
  privacyNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  privacyBody: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1 },
});

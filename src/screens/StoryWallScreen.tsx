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

interface StoryItem {
  id: string;
  authorLabel: string;
  story: string;
  actionTaken: string;
  nowStatus: string;
  quote: string;
  fromTier: 'moderate' | 'high';
  tags: string[];
  created?: string | number;
}

/**
 * Format waktu relatif: 'just now', '5 minutes ago', '2 hours ago', '1 day ago', dll.
 */
function formatTimeAgo(timestamp?: string | number): string {
  if (!timestamp) return '1 day ago';
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return 'just now';
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Dinding Cerita (I4).
 * Menampilkan cerita kurasi publik secara anonim dengan waktu relatif (misal: 1 minute ago, 1 day ago).
 * Pengguna dapat membagikan cerita inspirasi anonim ke backend PocketBase atau menyimpan surat refleksi lokal di perangkat.
 */
export const StoryWallScreen: React.FC<Props> = ({ onBack, onQuickClose }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [letters, setLetters] = useState<StoryLetter[]>([]);
  const [draft, setDraft] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [shareToPublic, setShareToPublic] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [serverStories, setServerStories] = useState<StoryItem[]>(() => {
    // Curated stories lokal diberi default waktu yang bervariasi
    const now = Date.now();
    return CURATED_STORIES.map((s, idx) => ({
      ...s,
      created: now - (idx + 1) * 3600 * 1000 * (idx === 0 ? 2 : idx === 1 ? 24 : 72),
    }));
  });

  const refresh = async () => setLetters(await getStoryLetters(10));

  const loadServerStories = async () => {
    try {
      const { fetchServerStories } = await import('../services/pocketbase');
      const items = await fetchServerStories();
      if (items && items.length > 0) {
        const mapped: StoryItem[] = items.map((it) => ({
          id: it.id,
          authorLabel: it.author_label,
          story: it.story,
          actionTaken: it.action_taken,
          nowStatus: it.now_status,
          quote: it.quote,
          fromTier: it.from_tier,
          tags: it.tags || [],
          created: it.created,
        }));
        setServerStories(mapped);
      }
    } catch {
      // Tetap gunakan data lokal jika offline
    }
  };

  useEffect(() => {
    void refresh();
    void loadServerStories();
  }, []);


  const filtered = serverStories.filter((s) => (filter === 'all' ? true : s.fromTier === filter));

  const saveLetter = async () => {
    if (!draft.trim()) return;

    if (shareToPublic) {
      setIsSharing(true);
      try {
        const { shareStoryToServer } = await import('../services/pocketbase');
        const res = await shareStoryToServer({
          story: draft.trim(),
          quote: draft.trim().length > 60 ? draft.trim().substring(0, 60) + '...' : draft.trim(),
          action_taken: 'Menulis refleksi dan berbagi penguatan',
          now_status: 'Lebih tenang setelah menuangkan perasaan',
          from_tier: 'moderate',
        });
        if (res) {
          await loadServerStories();
        }
      } catch {
        // Fallback simpan lokal
      } finally {
        setIsSharing(false);
      }
    }

    // Selalu simpan di arsip surat pribadi perangkat
    await addStoryLetter(draft.trim());
    setDraft('');
    setShareToPublic(false);
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
              {/* Menampilkan waktu relatif dinamis menggantikan teks mahasiswa/pekerja */}
              <Text style={styles.authorTag}>{formatTimeAgo(s.created)}</Text>
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
          <Text style={styles.sectionHeading}>Tulis & Bagikan Cerita</Text>
          <Text style={styles.sectionSub}>
            Ceritakan pengalamanmu untuk menguatkan dirimu dan teman-teman lain. Tulisanmu aman,
            anonim, dan tanpa identitas nama.
          </Text>

          {composerOpen ? (
            <View>
              <TextInput
                style={styles.letterInput}
                placeholder="Tulis apa yang sedang kamu rasakan atau langkah kecil yang membantumu..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={draft}
                onChangeText={setDraft}
                multiline
              />

              {/* Opsi Berbagi ke Dinding Publik (Backend) */}
              <TouchableOpacity
                style={styles.shareOptionRow}
                onPress={() => setShareToPublic(!shareToPublic)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    shareToPublic && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  {shareToPublic && <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓</Text>}
                </View>
                <Text style={styles.shareOptionText}>
                  Bagikan secara anonim ke Dinding Cerita Publik
                </Text>
              </TouchableOpacity>

              <View style={styles.composerRow}>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => {
                    setDraft('');
                    setComposerOpen(false);
                  }}
                  disabled={isSharing}
                >
                  <Text style={styles.ghostBtnText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, isSharing && { opacity: 0.6 }]}
                  onPress={saveLetter}
                  disabled={isSharing}
                >
                  <Text style={styles.primaryBtnText}>
                    {isSharing ? 'Mengirim...' : shareToPublic ? 'Bagikan Anonim' : 'Simpan Pribadi'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setComposerOpen(true)}>
              <Text style={styles.primaryBtnText}>Tulis Cerita Baru</Text>
            </TouchableOpacity>
          )}

          {letters.length > 0 && (
            <Text style={[styles.sectionHeading, { marginTop: spacing.lg, fontSize: 15 }]}>
              Catatan Pribadi di Perangkat Ini
            </Text>
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
              Dinding Cerita mengutamakan privasi dan harapan. Seluruh cerita dibagikan tanpa identitas diri,
              tanpa jejak akun, dan dapat dibaca oleh sesama rekan sebaya untuk saling menguatkan.
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
  shareOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  shareOptionText: {
    ...typography.bodySm,
    color: colors.onSurface,
    fontWeight: '600',
    flex: 1,
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

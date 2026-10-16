import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { colors, typography, radius, spacing } from '../theme';
import {
  ChevronLeftIcon,
  SparkleIcon,
  TrashIcon,
  ShieldLockIcon,
  HeartIcon,
  CheckIcon,
  ShareIcon,
} from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { StoryCardModal, type StoryCardData } from '../components/StoryCardModal';
import { CURATED_STORIES, type CuratedStory } from '../content/storyWall';
import {
  addStoryLetter,
  deleteStoryLetter,
  getStoryLetters,
  type StoryLetter,
  insertStorySubmission,
  getUserStorySubmissions,
  type UserStorySubmission,
  toggleStoryHelpful,
  getStoryHelpfulStatus,
  hideReportedStory,
  getHiddenStoryIds,
  getSetting,
} from '../db';
import { useAppStore } from '../store/appStore';
import { haptics } from '../services/haptics';

interface Props {
  onBack?: () => void;
  onQuickClose: () => void;
}

type Filter = 'all' | 'high' | 'moderate' | 'college' | 'worker';

const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Semua Cerita' },
  { id: 'high', label: 'Dari Kondisi Tinggi' },
  { id: 'moderate', label: 'Dari Kondisi Sedang' },
  { id: 'college', label: 'Kuliah & Skripsi' },
  { id: 'worker', label: 'Pekerja Muda' },
];

const CATEGORY_CHOICES = [
  'Kuliah & Akademik',
  'Pekerja & Karier',
  'Kecemasan & Overthinking',
  'Keluarga & Relasi',
  'Faskes & Bantuan Klinis',
];

/**
 * Format timestamp ke teks waktu relatif dalam Bahasa Indonesia.
 * Contoh: 'Baru saja', '1 menit yang lalu', '3 jam yang lalu', '1 hari yang lalu', '1 minggu yang lalu'.
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSec < 60) {
    return 'Baru saja';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} menit yang lalu`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} hari yang lalu`;
  }
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return `${diffWeeks} minggu yang lalu`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} bulan yang lalu`;
  }
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} tahun yang lalu`;
};

/**
 * Offset waktu dinamis untuk cerita kurasi agar terasa hidup & alami layaknya linimasa komunitas aktif.
 */
const CURATED_TIME_OFFSETS: Record<string, number> = {
  'story-1': 15 * 60 * 1000,          // 15 menit yang lalu
  'story-2': 3 * 3600 * 1000,         // 3 jam yang lalu
  'story-3': 1 * 24 * 3600 * 1000,    // 1 hari yang lalu
  'story-4': 3 * 24 * 3600 * 1000,    // 3 hari yang lalu
  'story-5': 7 * 24 * 3600 * 1000,    // 1 minggu yang lalu
};

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

  // Submisi cerita oleh pengguna
  const [userSubmissions, setUserSubmissions] = useState<UserStorySubmission[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Modal Kartu Penguat (Medium-style share card)
  const [selectedShareStory, setSelectedShareStory] = useState<StoryCardData | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Form 5 bagian
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState(CATEGORY_CHOICES[0]);
  const [feltText, setFeltText] = useState('');
  const [turningPointText, setTurningPointText] = useState('');
  const [actionText, setActionText] = useState('');
  const [resultText, setResultText] = useState('');
  const [messageText, setMessageText] = useState('');

  // Reaksi helpful per cerita
  const [reactions, setReactions] = useState<Record<string, { count: number; isHelped: boolean }>>({});
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);

  const latestScreening = useAppStore((s) => s.latestScreening);
  const logWin = useAppStore((s) => s.logWin);

  const refreshData = async () => {
    const ltrs = await getStoryLetters(10);
    setLetters(ltrs);
    const subs = await getUserStorySubmissions();
    setUserSubmissions(subs);
    const hidden = await getHiddenStoryIds();
    setHiddenIds(hidden);

    // Muat reaksi helpful untuk cerita bawaan
    const initialMap: Record<string, { count: number; isHelped: boolean }> = {};
    for (const story of CURATED_STORIES) {
      const status = await getStoryHelpfulStatus(story.id, story.id === 'story-1' ? 42 : story.id === 'story-3' ? 38 : 24);
      initialMap[story.id] = status;
    }
    setReactions(initialMap);
  };

  useEffect(() => {
    void refreshData();
    void (async () => {
      const savedNick = await getSetting('user_nickname');
      if (savedNick) setAuthorName(savedNick);
    })();
  }, []);

  const handleToggleHelpful = async (storyId: string) => {
    void haptics.tap();
    const result = await toggleStoryHelpful(storyId);
    setReactions((prev) => ({
      ...prev,
      [storyId]: result,
    }));
  };

  const handleReportStory = (storyId: string) => {
    void haptics.alert();
    Alert.alert(
      'Laporkan Cerita Ini?',
      'Jika cerita ini memicu ketidaknyamanan atau dirasa kurang pantas, kami akan menyembunyikannya dari perangkatmu dan meneruskannya ke antrean peninjauan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Sembunyikan & Laporkan',
          style: 'destructive',
          onPress: async () => {
            await hideReportedStory(storyId);
            setHiddenIds((prev) => [...prev, storyId]);
            Alert.alert('Terima kasih', 'Cerita ini telah disembunyikan dari layarmu.');
          },
        },
      ]
    );
  };

  const handleShareStory = async (
    author: string,
    quote: string,
    story: string,
    actionTaken?: string
  ) => {
    try {
      void haptics.tap();
      const actionText = actionTaken ? `\n\nLangkah nyata:\n${actionTaken}` : '';
      const shareMessage = `"${quote}"\n\n${story}${actionText}\n\n— Dari ${author} via Lentera`;
      await Share.share({
        message: shareMessage,
        title: 'Kisah Penguat dari Lentera',
      });
    } catch {
      // User membatalkan dialog share
    }
  };

  const handleOpenShareCard = (cardData: StoryCardData) => {
    void haptics.tap();
    setSelectedShareStory(cardData);
    setIsShareModalOpen(true);
  };

  const handleOpenSubmitModal = () => {
    void haptics.tap();
    setIsSubmitModalOpen(true);
  };

  const handleSubmitStory = async () => {
    if (!feltText.trim() || !actionText.trim() || !messageText.trim()) {
      Alert.alert(
        'Formulir Belum Lengkap',
        'Mohon isi setidaknya kondisi yang kamu rasakan, langkah nyata yang kamu ambil, dan pesan untuk pembaca.'
      );
      return;
    }

    try {
      await insertStorySubmission({
        author: authorName.trim() || 'Teman Lentera',
        category,
        felt: feltText.trim(),
        turningPoint: turningPointText.trim() || 'Momen saat merasa perlu berubah',
        actionTaken: actionText.trim(),
        resultText: resultText.trim() || 'Mulai menemukan ritme yang lebih tenang',
        message: messageText.trim(),
      });

      void haptics.success();
      await logWin('Menulis dan membagikan cerita penguat');

      Alert.alert(
        'Cerita Berhasil Dikirim',
        'Terima kasih telah berbagi pengalaman berhargamu. Ceritamu telah tersimpan di perangkat ini dan masuk dalam antrean kurasi.'
      );

      // Reset form
      setFeltText('');
      setTurningPointText('');
      setActionText('');
      setResultText('');
      setMessageText('');
      setIsSubmitModalOpen(false);
      await refreshData();
    } catch {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan cerita.');
    }
  };

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
    await refreshData();
  };

  // Filter & Urutan cerdas berbasis kondisi pengguna
  const visibleCuratedStories = useMemo(() => {
    let list = CURATED_STORIES.filter((s) => !hiddenIds.includes(s.id));

    // Filter kategori
    if (filter === 'high') {
      list = list.filter((s) => s.fromTier === 'high');
    } else if (filter === 'moderate') {
      list = list.filter((s) => s.fromTier === 'moderate');
    } else if (filter === 'college') {
      list = list.filter((s) => s.tags.includes('Kuliah') || s.tags.includes('Akademik'));
    } else if (filter === 'worker') {
      list = list.filter((s) => s.tags.includes('Pekerja muda') || s.tags.includes('Kebiasaan'));
    }

    // Prioritaskan cerita sesuai kondisi pengguna (Personalized Sorting On-Device)
    if (latestScreening?.tier === 'high' && filter === 'all') {
      list = [...list].sort((a, b) => (a.fromTier === 'high' ? -1 : 1));
    } else if (latestScreening?.tier === 'moderate' && filter === 'all') {
      list = [...list].sort((a, b) => (a.fromTier === 'moderate' ? -1 : 1));
    }

    return list;
  }, [filter, hiddenIds, latestScreening]);

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
        {/* Banner Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Kamu Tidak Berjalan Sendirian</Text>
          <Text style={styles.heroSub}>
            Kumpulan jejak dan titik balik dari teman-teman yang pernah berada di titik terendah mereka. Setiap cerita adalah bukti bahwa kondisi berat bisa membaik.
          </Text>

          <TouchableOpacity
            style={styles.shareCtaBtn}
            onPress={handleOpenSubmitModal}
            activeOpacity={0.88}
          >
            <SparkleIcon size={16} color="#FFFFFF" />
            <Text style={styles.shareCtaText}>Bagikan Kisah Penguatmu</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((f) => {
            const isActive = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => {
                  void haptics.tap();
                  setFilter(f.id);
                }}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Cerita Kiriman Pengguna (Jika ada) */}
        {userSubmissions.length > 0 && (
          <View style={styles.userSubmissionsSection}>
            <Text style={styles.subSectionTitle}>Ceritamu yang Terkirim</Text>
            {userSubmissions.map((sub) => (
              <View key={sub.id} style={styles.storyCard}>
                <View style={styles.storyTop}>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Terkirim • Dalam Moderasi</Text>
                  </View>
                  <Text style={styles.timeAgoText}>{formatRelativeTime(sub.createdAt)}</Text>
                </View>

                <View style={styles.storyBlock}>
                  <Text style={styles.blockLabel}>DULU MERASA:</Text>
                  <Text style={styles.storyBodyText}>{sub.felt}</Text>
                </View>

                <View style={styles.storyBlock}>
                  <Text style={styles.blockLabel}>TITIK BALIK & LANGKAH NYATA:</Text>
                  <Text style={styles.storyBodyText}>{sub.actionTaken}</Text>
                </View>

                <View style={styles.nowBox}>
                  <Text style={styles.nowLabel}>PESAN UNTUKMU:</Text>
                  <Text style={styles.nowText}>"{sub.message}"</Text>
                </View>

                <View style={styles.cardFooterDivider} />

                <View style={styles.cardFooter}>
                  <View style={styles.cardFooterActions}>
                    <TouchableOpacity
                      style={styles.shareBtn}
                      onPress={() =>
                        handleOpenShareCard({
                          quote: sub.message,
                          story: sub.felt,
                          actionTaken: sub.actionTaken,
                          author: sub.author,
                          conditionLabel: 'Cerita Pengguna',
                          timeAgo: formatRelativeTime(sub.createdAt),
                        })
                      }
                      activeOpacity={0.7}
                      accessibilityLabel="Bagikan kartu cerita ini"
                    >
                      <ShareIcon size={16} color={colors.textSecondary} />
                      <Text style={styles.shareBtnText}>Bagikan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Daftar Cerita Utama */}
        {visibleCuratedStories.map((s) => {
          const reaction = reactions[s.id] ?? { count: 24, isHelped: false };
          const postedTimeAgo = formatRelativeTime(
            Date.now() - (CURATED_TIME_OFFSETS[s.id] ?? 2 * 24 * 3600 * 1000)
          );

          return (
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
                    {s.fromTier === 'high' ? 'Dulu Kondisi Tinggi' : 'Dulu Kondisi Sedang'}
                  </Text>
                </View>
                <Text style={styles.timeAgoText}>{postedTimeAgo}</Text>
              </View>

              <Text style={styles.quote}>"{s.quote}"</Text>
              <Text style={styles.storyText}>{s.story}</Text>

              <View style={styles.nowBox}>
                <Text style={styles.nowLabel}>KONDISI SEKARANG</Text>
                <Text style={styles.nowText}>{s.nowStatus}</Text>
              </View>

              <View style={styles.actionRow}>
                <SparkleIcon size={14} color={colors.primary} />
                <Text style={styles.actionText}>Langkah nyata: {s.actionTaken}</Text>
              </View>

              <View style={styles.cardFooterDivider} />

              {/* Interaksi: Like Love & Bagikan & Laporkan */}
              <View style={styles.cardFooter}>
                <View style={styles.cardFooterActions}>
                  {/* Icon Like (Cukup Love + Jumlah, tanpa teks 'cerita ini membantuku') */}
                  <TouchableOpacity
                    style={[
                      styles.likeBtn,
                      reaction.isHelped && styles.likeBtnActive,
                    ]}
                    onPress={() => handleToggleHelpful(s.id)}
                    activeOpacity={0.7}
                    accessibilityLabel={reaction.isHelped ? 'Batal menyukai cerita' : 'Sukai cerita'}
                  >
                    <HeartIcon
                      size={17}
                      color={reaction.isHelped ? colors.accentPink : colors.textSecondary}
                      fill={reaction.isHelped ? colors.accentPink : 'none'}
                    />
                    <Text
                      style={[
                        styles.likeCountText,
                        reaction.isHelped && styles.likeCountTextActive,
                      ]}
                    >
                      {reaction.count}
                    </Text>
                  </TouchableOpacity>

                  {/* Tombol Bagikan */}
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() =>
                      handleOpenShareCard({
                        quote: s.quote,
                        story: s.story,
                        actionTaken: s.actionTaken,
                        author: s.authorLabel,
                        conditionLabel: s.fromTier === 'high' ? 'Dulu Kondisi Tinggi' : 'Dulu Kondisi Sedang',
                        timeAgo: postedTimeAgo,
                      })
                    }
                    activeOpacity={0.7}
                    accessibilityLabel="Bagikan kartu cerita ini"
                  >
                    <ShareIcon size={16} color={colors.textSecondary} />
                    <Text style={styles.shareBtnText}>Bagikan</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => handleReportStory(s.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Laporkan cerita ini"
                >
                  <Text style={styles.reportBtnText}>Laporkan</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Bagian Surat Pribadi untuk Dirimu Nanti */}
        <View style={styles.letterSection}>
          <Text style={styles.sectionHeading}>Tulis & Bagikan Cerita</Text>
          <Text style={styles.sectionSub}>
            Tuliskan kata-kata pengingat saat kamu sedang lapang. Tulisan ini murni tersimpan secara pribadi di perangkatmu dan bisa kamu hapus kapan saja.
          </Text>

          {composerOpen ? (
            <View>
              <TextInput
                style={styles.letterInput}
                placeholder="Tulis apa yang ingin kamu ingat saat membuka aplikasi ini lagi nanti..."
                placeholderTextColor={colors.textMuted}
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
                  style={[styles.primaryBtn, !draft.trim() && { opacity: 0.5 }]}
                  disabled={!draft.trim()}
                  onPress={saveLetter}
                >
                  <Text style={styles.primaryBtnText}>Simpan Surat</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.openComposerBtn}
              onPress={() => {
                void haptics.tap();
                setComposerOpen(true);
              }}
            >
              <Text style={styles.openComposerText}>+ Tulis Surat untuk Diri Sendiri</Text>
            </TouchableOpacity>
          )}

          {letters.map((ltr) => (
            <View key={ltr.id} style={styles.letterCard}>
              <Text style={styles.letterBody}>{ltr.body}</Text>
              <View style={styles.letterBottom}>
                <Text style={styles.letterDate}>
                  {new Date(ltr.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    void haptics.alert();
                    await deleteStoryLetter(ltr.id);
                    await refreshData();
                  }}
                >
                  <TrashIcon size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal Formulir Pengiriman 5 Bagian */}
      <Modal
        visible={isSubmitModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSubmitModalOpen(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>Bagikan Kisah Penguat</Text>
            <TouchableOpacity
              onPress={() => setIsSubmitModalOpen(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalNotice}>
              <ShieldLockIcon size={16} color={colors.primary} />
              <Text style={styles.modalNoticeText}>
                Ceritamu ditujukan untuk menguatkan orang lain. Tidak perlu nama asli. Semua pengiriman melalui peninjauan kurasi sebelum tayang publik.
              </Text>
            </View>

            {/* Nama & Kategori */}
            <Text style={styles.inputLabel}>NAMA PANGGILAN SAMARAN (OPSIONAL)</Text>
            <TextInput
              style={styles.formInput}
              value={authorName}
              onChangeText={setAuthorName}
              placeholder="Contoh: Teman Lentera, Kawan Kuliah"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.inputLabel}>TEMA CERITA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {CATEGORY_CHOICES.map((c) => {
                  const isCatSelected = category === c;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.categoryPill, isCatSelected && styles.categoryPillActive]}
                      onPress={() => setCategory(c)}
                    >
                      <Text style={[styles.categoryPillText, isCatSelected && styles.categoryPillTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Template 5 Bagian */}
            <Text style={styles.sectionHeader}>TEMPLATE 5 LANGKAH REFLEKSI</Text>

            <View style={styles.formGroup}>
              <Text style={styles.stepTitle}>1. Dulu Merasa...</Text>
              <Text style={styles.stepSub}>Apa yang kamu rasakan saat berada di titik paling berat?</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={feltText}
                onChangeText={setFeltText}
                placeholder="Contoh: Setiap pagi terasa hampa dan cemas memikirkan masa depan..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.stepTitle}>2. Titik Balik</Text>
              <Text style={styles.stepSub}>Momen apa yang menyadarkanmu bahwa kamu perlu melangkah?</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={turningPointText}
                onChangeText={setTurningPointText}
                placeholder="Contoh: Saat membaca bahwa lelah ini bukan karena aku malas, tapi butuh jeda..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.stepTitle}>3. Yang Kulakukan</Text>
              <Text style={styles.stepSub}>Langkah nyata kecil apa yang mulai kamu ambil?</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={actionText}
                onChangeText={setActionText}
                placeholder="Contoh: Mulai berani cerita ke dokter puskesmas dan berjalan kaki 15 menit..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.stepTitle}>4. Ternyata...</Text>
              <Text style={styles.stepSub}>Bagaimana dampaknya bagi pikiran dan energimu sekarang?</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={resultText}
                onChangeText={setResultText}
                placeholder="Contoh: Masalah tidak langsung hilang, tapi aku tidak lagi menyalahkan diriku..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.stepTitle}>5. Pesan untuk Pembaca</Text>
              <Text style={styles.stepSub}>Satu kalimat penguat bagi teman yang sedang membaca ini:</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Contoh: Mengambil jeda bukan berarti kamu kalah. Bernapaslah perlahan."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmitStory}
              activeOpacity={0.88}
            >
              <Text style={styles.submitBtnText}>Kirim Cerita Anonim</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Pratinjau Kartu Ucapan / Quote Card (Medium-Style) */}
      <StoryCardModal
        visible={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={selectedShareStory}
      />
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
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 40,
  },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  heroTitle: {
    ...typography.headlineMd,
    fontSize: 20,
    color: colors.textPrimary,
  },
  heroSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  shareCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: spacing.md,
  },
  shareCtaText: {
    ...typography.labelSm,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  filterScroll: {
    gap: 8,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.labelSm,
    color: colors.textSecondary,
    fontFamily: 'Montserrat-Medium',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },

  userSubmissionsSection: {
    marginBottom: spacing.md,
  },
  subSectionTitle: {
    ...typography.labelSm,
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: 0.6,
  },
  pendingBadge: {
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.onTertiaryContainer,
  },
  storyBlock: {
    marginTop: spacing.xs,
  },
  blockLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  storyBodyText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 18,
  },

  storyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.md,
  },
  storyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  tierTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tierTagText: {
    ...typography.labelSm,
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
  },
  timeAgoText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'Montserrat-Medium',
  },
  quote: {
    ...typography.cardTitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  storyText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  nowBox: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  nowLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  nowText: {
    ...typography.bodySm,
    color: colors.textPrimary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  actionText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.primary,
    fontFamily: 'Montserrat-SemiBold',
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  likeBtnActive: {
    backgroundColor: colors.accentPinkSoft,
    borderColor: colors.accentPink,
  },
  likeCountText: {
    ...typography.labelSm,
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Montserrat-SemiBold',
  },
  likeCountTextActive: {
    color: colors.accentPink,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  shareBtnText: {
    ...typography.labelSm,
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Montserrat-Medium',
  },
  reportBtn: {
    padding: 6,
  },
  reportBtnText: {
    fontSize: 11,
    color: colors.textMuted,
  },

  // Surat pribadi
  letterSection: {
    marginTop: spacing.lg,
  },
  sectionHeading: {
    ...typography.headlineMd,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSub: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  openComposerBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  openComposerText: {
    ...typography.labelSm,
    color: colors.primary,
    fontFamily: 'Montserrat-SemiBold',
  },
  letterInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    ...typography.bodySm,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: spacing.sm,
  },
  composerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ghostBtn: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  ghostBtnText: {
    ...typography.labelSm,
    color: colors.textSecondary,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  primaryBtnText: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  letterCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: spacing.sm,
  },
  letterBody: {
    ...typography.bodySm,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  letterBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  letterDate: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.surface,
  },
  modalHeaderTitle: {
    ...typography.labelLg,
    fontFamily: 'Montserrat-Bold',
    color: colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseBtnText: {
    ...typography.labelSm,
    color: colors.primary,
    fontFamily: 'Montserrat-SemiBold',
  },
  modalScroll: {
    padding: spacing.marginMobile,
    paddingBottom: spacing.xxl + 40,
  },
  modalNotice: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primarySoft,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  modalNoticeText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.primary,
    flex: 1,
    lineHeight: 18,
  },
  inputLabel: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...typography.bodySm,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  multilineInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryPillText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    color: colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
  sectionHeader: {
    ...typography.labelSm,
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    letterSpacing: 0.8,
  },
  formGroup: {
    marginBottom: spacing.sm,
  },
  stepTitle: {
    ...typography.labelSm,
    fontFamily: 'Montserrat-SemiBold',
    color: colors.textPrimary,
  },
  stepSub: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnText: {
    ...typography.labelSm,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.3,
  },
});

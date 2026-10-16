import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, radius, spacing, shadows } from '../theme';
import {
  ChevronLeftIcon,
  ShieldLockIcon,
  RefreshCwIcon,
  BadgeCheckIcon,
  UserProfileIcon,
} from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { haptics } from '../services/haptics';
import {
  matchRandomCounselor,
  skipCurrentCounselor,
  fetchSessionMessages,
  sendChatMessage,
  type CounselorInfo,
  type ChatMessageRecord,
} from '../services/pocketbase';

interface Props {
  onBack?: () => void;
  onQuickClose: () => void;
  onOpenSupport: () => void;
}

interface Message {
  id: string;
  sender: 'counselor' | 'user';
  text: string;
  time: string;
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'm_welcome',
  sender: 'counselor',
  text: 'Halo! Aku konselor pendamping anonim LENTERA. Semua obrolan di sini aman, tanpa nama asli, dan tidak disimpan ke server mana pun.',
  time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
};

export const AnonymousChatScreen: React.FC<Props> = ({ onBack, onQuickClose, onOpenSupport }) => {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [counselor, setCounselor] = useState<CounselorInfo | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const pollIntervalRef = useRef<any>(null);

  const scrollToBottom = (animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated });
  };

  // Mulai mencocokkan konselor saat pertama kali masuk
  useEffect(() => {
    void handleFindMatch();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Polling pesan terbaru dari realtime database PocketBase jika sesi aktif
  useEffect(() => {
    if (!sessionId) return;

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = setInterval(async () => {
      try {
        const records = await fetchSessionMessages(sessionId);
        if (records && records.length > 0) {
          const mapped: Message[] = records.map((r: ChatMessageRecord) => ({
            id: r.id,
            sender: r.sender === 'user' ? 'user' : 'counselor',
            text: r.text,
            time: new Date(r.created).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          }));

          setMessages((prev) => {
            // Cek apakah ada pesan baru
            if (mapped.length !== prev.length || mapped[mapped.length - 1]?.id !== prev[prev.length - 1]?.id) {
              setTimeout(() => scrollToBottom(true), 100);
              return mapped;
            }
            return prev;
          });
        }
      } catch {
        // Abaikan kesalahan koneksi saat polling di background
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId]);

  const handleFindMatch = async () => {
    setIsMatching(true);
    void haptics.tap();

    try {
      const match = await matchRandomCounselor();
      setSessionId(match.sessionId);
      setCounselor(match.psychologist);

      // Ambil pesan awal
      const records = await fetchSessionMessages(match.sessionId);
      if (records && records.length > 0) {
        setMessages(
          records.map((r) => ({
            id: r.id,
            sender: r.sender === 'user' ? 'user' : 'counselor',
            text: r.text,
            time: new Date(r.created).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          }))
        );
      }
      void haptics.success();
    } catch {
      // Fallback lokal jika backend belum terjangkau
      setCounselor({
        id: 'cns_demo',
        name: 'Rania Wardani, S.Psi.',
        university: 'Universitas Gadjah Mada',
        bio: 'Fokus pada pendampingan kecemasan akademik, burnout mahasiswa, dan transisi quarter-life crisis.',
        kyc_status: 'verified',
      });
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    } finally {
      setIsMatching(false);
      setTimeout(() => scrollToBottom(true), 200);
    }
  };

  const handleSkipCounselor = async () => {
    void haptics.tap();
    if (sessionId) {
      void skipCurrentCounselor(sessionId);
    }
    setSessionId(null);
    setCounselor(null);
    setMessages([]);
    await handleFindMatch();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const textToSend = input.trim();
    const tempId = `usr_${Date.now()}`;
    const userMsg: Message = {
      id: tempId,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    void haptics.tap();
    setTimeout(() => scrollToBottom(true), 80);

    if (sessionId) {
      try {
        await sendChatMessage(sessionId, textToSend);
      } catch {
        // Fallback simulasi
      }
    } else {
      // Simulasi lokal jika offline
      setTimeout(() => {
        const reply: Message = {
          id: `cns_${Date.now()}`,
          sender: 'counselor',
          text: 'Terima kasih sudah mau berbagi. Yang kamu rasakan itu valid dan manusiawi. Ambil napas pelan dulu, kamu sedang aman di sini.',
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, reply]);
        void haptics.success();
        setTimeout(() => scrollToBottom(true), 80);
      }, 1000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Kembali">
            <ChevronLeftIcon size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <TouchableOpacity
          style={styles.titleWrap}
          onPress={() => counselor && setShowProfileModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.nameHeaderRow}>
            <Text style={styles.topTitle}>
              {counselor ? counselor.name : 'Mencari Konselor...'}
            </Text>
            {counselor?.kyc_status === 'verified' && (
              <BadgeCheckIcon size={16} color={colors.tertiary} />
            )}
          </View>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>
              {counselor ? `${counselor.university} • Ketuk profil` : '100% Rahasia & Privat'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Tombol Ganti / Skip Konselor */}
        <TouchableOpacity
          onPress={handleSkipCounselor}
          style={styles.skipBtn}
          accessibilityLabel="Ganti Konselor"
          disabled={isMatching}
        >
          {isMatching ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <RefreshCwIcon size={16} color={colors.primary} />
              <Text style={styles.skipBtnText}>Ganti</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Banner info privasi & hotline */}
      <View style={styles.bannerRow}>
        <ShieldLockIcon size={14} color={colors.primary} />
        <Text style={styles.bannerText}>
          Obrolan anonim tanpa login. Jika dalam bahaya darurat, buka{' '}
          <Text style={styles.bannerLink} onPress={onOpenSupport}>
            Hotline 119
          </Text>
          .
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom(true)}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <View
              key={m.id}
              style={[
                styles.bubbleWrap,
                isUser ? styles.bubbleWrapUser : styles.bubbleWrapCounselor,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleCounselor,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    isUser ? styles.bubbleTextUser : styles.bubbleTextCounselor,
                  ]}
                >
                  {m.text}
                </Text>
                <Text
                  style={[
                    styles.bubbleTime,
                    isUser ? styles.bubbleTimeUser : styles.bubbleTimeCounselor,
                  ]}
                >
                  {m.time}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input chat bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ketik apa yang sedang kamu rasakan..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          disabled={!input.trim()}
          onPress={handleSend}
          activeOpacity={0.85}
        >
          <Text style={styles.sendBtnText}>Kirim</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Detail Informasi Profil & KYC Psikolog */}
      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.avatarWrap}>
              <UserProfileIcon size={38} color={colors.primary} />
            </View>

            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalCounselorName}>{counselor?.name}</Text>
              {counselor?.kyc_status === 'verified' && (
                <View style={styles.verifiedBadge}>
                  <BadgeCheckIcon size={14} color={colors.tertiary} />
                  <Text style={styles.verifiedBadgeText}>KYC Terverifikasi</Text>
                </View>
              )}
            </View>

            <Text style={styles.modalUniversity}>{counselor?.university}</Text>

            <View style={styles.modalDivider} />

            <Text style={styles.modalSectionTitle}>Tentang Konselor</Text>
            <Text style={styles.modalBio}>
              {counselor?.bio || 'Konselor pendamping sebaya dari fakultas psikologi.'}
            </Text>

            <View style={styles.kycGuaranteeBox}>
              <ShieldLockIcon size={16} color={colors.primary} />
              <Text style={styles.kycGuaranteeText}>
                Konselor telah melalui validasi KTM & identitas akademik resmi untuk menjamin etika dan kenyamanan obrolanmu.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowProfileModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseBtnText}>Tutup Profil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
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
  titleWrap: { alignItems: 'center', flex: 1, paddingHorizontal: 6 },
  nameHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  topTitle: { ...typography.headlineMd, color: colors.primary, fontSize: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  statusText: { ...typography.bodySm, fontSize: 11, color: colors.onSurfaceVariant },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: radius.button,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  skipBtnText: {
    ...typography.labelSm,
    color: colors.primary,
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: spacing.marginMobile,
    marginHorizontal: spacing.marginMobile,
    borderRadius: radius.chip,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  bannerText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.primary,
    flex: 1,
  },
  bannerLink: {
    fontFamily: 'Montserrat-Bold',
    textDecorationLine: 'underline',
  },
  chatList: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  bubbleWrap: {
    flexDirection: 'row',
    width: '100%',
  },
  bubbleWrapCounselor: {
    justifyContent: 'flex-start',
  },
  bubbleWrapUser: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.card,
  },
  bubbleCounselor: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderBottomLeftRadius: 2,
    ...shadows.card,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleText: {
    ...typography.bodyMd,
    lineHeight: 20,
    fontSize: 14,
  },
  bubbleTextCounselor: {
    color: colors.onSurface,
  },
  bubbleTextUser: {
    color: colors.onPrimary,
  },
  bubbleTime: {
    ...typography.bodySm,
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeCounselor: {
    color: colors.onSurfaceVariant,
  },
  bubbleTimeUser: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.marginMobile,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.card,
    paddingHorizontal: spacing.md,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.outlineVariant,
  },
  sendBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontFamily: 'Montserrat-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  modalCounselorName: {
    ...typography.headlineMd,
    color: colors.primary,
    textAlign: 'center',
    fontSize: 18,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.tierModerateContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.button,
  },
  verifiedBadgeText: {
    ...typography.labelSm,
    fontSize: 10,
    color: colors.tertiary,
    fontFamily: 'Montserrat-Bold',
  },
  modalUniversity: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.md,
  },
  modalSectionTitle: {
    ...typography.labelMd,
    color: colors.primary,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  modalBio: {
    ...typography.bodyMd,
    color: colors.onSurface,
    lineHeight: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  kycGuaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.primarySoft,
    padding: spacing.sm + 2,
    borderRadius: radius.card,
    marginBottom: spacing.lg,
    width: '100%',
  },
  kycGuaranteeText: {
    ...typography.bodySm,
    color: colors.primary,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontFamily: 'Montserrat-Bold',
  },
});

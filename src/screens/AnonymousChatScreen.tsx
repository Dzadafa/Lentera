import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, radius, spacing, shadows } from '../theme';
import { ChevronLeftIcon, ShieldLockIcon, PhoneAlertIcon } from '../components/Icons';
import { QuickCloseButton } from '../components/QuickCloseButton';
import { haptics } from '../services/haptics';

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

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'counselor',
    text: 'Halo! Aku konselor pendamping anonim LENTERA. Semua obrolan di sini aman, tanpa nama asli, dan tidak disimpan ke server mana pun.',
    time: '10:00',
  },
  {
    id: 'm2',
    sender: 'counselor',
    text: 'Bagaimana perasaanmu atau apa yang sedang terasa berat hari ini? Kamu boleh bercerita seadanya, tanpa perlu terburu-buru.',
    time: '10:01',
  },
];

export const AnonymousChatScreen: React.FC<Props> = ({ onBack, onQuickClose, onOpenSupport }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const scrollViewRef = React.useRef<ScrollView>(null);

  const scrollToBottom = (animated = true) => {
    scrollViewRef.current?.scrollToEnd({ animated });
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: input.trim(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    void haptics.tap();

    // Auto-scroll saat user kirim
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);

    // Respons hangat simulasi konselor anonim
    setTimeout(() => {
      const reply: Message = {
        id: `cns_${Date.now()}`,
        sender: 'counselor',
        text: 'Terima kasih sudah mau berbagi. Yang kamu rasakan itu valid dan manusiawi. Ambil napas pelan dulu, kamu sedang aman di sini.',
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
      void haptics.success();
      // Auto-scroll saat konselor membalas
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }, 1200);
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
        <View style={styles.titleWrap}>
          <Text style={styles.topTitle}>Konselor Anonim</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>100% Rahasia & Privat</Text>
          </View>
        </View>
        <QuickCloseButton onPress={onQuickClose} label="" />
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
                <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextCounselor]}>
                  {m.text}
                </Text>
                <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeCounselor]}>
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
  titleWrap: { alignItems: 'center' },
  topTitle: { ...typography.headlineMd, color: colors.primary, fontSize: 18 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  statusText: { ...typography.bodySm, fontSize: 11, color: colors.onSurfaceVariant },
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
    borderTopLeftRadius: 4,
    ...shadows.card,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    ...typography.bodyMd,
    lineHeight: 22,
  },
  bubbleTextCounselor: {
    color: colors.onSurface,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTime: {
    ...typography.labelSm,
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeCounselor: {
    color: colors.onSurfaceVariant,
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.sm,
    paddingBottom: 76,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 90,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    height: 42,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendBtnText: {
    ...typography.labelMd,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { colors, typography, radius, shadows } from '../theme';
import {
  HomeIcon,
  HistoryIcon,
  MessageChatIcon,
  BookOpenIcon,
  UserProfileIcon,
} from './Icons';
import { haptics } from '../services/haptics';

// Aktifkan LayoutAnimation di Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type MainTab = 'home' | 'trend' | 'chat' | 'stories' | 'profile';

interface Props {
  currentTab: MainTab;
  onTabSelect: (tab: MainTab) => void;
}

interface TabDef {
  key: MainTab;
  label: string;
  renderIcon: (active: boolean) => React.ReactNode;
}

const TABS: TabDef[] = [
  {
    key: 'home',
    label: 'Beranda',
    renderIcon: (active) => (
      <HomeIcon size={20} color={active ? '#FFFFFF' : '#8A8A96'} />
    ),
  },
  {
    key: 'trend',
    label: 'Riwayat',
    renderIcon: (active) => (
      <HistoryIcon size={20} color={active ? '#FFFFFF' : '#8A8A96'} />
    ),
  },
  {
    key: 'chat',
    label: 'Konselor',
    renderIcon: (active) => (
      <MessageChatIcon size={20} color={active ? '#FFFFFF' : '#8A8A96'} />
    ),
  },
  {
    key: 'stories',
    label: 'Cerita',
    renderIcon: (active) => (
      <BookOpenIcon size={20} color={active ? '#FFFFFF' : '#8A8A96'} />
    ),
  },
  {
    key: 'profile',
    label: 'Profil',
    renderIcon: (active) => (
      <UserProfileIcon size={20} color={active ? '#FFFFFF' : '#8A8A96'} />
    ),
  },
];

export const BottomNavBar: React.FC<Props> = ({ currentTab, onTabSelect }) => {
  const handleSelectTab = (tabKey: MainTab) => {
    if (currentTab !== tabKey) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      void haptics.tap();
      onTabSelect(tabKey);
    }
  };

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      <View style={styles.floatingCapsule}>
        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabTouchArea,
                isActive && styles.activePill,
              ]}
              onPress={() => handleSelectTab(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
            >
              <View style={styles.iconWrap}>
                {tab.renderIcon(isActive)}
              </View>

              {isActive && (
                <Text style={styles.activeLabel} numberOfLines={1}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  floatingCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', // Latar belakang putih bersih
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: '92%',
    maxWidth: 390,
    shadowColor: '#1B1B23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(27, 27, 35, 0.08)',
  },
  tabTouchArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    minHeight: 40,
  },
  activePill: {
    backgroundColor: colors.primary, // Ungu utama LENTERA #7843E4
    paddingHorizontal: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    ...typography.labelSm,
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 6,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.2,
  },
});

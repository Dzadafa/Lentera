import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./theme";
import { useAppStore } from "./store/appStore";
import type { ScreenRoute } from "./navigation/routes";
import { HomeScreen } from "./screens/HomeScreen";
import { CalmRoomScreen } from "./screens/CalmRoomScreen";
import { QuizScreen } from "./screens/QuizScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { ReferralGuideScreen } from "./screens/ReferralGuideScreen";
import { CheckInScreen } from "./screens/CheckInScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SelfCareScreen } from "./screens/SelfCareScreen";
import { BurnoutScreen } from "./screens/BurnoutScreen";
import { StoryWallScreen } from "./screens/StoryWallScreen";
import { PeerSupportScreen } from "./screens/PeerSupportScreen";
import { TrendScreen } from "./screens/TrendScreen";
import { StealthScreen } from "./screens/StealthScreen";
import { WelcomeSplashScreen } from "./screens/WelcomeSplashScreen";
import { AnonymousChatScreen } from "./screens/AnonymousChatScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { BottomNavBar, type MainTab } from "./components/BottomNavBar";
import { EmergencyInterceptor } from "./components/EmergencyInterceptor";

import { useFonts } from "expo-font";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat_400Regular.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat_500Medium.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat_600SemiBold.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat_700Bold.ttf"),
  });

  const [currentRoute, setCurrentRoute] = useState<ScreenRoute>("home");
  const [routeHistory, setRouteHistory] = useState<ScreenRoute[]>(["home"]);
  const [currentMainTab, setCurrentMainTab] = useState<MainTab>("home");
  const isInitialized = useAppStore((s) => s.isInitialized);
  const initialize = useAppStore((s) => s.initialize);
  const markSplashSeen = useAppStore((s) => s.markSplashSeen);

  useEffect(() => {
    if (fontError) {
      console.warn("Gagal memuat font Plus Jakarta Sans:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    initialize().then(() => {
      const seen = useAppStore.getState().hasSeenSplash;
      if (!seen) {
        setCurrentRoute("splash");
      }
    });
  }, [initialize]);

  const handleNavigate = (route: ScreenRoute) => {
    if (route === currentRoute) return;
    setRouteHistory((prev) => [...prev, route]);
    setCurrentRoute(route);
    if (
      route === "home" ||
      route === "trend" ||
      route === "chat" ||
      route === "stories" ||
      route === "profile"
    ) {
      setCurrentMainTab(route as MainTab);
    }
  };

  const handleGoBack = useCallback(() => {
    if (currentRoute === "stealth") {
      const prev = routeHistory[routeHistory.length - 2] ?? "home";
      setCurrentRoute(prev === "stealth" ? "home" : prev);
      return true;
    }

    if (routeHistory.length > 1) {
      const newHistory = [...routeHistory];
      newHistory.pop(); // buang route aktif
      const previous = newHistory[newHistory.length - 1];
      setRouteHistory(newHistory);
      setCurrentRoute(previous);
      if (
        previous === "home" ||
        previous === "trend" ||
        previous === "chat" ||
        previous === "stories" ||
        previous === "profile"
      ) {
        setCurrentMainTab(previous as MainTab);
      }
      return true;
    }

    if (currentRoute !== "home") {
      setCurrentRoute("home");
      setCurrentMainTab("home");
      setRouteHistory(["home"]);
      return true;
    }

    // Jika sudah di Home, biarkan sistem menutup aplikasi
    return false;
  }, [currentRoute, routeHistory]);

  // Listener Back Button Android Native
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleGoBack,
    );
    return () => backHandler.remove();
  }, [handleGoBack]);

  const handleQuickClose = () => {
    setRouteHistory((prev) => [...prev, "stealth"]);
    setCurrentRoute("stealth");
  };

  const handleExitStealth = () => {
    handleGoBack();
  };

  const handleTabSelect = (tab: MainTab) => {
    setCurrentMainTab(tab);
    handleNavigate(tab);
  };

  if (!isInitialized || (!fontsLoaded && !fontError)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Tampilkan BottomNavBar hanya pada layar utama tab
  const showBottomNav =
    currentRoute === "home" ||
    currentRoute === "trend" ||
    currentRoute === "chat" ||
    currentRoute === "stories" ||
    currentRoute === "profile";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <StatusBar
          barStyle={
            currentRoute === "stealth" ? "dark-content" : "dark-content"
          }
          backgroundColor={
            currentRoute === "stealth" ? "#FFFFFF" : colors.background
          }
        />
        <View style={styles.container}>
          <View style={styles.screenContent}>
            {currentRoute === "splash" && (
              <WelcomeSplashScreen
                onComplete={async () => {
                  await markSplashSeen();
                  setCurrentRoute("home");
                  setRouteHistory(["home"]);
                  setCurrentMainTab("home");
                }}
              />
            )}

            {currentRoute === "home" && (
              <HomeScreen
                onNavigate={handleNavigate}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "calm" && (
              <CalmRoomScreen
                onBack={handleGoBack}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "quiz" && (
              <QuizScreen
                onBack={handleGoBack}
                onComplete={() => handleNavigate("result")}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "result" && (
              <ResultScreen
                onBack={handleGoBack}
                onOpenReferral={() => handleNavigate("referral")}
                onOpenCheckIn={() => handleNavigate("checkin")}
                onOpenSelfCare={() => handleNavigate("selfcare")}
                onOpenBurnout={() => handleNavigate("burnout")}
                onOpenStories={() => handleNavigate("stories")}
                onOpenSupport={() => handleNavigate("support")}
                onOpenTrend={() => handleNavigate("trend")}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "trend" && (
              <TrendScreen
                onOpenQuiz={() => handleNavigate("quiz")}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "chat" && (
              <AnonymousChatScreen
                onQuickClose={handleQuickClose}
                onOpenSupport={() => handleNavigate("support")}
              />
            )}

            {currentRoute === "selfcare" && (
              <SelfCareScreen
                onBack={handleGoBack}
                onOpenCheckIn={() => handleNavigate("checkin")}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "burnout" && (
              <BurnoutScreen
                onBack={handleGoBack}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "stories" && (
              <StoryWallScreen onQuickClose={handleQuickClose} />
            )}

            {currentRoute === "support" && (
              <PeerSupportScreen
                onBack={handleGoBack}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "profile" && (
              <ProfileScreen
                onQuickClose={handleQuickClose}
                onOpenSettings={() => handleNavigate("settings")}
                onOpenTrend={() => handleNavigate("trend")}
                onOpenSplash={() => handleNavigate("splash")}
              />
            )}

            {currentRoute === "referral" && (
              <ReferralGuideScreen
                onBack={handleGoBack}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "checkin" && (
              <CheckInScreen
                onBack={handleGoBack}
                onQuickClose={handleQuickClose}
              />
            )}

            {currentRoute === "settings" && (
              <SettingsScreen
                onBack={handleGoBack}
                onQuickClose={handleQuickClose}
                onOpenSplash={() => handleNavigate("splash")}
              />
            )}

            {currentRoute === "stealth" && (
              <StealthScreen onExit={handleExitStealth} />
            )}
          </View>

          {/* Bottom Navigation Bar */}
          {showBottomNav && (
            <BottomNavBar
              currentTab={currentMainTab}
              onTabSelect={handleTabSelect}
            />
          )}

          {/* Emergency Interceptor global */}
          <EmergencyInterceptor />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    flex: 1,
  },
});

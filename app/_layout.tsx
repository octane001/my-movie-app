import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

/**
 * Handles auth-based navigation redirects.
 * Lives inside <AuthProvider> so it can access the auth context,
 * and inside <Stack> so router is available.
 * Using useEffect + router.replace() avoids placing <Redirect>
 * directly inside <Stack> (which only accepts <Stack.Screen> children).
 */
function AuthGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen =
      segments[0] === "login" || segments[0] === "signup";

    if (!user && !inAuthScreen) {
      // Not logged in → send to login
      router.replace("/login");
    } else if (user && inAuthScreen) {
      // Already logged in but on auth screen → send to app
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return null; // Renders nothing — only controls navigation
}

function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#030014",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#AB8BFF" />
      </View>
    );
  }

  return (
    <>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movies/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#030014" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

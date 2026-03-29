import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/services/auth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getSavedMovies, SavedMovie } from "@/services/addData";
import { images } from "@/constants/images";

const { width } = Dimensions.get("window");

// Generate a consistent color from a string
const getAvatarColor = (name: string) => {
  const colors = [
    ["#AB8BFF", "#7c5cbf"],
    ["#f87171", "#b91c1c"],
    ["#34d399", "#059669"],
    ["#60a5fa", "#2563eb"],
    ["#f472b6", "#be185d"],
  ];
  const index = (name?.charCodeAt(0) || 0) % colors.length;
  return colors[index];
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 8,
    }}
  >
    <Ionicons name={icon as any} size={22} color="#AB8BFF" />
    <Text style={{ color: "#fff", fontWeight: "800", fontSize: 20, marginTop: 6 }}>{value}</Text>
    <Text style={{ color: "#A8B5DB", fontSize: 11, marginTop: 2, textAlign: "center" }}>{label}</Text>
  </View>
);

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const displayName = user?.displayName || "Movie Fan";
  const email = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const avatarColors = getAvatarColor(displayName);

  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  useEffect(() => {
    if (!user) {
      setSavedLoading(false);
      return;
    }
    getSavedMovies(user.uid)
      .then(setSavedMovies)
      .catch(() => setSavedMovies([]))
      .finally(() => setSavedLoading(false));
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            router.replace("/login");
          } catch {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: "#030014", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Ionicons name="person-outline" size={52} color="#AB8BFF" />
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 16 }}>
          Not signed in
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={{ marginTop: 20, backgroundColor: "#AB8BFF", paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#030014", paddingTop: insets.top }}>
      <Image source={images.bg} style={{ position: "absolute", width: "100%", opacity: 0.4 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>Profile</Text>
        </View>

        {/* ── Avatar + Name Card ── */}
        <View style={{ marginHorizontal: 20, marginTop: 16 }}>
          <LinearGradient
            colors={["rgba(171,139,255,0.15)", "rgba(124,92,191,0.08)"]}
            style={{
              borderRadius: 20, padding: 24,
              borderWidth: 1, borderColor: "rgba(171,139,255,0.2)",
              alignItems: "center"
            }}
          >
            {/* Avatar */}
            <LinearGradient
              colors={avatarColors as [string, string]}
              style={{
                width: 80, height: 80, borderRadius: 40,
                justifyContent: "center", alignItems: "center",
                marginBottom: 14, shadowColor: avatarColors[0],
                shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8,
                elevation: 8
              }}
            >
              <Text style={{ color: "#fff", fontSize: 30, fontWeight: "800" }}>{initials}</Text>
            </LinearGradient>

            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{displayName}</Text>
            <Text style={{ color: "#A8B5DB", fontSize: 14, marginTop: 4 }}>{email}</Text>

            {/* Member badge */}
            <View style={{
              marginTop: 10, flexDirection: "row", alignItems: "center", gap: 5,
              backgroundColor: "rgba(171,139,255,0.15)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20
            }}>
              <Ionicons name="ribbon-outline" size={13} color="#AB8BFF" />
              <Text style={{ color: "#AB8BFF", fontSize: 12, fontWeight: "600" }}>
                Member since {memberSince}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Stats ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 12 }}>
            Your Stats
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <StatCard
              icon="bookmark"
              label="Saved"
              value={savedLoading ? "—" : savedMovies.length}
            />
            <StatCard
              icon="film-outline"
              label="Watchlist"
              value={savedLoading ? "—" : savedMovies.length}
            />
            <StatCard
              icon="star"
              label="Favourites"
              value={savedLoading ? "—" : Math.min(savedMovies.length, 5)}
            />
          </View>
        </View>

        {/* ── Recent Saves Preview ── */}
        {!savedLoading && savedMovies.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Recently Saved</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/saved" as any)}>
                <Text style={{ color: "#AB8BFF", fontSize: 13, fontWeight: "600" }}>View all →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {savedMovies.slice(0, 6).map((m) => (
                <TouchableOpacity
                  key={m.movie_id}
                  onPress={() => router.push(`/movies/${m.movie_id}` as any)}
                  style={{ marginRight: 10 }}
                >
                  <Image
                    source={{
                      uri: m.poster_path
                        ? `https://image.tmdb.org/t/p/w200${m.poster_path}`
                        : "https://placehold.co/200x300/1a1a1a/ffffff?text=N/A",
                    }}
                    style={{ width: 72, height: 108, borderRadius: 8 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Menu Items ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 12 }}>Account</Text>

          {[
            { icon: "bookmark-outline", label: "My Watchlist", onPress: () => router.push("/(tabs)/saved" as any) },
            { icon: "information-circle-outline", label: "App Version", right: "1.0.0", onPress: () => {} },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                backgroundColor: "rgba(255,255,255,0.04)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Ionicons name={item.icon as any} size={20} color="#A8B5DB" />
                <Text style={{ color: "#fff", fontSize: 15 }}>{item.label}</Text>
              </View>
              <Text style={{ color: "#A8B5DB", fontSize: 13 }}>{item.right || "›"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Logout ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={loggingOut}
            style={{ borderRadius: 12, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["rgba(239,68,68,0.2)", "rgba(185,28,28,0.2)"]}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "center",
                gap: 8, paddingVertical: 15,
                borderWidth: 1, borderColor: "rgba(239,68,68,0.4)", borderRadius: 12
              }}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color="#f87171" />
              ) : (
                <Ionicons name="log-out-outline" size={20} color="#f87171" />
              )}
              <Text style={{ color: "#f87171", fontWeight: "700", fontSize: 15 }}>
                {loggingOut ? "Signing out..." : "Sign Out"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

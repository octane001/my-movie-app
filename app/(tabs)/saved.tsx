import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToSavedMovies, unsaveMovie, SavedMovie } from "@/services/addData";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { images } from "@/constants/images";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 12) / 3;

const FALLBACK_POSTER =
  "https://placehold.co/500x750/1a1a1a/ffffff?text=No+Image";

const SavedMovieCard = ({
  movie,
  onUnsave,
}: {
  movie: SavedMovie;
  onUnsave: (id: number) => void;
}) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onUnsave(movie.movie_id);
    } catch {
      // Error already logged in service layer
    } finally {
      setRemoving(false);
    }
  };

  return (
    <View style={{ width: CARD_WIDTH, marginBottom: 16 }}>
      <Link href={`/movies/${movie.movie_id}`} asChild>
        <TouchableOpacity>
          <Image
            source={{
              uri: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : FALLBACK_POSTER,
            }}
            style={{ width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: 10 }}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </Link>

      {/* Remove button */}
      <TouchableOpacity
        onPress={handleRemove}
        disabled={removing}
        style={{
          position: "absolute", top: 6, right: 6,
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: "rgba(0,0,0,0.75)",
          justifyContent: "center", alignItems: "center",
        }}
      >
        {removing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="close" size={14} color="#fff" />
        )}
      </TouchableOpacity>

      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", marginTop: 6 }} numberOfLines={1}>
        {movie.title}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
        <Ionicons name="star" size={10} color="#fbbf24" />
        <Text style={{ color: "#A8B5DB", fontSize: 10 }}>
          {Math.round(movie.vote_average * 10) / 10}
        </Text>
      </View>
    </View>
  );
};

const Saved = () => {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToSavedMovies(
      user.uid,
      (movies) => {
        setSavedMovies(movies);
        setLoading(false);
      },
      (error) => {
        console.warn("Saved movies subscription error:", error.code);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleUnsave = async (movieId: number) => {
    if (!user) return;
    await unsaveMovie(user.uid, movieId);
  };

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: "#030014", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Ionicons name="lock-closed-outline" size={52} color="#AB8BFF" />
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 16, textAlign: "center" }}>
          Sign in to view saved movies
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
      <Image source={images.bg} style={{ position: "absolute", width: "100%", opacity: 0.5 }} />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: 0.3 }}>
          My Watchlist
        </Text>
        <Text style={{ color: "#A8B5DB", fontSize: 13, marginTop: 4 }}>
          {savedMovies.length} {savedMovies.length === 1 ? "movie" : "movies"} saved
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text style={{ color: "#A8B5DB", marginTop: 12 }}>Loading your watchlist...</Text>
        </View>
      ) : savedMovies.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
          <View style={{
            width: 90, height: 90, borderRadius: 45,
            backgroundColor: "rgba(171,139,255,0.12)",
            borderWidth: 1, borderColor: "rgba(171,139,255,0.25)",
            justifyContent: "center", alignItems: "center", marginBottom: 20
          }}>
            <Ionicons name="bookmark-outline" size={40} color="#AB8BFF" />
          </View>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center" }}>
            No saved movies yet
          </Text>
          <Text style={{ color: "#A8B5DB", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 }}>
            Tap the bookmark icon on any movie to add it to your watchlist
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={{
              marginTop: 24, borderRadius: 10, overflow: "hidden"
            }}
          >
            <LinearGradient
              colors={["#AB8BFF", "#7c5cbf"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 28, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="film-outline" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700" }}>Browse Movies</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedMovies}
          keyExtractor={(item) => item.movie_id.toString()}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <SavedMovieCard movie={item} onUnsave={handleUnsave} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default Saved;
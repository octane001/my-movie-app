import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMovieDetails, fetchMovieVideos } from "@/services/api";
import { icons } from "@/constants/icons";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import { useAuth } from "@/context/AuthContext";
import { saveMovie, unsaveMovie, checkIfSaved } from "@/services/addData";

const { width } = Dimensions.get("window");
const PLAYER_HEIGHT = Math.round((width - 40) * 9 / 16); // 16:9 aspect ratio

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const { data: movie, loading: movieLoading, error: movieError } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  // Trailer state
  const [trailer, setTrailer] = useState<{ key: string; name: string } | null>(null);
  const [trailerLoading, setTrailerLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Save state
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Fetch trailer once movie id is known
  useEffect(() => {
    if (!id) return;
    setTrailerLoading(true);
    setPlayerReady(false);
    fetchMovieVideos(id as string)
      .then((data) => setTrailer(data))
      .catch(() => setTrailer(null))
      .finally(() => setTrailerLoading(false));
  }, [id]);

  // Check if movie is saved
  useEffect(() => {
    if (!user || !id) return;
    checkIfSaved(user.uid, id as string).then(setSaved).catch(() => setSaved(false));
  }, [user, id]);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const handleToggleSave = async () => {
    if (!user || !movie) return;
    setSaveLoading(true);
    try {
      if (saved) {
        await unsaveMovie(user.uid, movie.id);
        setSaved(false);
      } else {
        await saveMovie(user.uid, {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path ?? "",
          vote_average: movie.vote_average,
          release_date: movie.release_date ?? "",
          adult: movie.adult,
          backdrop_path: movie.backdrop_path ?? "",
          genre_ids: [],
          original_language: movie.original_language ?? "",
          original_title: movie.original_title ?? "",
          overview: movie.overview ?? "",
          popularity: movie.popularity,
          video: false,
          vote_count: movie.vote_count,
        });
        setSaved(true);
      }
    } catch (err) {
      console.error("Toggle save error:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  if (movieLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#030014", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#AB8BFF" />
        <Text style={{ color: "#A8B5DB", marginTop: 12, fontSize: 14 }}>Loading movie...</Text>
      </View>
    );
  }

  if (movieError || !movie) {
    return (
      <View style={{ flex: 1, backgroundColor: "#030014", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Ionicons name="alert-circle-outline" size={56} color="#f87171" />
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 16, textAlign: "center" }}>
          Failed to load movie
        </Text>
        <Text style={{ color: "#A8B5DB", fontSize: 14, marginTop: 8, textAlign: "center" }}>
          {movieError?.message || "Something went wrong"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 24, backgroundColor: "#AB8BFF",
            paddingHorizontal: 28, paddingVertical: 12, borderRadius: 10
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* ── Poster with gradient overlay ── */}
        <View className="relative">
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
            className="w-full h-[550px]"
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(3,0,20,0.5)", "rgba(3,0,20,0.95)", "#030014"]}
            locations={[0, 0.45, 0.75, 1]}
            className="absolute bottom-0 left-0 right-0 h-52"
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute", top: Platform.OS === "ios" ? 56 : 40, left: 16,
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.55)",
              justifyContent: "center", alignItems: "center",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.15)"
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleToggleSave}
            disabled={saveLoading || !user}
            style={{
              position: "absolute", top: Platform.OS === "ios" ? 56 : 40, right: 16,
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: saved ? "rgba(171,139,255,0.85)" : "rgba(0,0,0,0.55)",
              justifyContent: "center", alignItems: "center",
              borderWidth: 1, borderColor: saved ? "#AB8BFF" : "rgba(255,255,255,0.15)"
            }}
          >
            {saveLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={20}
                color="#fff"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Movie Info ── */}
        <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 26, lineHeight: 32 }}>
            {movie.title}
          </Text>

          {/* Meta row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <View style={{
              backgroundColor: "rgba(171,139,255,0.2)", paddingHorizontal: 8, paddingVertical: 3,
              borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4
            }}>
              <Ionicons name="calendar-outline" size={12} color="#AB8BFF" />
              <Text style={{ color: "#AB8BFF", fontSize: 12, fontWeight: "600" }}>
                {movie.release_date?.split("-")[0] || "N/A"}
              </Text>
            </View>

            {(movie.runtime ?? 0) > 0 && (
              <View style={{
                backgroundColor: "rgba(168,181,219,0.15)", paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4
              }}>
                <Ionicons name="time-outline" size={12} color="#A8B5DB" />
                <Text style={{ color: "#A8B5DB", fontSize: 12, fontWeight: "600" }}>{movie.runtime}m</Text>
              </View>
            )}

            <View style={{
              backgroundColor: "rgba(251,191,36,0.15)", paddingHorizontal: 8, paddingVertical: 3,
              borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 4
            }}>
              <Image source={icons.star} style={{ width: 12, height: 12 }} />
              <Text style={{ color: "#fbbf24", fontSize: 12, fontWeight: "700" }}>
                {Math.round(movie.vote_average * 10) / 10}/10
              </Text>
              <Text style={{ color: "#A8B5DB", fontSize: 11 }}>({movie.vote_count?.toLocaleString()})</Text>
            </View>
          </View>

          {/* Genres */}
          {movie.genres?.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {movie.genres.map((g) => (
                <View key={g.id} style={{
                  borderWidth: 1, borderColor: "rgba(171,139,255,0.3)",
                  borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4
                }}>
                  <Text style={{ color: "#D6C6FF", fontSize: 12 }}>{g.name}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Overview */}
          <View style={{ marginTop: 18 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 8 }}>Overview</Text>
            <Text style={{ color: "#A8B5DB", lineHeight: 22, fontSize: 14 }}>
              {movie.overview || "No overview available."}
            </Text>
          </View>

          {/* ── Trailer Section ── */}
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Ionicons name="play-circle" size={22} color="#AB8BFF" />
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Official Trailer</Text>
            </View>

            {trailerLoading ? (
              <View style={{
                height: PLAYER_HEIGHT, backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 12, justifyContent: "center", alignItems: "center",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.08)"
              }}>
                <ActivityIndicator color="#AB8BFF" />
                <Text style={{ color: "#A8B5DB", marginTop: 8, fontSize: 13 }}>Loading trailer...</Text>
              </View>
            ) : trailer ? (
              <View style={{ borderRadius: 12, overflow: "hidden", backgroundColor: "#000" }}>
                {!playerReady && (
                  <View style={{
                    position: "absolute", zIndex: 1, width: "100%", height: PLAYER_HEIGHT,
                    justifyContent: "center", alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.7)"
                  }}>
                    <ActivityIndicator color="#AB8BFF" />
                  </View>
                )}
                <YoutubePlayer
                  height={PLAYER_HEIGHT}
                  width={width - 40}
                  videoId={trailer.key}
                  play={playing}
                  onChangeState={onStateChange}
                  onReady={() => setPlayerReady(true)}
                  initialPlayerParams={{
                    modestbranding: true,
                    rel: false,
                    cc_lang_pref: "en",
                    showClosedCaptions: false,
                  }}
                  webViewProps={{
                    allowsFullscreenVideo: true,
                    allowsInlineMediaPlayback: true,
                    mediaPlaybackRequiresUserAction: false,
                    javaScriptEnabled: true,
                    domStorageEnabled: true,
                    startInLoadingState: true,
                    allowsProtectedMedia: true,
                    mixedContentMode: "compatibility",
                    userAgent:
                      Platform.OS === "android"
                        ? "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                        : undefined,
                    androidLayerType: "hardware",
                    renderToHardwareTextureAndroid: true,
                  }}
                />
                {/* Play/Pause overlay button */}
                {playerReady && !playing && (
                  <TouchableOpacity
                    onPress={() => setPlaying(true)}
                    style={{
                      position: "absolute", top: 0, left: 0, right: 0,
                      height: PLAYER_HEIGHT,
                      justifyContent: "center", alignItems: "center",
                      backgroundColor: "rgba(0,0,0,0.3)",
                    }}
                  >
                    <View style={{
                      width: 60, height: 60, borderRadius: 30,
                      backgroundColor: "rgba(171,139,255,0.9)",
                      justifyContent: "center", alignItems: "center",
                    }}>
                      <Ionicons name="play" size={28} color="#fff" style={{ marginLeft: 3 }} />
                    </View>
                  </TouchableOpacity>
                )}
                <Text style={{
                  color: "#A8B5DB", fontSize: 12, padding: 10,
                  backgroundColor: "rgba(0,0,0,0.6)", textAlign: "center"
                }}>
                  {trailer.name}
                </Text>
              </View>
            ) : (
              <View style={{
                height: 160, backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 12, justifyContent: "center", alignItems: "center",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.08)"
              }}>
                <Ionicons name="videocam-off-outline" size={36} color="#4a4a6a" />
                <Text style={{ color: "#4a4a6a", marginTop: 8, fontSize: 14 }}>No trailer available</Text>
              </View>
            )}
          </View>

          {/* ── More Details ── */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16, marginBottom: 4 }}>Details</Text>
          </View>

          <MovieInfo
            label="Production Companies"
            value={movie.production_companies?.map((c) => c.name).join(" · ") || "N/A"}
          />

          {(movie.budget > 0 || movie.revenue > 0) && (
            <View style={{ flexDirection: "row", gap: 20, marginTop: 16 }}>
              {movie.budget > 0 && (
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#A8B5DB", fontSize: 13 }}>Budget</Text>
                  <Text style={{ color: "#D6C6FF", fontWeight: "700", marginTop: 4 }}>
                    ${(movie.budget / 1_000_000).toFixed(1)}M
                  </Text>
                </View>
              )}
              {movie.revenue > 0 && (
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#A8B5DB", fontSize: 13 }}>Revenue</Text>
                  <Text style={{ color: "#D6C6FF", fontWeight: "700", marginTop: 4 }}>
                    ${(movie.revenue / 1_000_000).toFixed(1)}M
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MovieDetails;
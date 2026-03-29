import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import {
  View,
  Image,
  ActivityIndicator,
  Text,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { fetchMovies } from "@/services/api";
import useFetch from "@/services/useFetch";
import MovieCard from "@/components/MovieCard";
import { subscribeToTrendingMovies } from "@/services/addData";
import TrendingCard from "@/components/TrendingCard";
import { useEffect, useState } from "react";

export default function App() {
  const router = useRouter();
  const [trendingMovies, setTrendingMovies] = useState<TrendingMovie[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToTrendingMovies(
      (movies) => {
        setTrendingMovies(movies);
        setTrendingLoading(false);
        setTrendingError(null);
      },
      (error) => {
        setTrendingLoading(false);
        setTrendingError(new Error(error.message));
      }
    );

    return () => unsubscribe();
  }, []);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() =>
    fetchMovies({
      query: '',
    })
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />

      {moviesLoading || trendingLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator
            size="large"
            color="#AB8BFF"
          />
        </View>
      ) : moviesError || trendingError ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
          <Text className="text-white text-center">
            Error: {moviesError?.message || trendingError?.message}
          </Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 16,
            paddingHorizontal: 20,
          }}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="px-5">
              <Image
                source={icons.logo}
                className="w-12 h-10 mt-20 mb-5 mx-auto"
              />

              <SearchBar
                onPress={() => router.push("/Search")}
                placeholder="Search for a movie"
              />

              {trendingMovies && trendingMovies.length > 0 && (
                <View className="mt-10">
                  <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
                </View>
              )}

              {/* Trending movies horizontal list */}
              {trendingMovies && trendingMovies.length > 0 && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="w-10 ml-2 py-10" />}
                  className="mb-4 mt-3"
                  data={trendingMovies}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                />
              )}

              <Text className="text-lg text-white font-extrabold mt-5 mb-3">
                Latest Movies
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <MovieCard
              {...item}
            />
          )}
        />
      )}
    </View>
  );
}

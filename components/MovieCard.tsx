import { icons } from "@/constants/icons";
import { Link } from "expo-router";
import { Text, TouchableOpacity, Image, View } from "react-native";
import { useState } from "react";

const FALLBACK_POSTER =
    "https://placehold.co/500x750/1a1a1a/ffffff?text=No+Image";

const MovieCard = ({
    id,
    poster_path,
    title,
    vote_average,
    release_date,
}: Movie) => {
    const [imageError, setImageError] = useState(false);

    const imageUri =
        !poster_path || imageError
            ? FALLBACK_POSTER
            : `https://image.tmdb.org/t/p/w500${poster_path}`;

    return (
        <Link href={`/movies/${id}`} asChild>
            <TouchableOpacity className="w-[30%]">
                <Image
                    source={{ uri: imageUri }}
                    className="w-full aspect-[2/3] rounded-lg bg-black"
                    resizeMode="cover"
                    onError={() => setImageError(true)}
                />

                <Text
                    className="text-sm font-bold text-white mt-2"
                    numberOfLines={1}
                >
                    {title}
                </Text>

                <View className="flex-row items-center justify-start gap-x-1">
                    <Image source={icons.star} className="size-4" />
                    <Text className="text-xs text-white font-bold uppercase">
                        {Math.round(vote_average * 10) / 10}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-light-300 font-medium mt-1">
                        {release_date?.split("-")[0]}
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    );
};

export default MovieCard;

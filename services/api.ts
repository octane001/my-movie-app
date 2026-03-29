export const TMDB_CONFIG = {
    BASE_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    },
};

export const fetchMovies = async ({ query }: { query: string }) => {
    const endPoint = query
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc`;

    const response = await fetch(endPoint, {
        method: "GET",
        headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
        // @ts-ignore
        throw new Error("Failed to fetch movies", response.statusText);
    }

    const data = await response.json();
    // make count a multiple of 3 for clean grid layout
    const results = data.results;
    const trimmedLength = Math.floor(results.length / 3) * 3;

    return results.slice(0, trimmedLength);
};

export const fetchMovieDetails = async (
    movieId: string
): Promise<MovieDetails> => {
    try {
        const endpoint = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) {
            throw new Error("Failed to fetch movie details");
        }

        const data = await response.json();
        return data as MovieDetails;
    } catch (error) {
        console.log("Error fetching movie details:", error);
        throw error;
    }
};

export const fetchMovieVideos = async (
    movieId: string | number
): Promise<{ key: string; name: string } | null> => {
    try {
        const endpoint = `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?language=en-US`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) {
            throw new Error("Failed to fetch movie videos");
        }

        const data = await response.json();
        const videos: Array<{ key: string; name: string; site: string; type: string }> =
            data.results || [];

        // Prefer official YouTube Trailer, then Teaser, then any YouTube video
        const trailer =
            videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
            videos.find((v) => v.type === "Teaser" && v.site === "YouTube") ||
            videos.find((v) => v.site === "YouTube") ||
            null;

        return trailer ? { key: trailer.key, name: trailer.name } : null;
    } catch (error) {
        console.error("Error fetching movie videos:", error);
        return null;
    }
};

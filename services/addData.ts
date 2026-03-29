import {
    collection,
    query,
    getDocs,
    updateDoc,
    increment,
    orderBy,
    limit,
    onSnapshot,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    serverTimestamp,
    FirestoreError,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// ─── Trending / Search Count ───────────────────────────────────────────────

export const updateSearchCount = async (
    searchTerm: string,
    movie: Movie
) => {
    try {
        const docRef = doc(db, "searches", movie.id.toString());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, { count: increment(1) });
        } else {
            await setDoc(docRef, {
                searchTerm,
                movie_id: movie.id,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                count: 1,
                createdAt: serverTimestamp(),
            });
        }
    } catch (error) {
        const firestoreError = error as FirestoreError;
        if (firestoreError.code === "permission-denied") {
            console.warn(
                "Firestore permission denied for updateSearchCount. Please update your Firestore security rules."
            );
        } else {
            console.error("Error updating search count:", error);
        }
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[]> => {
    try {
        const q = query(
            collection(db, "searches"),
            orderBy("count", "desc"),
            limit(10)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as TrendingMovie),
        }));
    } catch (error) {
        const firestoreError = error as FirestoreError;
        if (firestoreError.code === "permission-denied") {
            console.warn(
                "Firestore permission denied for getTrendingMovies. Please update your Firestore security rules."
            );
        } else {
            console.error("Error fetching trending movies:", error);
        }
        return [];
    }
};

export const subscribeToTrendingMovies = (
    callback: (movies: TrendingMovie[]) => void,
    onError?: (error: FirestoreError) => void
) => {
    const q = query(
        collection(db, "searches"),
        orderBy("count", "desc"),
        limit(10)
    );
    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const movies = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as TrendingMovie),
            }));
            callback(movies);
        },
        (error: FirestoreError) => {
            if (error.code === "permission-denied") {
                console.warn(
                    "Firestore permission denied for trending movies listener. Please update your Firestore security rules."
                );
            } else {
                console.error("Trending movies snapshot error:", error);
            }
            // Return empty array so the UI doesn't break
            callback([]);
            onError?.(error);
        }
    );
    return unsubscribe;
};

// ─── Saved Movies (per user) ───────────────────────────────────────────────

export interface SavedMovie {
    movie_id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    savedAt: any;
}

export const saveMovie = async (
    userId: string,
    movie: Movie
): Promise<void> => {
    try {
        const docRef = doc(db, "users", userId, "savedMovies", movie.id.toString());
        await setDoc(docRef, {
            movie_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            savedAt: serverTimestamp(),
        });
    } catch (error) {
        const firestoreError = error as FirestoreError;
        if (firestoreError.code === "permission-denied") {
            console.warn(
                "Firestore permission denied for saveMovie. Please update your Firestore security rules."
            );
        } else {
            console.error("Error saving movie:", error);
        }
        throw error;
    }
};

export const unsaveMovie = async (
    userId: string,
    movieId: number | string
): Promise<void> => {
    try {
        const docRef = doc(db, "users", userId, "savedMovies", movieId.toString());
        await deleteDoc(docRef);
    } catch (error) {
        const firestoreError = error as FirestoreError;
        if (firestoreError.code === "permission-denied") {
            console.warn(
                "Firestore permission denied for unsaveMovie. Please update your Firestore security rules."
            );
        } else {
            console.error("Error unsaving movie:", error);
        }
        throw error;
    }
};

export const checkIfSaved = async (
    userId: string,
    movieId: number | string
): Promise<boolean> => {
    try {
        const docRef = doc(db, "users", userId, "savedMovies", movieId.toString());
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        const firestoreError = error as FirestoreError;
        if (firestoreError.code === "permission-denied") {
            console.warn(
                "Firestore permission denied for checkIfSaved. Please update your Firestore security rules."
            );
        } else {
            console.error("Error checking saved status:", error);
        }
        return false;
    }
};

export const getSavedMovies = async (userId: string): Promise<SavedMovie[]> => {
    try {
        const q = query(
            collection(db, "users", userId, "savedMovies"),
            orderBy("savedAt", "desc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => doc.data() as SavedMovie);
    } catch (error) {
        const firestoreError = error as FirestoreError;
        if (firestoreError.code === "permission-denied") {
            console.warn(
                "Firestore permission denied for getSavedMovies. Please update your Firestore security rules."
            );
        } else {
            console.error("Error getting saved movies:", error);
        }
        return [];
    }
};

export const subscribeToSavedMovies = (
    userId: string,
    callback: (movies: SavedMovie[]) => void,
    onError?: (error: FirestoreError) => void
) => {
    const q = query(
        collection(db, "users", userId, "savedMovies"),
        orderBy("savedAt", "desc")
    );
    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const movies = snapshot.docs.map((doc) => doc.data() as SavedMovie);
            callback(movies);
        },
        (error: FirestoreError) => {
            if (error.code === "permission-denied") {
                console.warn(
                    "Firestore permission denied for saved movies listener. Please update your Firestore security rules."
                );
            } else {
                console.error("Saved movies snapshot error:", error);
            }
            // Return empty array so the UI doesn't break
            callback([]);
            onError?.(error);
        }
    );
    return unsubscribe;
};
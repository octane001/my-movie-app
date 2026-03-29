# 🎬 Movie App — Complete Documentation

> **Last Updated**: March 29, 2026  
> **App Name**: My Movie App  
> **Platform**: Android & iOS (React Native + Expo)  
> **Status**: Production-ready

This document explains everything about the app — how it works, how it's built, and how each part connects. If you're a new developer joining this project, read this first.

---

## Table of Contents

1. [What Does This App Do?](#1-what-does-this-app-do)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [How to Set Up the Project](#4-how-to-set-up-the-project)
5. [Environment Variables](#5-environment-variables)
6. [Screens & Navigation](#6-screens--navigation)
7. [Authentication (Login System)](#7-authentication-login-system)
8. [Movie Data (TMDB API)](#8-movie-data-tmdb-api)
9. [Firebase (Database)](#9-firebase-database)
10. [Trailer Playback](#10-trailer-playback)
11. [Components](#11-components)
12. [Services (Backend Logic)](#12-services-backend-logic)
13. [Styling](#13-styling)
14. [Building the App](#14-building-the-app)
15. [Known Limitations](#15-known-limitations)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. What Does This App Do?

This is a **movie discovery app** where users can:

- **Browse** popular and latest movies
- **Search** for any movie by name
- **View details** — poster, rating, overview, genres, budget, revenue
- **Watch trailers** — YouTube trailers play directly inside the app
- **Save movies** to a personal watchlist (bookmarks)
- **Sign up / Log in** with email and password
- **View profile** with stats and recently saved movies
- **See trending** — movies that people search for the most appear in a "Trending" section

---

## 2. Tech Stack

| Technology | Version | What It Does |
|---|---|---|
| **React Native** | 0.81.5 | Framework for building native mobile apps using JavaScript |
| **Expo** | SDK 54 | Toolkit that makes React Native easier (builds, updates, dev tools) |
| **Expo Router** | 6.x | File-based navigation — each file in `/app` folder = one screen |
| **TypeScript** | 5.9 | JavaScript with types — helps catch bugs before running the code |
| **Firebase Auth** | 12.x | Handles user signup, login, logout (email + password) |
| **Firebase Firestore** | 12.x | Cloud database — stores saved movies and search counts |
| **TMDB API** | v3 | Free movie database — provides all movie info, posters, trailers |
| **NativeWind** | 4.x | TailwindCSS for React Native — makes styling easier |
| **react-native-youtube-iframe** | 2.x | Plays YouTube videos inside the app using a WebView |
| **expo-linear-gradient** | 15.x | Creates gradient backgrounds |
| **@expo/vector-icons** (Ionicons) | 15.x | Icon library for buttons, tabs, etc. |

---

## 3. Project Structure

```
my-movie-app/
│
├── app/                          ← SCREENS (each file = a screen)
│   ├── _layout.tsx               ← Root layout — wraps everything
│   │                                • Sets up AuthProvider (login context)
│   │                                • Sets up SafeAreaProvider
│   │                                • Contains AuthGuard (redirect logic)
│   │                                • Contains StatusBar config
│   │
│   ├── login.tsx                 ← Login screen
│   │                                • Email + password inputs
│   │                                • Shows error messages
│   │                                • Links to signup
│   │
│   ├── signup.tsx                ← Signup screen
│   │                                • Name + email + password + confirm password
│   │                                • Validates all fields
│   │                                • Creates Firebase account
│   │
│   ├── (tabs)/                   ← Bottom tab navigation screens
│   │   ├── _layout.tsx           ← Tab bar configuration
│   │   │                            • 4 tabs: Home, Search, Saved, Profile
│   │   │                            • Custom tab icons with highlight effect
│   │   │
│   │   ├── index.tsx             ← HOME SCREEN
│   │   │                            • Shows trending movies (horizontal scroll)
│   │   │                            • Shows latest movies (3-column grid)
│   │   │                            • Search bar → navigates to Search tab
│   │   │
│   │   ├── Search.tsx            ← SEARCH SCREEN
│   │   │                            • Text input with debounced search (1 second delay)
│   │   │                            • Shows results in 3-column grid
│   │   │                            • Updates search count in Firestore (for trending)
│   │   │
│   │   ├── saved.tsx             ← SAVED MOVIES SCREEN
│   │   │                            • Shows user's bookmarked movies
│   │   │                            • Real-time updates (Firestore listener)
│   │   │                            • Swipe/tap to remove saved movies
│   │   │                            • Shows "Sign in" prompt if not logged in
│   │   │
│   │   └── profile.tsx           ← PROFILE SCREEN
│   │                                • Shows user name, email, avatar (initials)
│   │                                • Stats: saved count, watchlist count
│   │                                • Recently saved movies preview
│   │                                • Logout button with confirmation
│   │
│   └── movies/
│       └── [id].tsx              ← MOVIE DETAIL SCREEN (dynamic route)
│                                    • Full poster with gradient overlay
│                                    • Title, year, runtime, rating
│                                    • Genres as pill badges
│                                    • Overview text
│                                    • YouTube trailer player
│                                    • Save/unsave button
│                                    • Production companies, budget, revenue
│
├── components/                   ← REUSABLE UI PIECES
│   ├── MovieCard.tsx             ← Small movie card (poster + title + rating)
│   │                                Used in Home grid and Search results
│   │
│   ├── TrendingCard.tsx          ← Trending movie card with ranking number
│   │                                Uses MaskedView for gradient number effect
│   │
│   └── SearchBar.tsx             ← Search input with icon
│                                    Used in Home (as button) and Search (as input)
│
├── services/                     ← BACKEND LOGIC (API calls, database, auth)
│   ├── firebaseConfig.ts         ← Firebase initialization
│   │                                • Connects to Firebase project
│   │                                • Sets up Auth with AsyncStorage persistence
│   │                                • Exports `auth` and `db` objects
│   │
│   ├── auth.ts                   ← Auth functions
│   │                                • signUp(email, password, name)
│   │                                • login(email, password)
│   │                                • logout()
│   │
│   ├── api.ts                    ← TMDB API functions
│   │                                • fetchMovies({ query }) — search or discover
│   │                                • fetchMovieDetails(movieId) — full movie info
│   │                                • fetchMovieVideos(movieId) — get YouTube trailer key
│   │
│   ├── addData.ts                ← Firestore database functions
│   │                                • updateSearchCount() — increment search counter
│   │                                • getTrendingMovies() — get top 10 searched movies
│   │                                • subscribeToTrendingMovies() — real-time trending
│   │                                • saveMovie() / unsaveMovie() — bookmark system
│   │                                • checkIfSaved() — is this movie bookmarked?
│   │                                • getSavedMovies() — get all saved movies
│   │                                • subscribeToSavedMovies() — real-time watchlist
│   │
│   └── useFetch.ts               ← Custom React hook for API calls
│                                    • Manages loading, error, data states
│                                    • Auto-fetches on mount (optional)
│                                    • Provides refetch() and reset() functions
│
├── context/
│   └── AuthContext.tsx            ← AUTHENTICATION CONTEXT
│                                    • Wraps the whole app
│                                    • Provides `user` and `loading` to all screens
│                                    • Listens to Firebase auth state changes
│                                    • When user logs in/out, all screens update
│
├── constants/
│   ├── icons.ts                  ← Icon image imports (home, search, star, etc.)
│   └── images.ts                 ← Background and decorative image imports
│
├── interfaces/
│   └── interfaces.d.ts           ← TypeScript type definitions
│                                    • Movie — basic movie data from TMDB
│                                    • TrendingMovie — movie in trending list
│                                    • MovieDetails — full movie info from TMDB
│                                    • TrendingCardProps — props for TrendingCard
│
├── .env                          ← Secret keys (DO NOT SHARE)
├── app.json                      ← Expo app configuration
├── eas.json                      ← EAS Build configuration
├── package.json                  ← Dependencies list
├── tailwind.config.js            ← NativeWind/Tailwind CSS config
└── tsconfig.json                 ← TypeScript configuration
```

---

## 4. How to Set Up the Project

### For a new developer joining the project:

```bash
# 1. Clone the repository
git clone <repo-url>
cd my-movie-app

# 2. Install dependencies
npm install

# 3. Create .env file (ask the project owner for keys)
# See "Environment Variables" section below

# 4. Start the development server
npx expo start

# 5. Scan the QR code with Expo Go app on your phone
#    OR press 'a' to open Android emulator
```

### Requirements:
- **Node.js** 18 or higher
- **npm** or **yarn**
- **Expo Go** app on your phone (for testing)
- **Android Studio** (optional, for emulator)

---

## 5. Environment Variables

The app needs these secret keys in a `.env` file at the project root:

```env
# TMDB API Key (get from https://www.themoviedb.org/settings/api)
EXPO_PUBLIC_MOVIE_API_KEY='your_tmdb_bearer_token_here'

# Firebase Config (get from Firebase Console → Project Settings)
FIRE_BASE_API_KEY="your_firebase_api_key"
FIRE_BASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIRE_BASE_PROJECT_ID="your-project-id"
FIRE_BASE_STORAGE_BUCKET="your-project.firebasestorage.app"
FIRE_BASE_MESSAGING_SENDER_ID="your_sender_id"
FIRE_BASE_APP_ID="your_app_id"
```

> ⚠️ **Important**: The Firebase config is currently hardcoded in `services/firebaseConfig.ts` (not reading from .env). If you change Firebase projects, update that file directly.

> ⚠️ **Never commit `.env` to git**. It's already in `.gitignore`.

---

## 6. Screens & Navigation

### Navigation Structure

```
Root Layout (_layout.tsx)
├── /login              ← Login screen (no tabs)
├── /signup             ← Signup screen (no tabs)
├── /(tabs)             ← Tab navigator
│   ├── /               ← Home (index.tsx)
│   ├── /Search         ← Search
│   ├── /saved          ← Saved movies
│   └── /profile        ← Profile
└── /movies/[id]        ← Movie detail (no tabs, full screen)
```

### How Navigation Works

1. **Expo Router** uses file-based routing — the file path = the URL path
2. `(tabs)` folder creates a bottom tab navigator automatically
3. `[id].tsx` is a **dynamic route** — `/movies/123` shows movie with ID 123
4. `_layout.tsx` files configure the navigator for their folder

### Auth Flow

```
App Opens → AuthContext checks Firebase
  ↓
  Is user logged in?
  ├── YES → Show (tabs) screens
  └── NO  → Redirect to /login
  
  User signs up/logs in → Firebase returns user
  → AuthContext updates → AuthGuard redirects to /(tabs)
  
  User logs out → Firebase clears session
  → AuthContext updates → AuthGuard redirects to /login
```

---

## 7. Authentication (Login System)

### How it works:

1. **Firebase Auth** handles everything — we don't store passwords ourselves
2. Uses **email + password** authentication
3. User sessions persist using **AsyncStorage** (stays logged in after closing app)

### Key Files:
- `services/auth.ts` — signUp, login, logout functions
- `services/firebaseConfig.ts` — Firebase connection setup
- `context/AuthContext.tsx` — shares user state across all screens
- `app/_layout.tsx` — AuthGuard handles redirects

### Sign Up Flow:
```
User fills form → signUp(email, password, name)
  → Firebase creates account
  → updateProfile() sets display name
  → AuthContext detects new user
  → AuthGuard redirects to Home
```

### Login Flow:
```
User fills form → login(email, password)
  → Firebase verifies credentials
  → AuthContext detects user
  → AuthGuard redirects to Home
```

### Logout Flow:
```
User taps "Sign Out" → Alert confirmation
  → logout() calls Firebase signOut
  → AuthContext detects no user
  → AuthGuard redirects to Login
```

---

## 8. Movie Data (TMDB API)

### What is TMDB?
[The Movie Database (TMDB)](https://www.themoviedb.org/) is a free API that provides movie information, posters, trailers, and more.

### API Endpoints Used:

| Endpoint | What it returns | Used in |
|---|---|---|
| `GET /discover/movie?sort_by=popularity.desc` | Popular movies list | Home screen |
| `GET /search/movie?query=batman` | Search results | Search screen |
| `GET /movie/{id}` | Full movie details | Movie detail screen |
| `GET /movie/{id}/videos` | YouTube trailer keys | Movie detail screen |

### How API Calls Work:

```
api.ts has functions → useFetch hook calls them → component gets data

Example:
  fetchMovies({ query: "batman" })
    → Calls TMDB search endpoint
    → Returns array of Movie objects
    → useFetch provides { data, loading, error }
    → Component renders the data
```

### Authentication:
- TMDB uses a **Bearer token** in the Authorization header
- Token is stored in `.env` as `EXPO_PUBLIC_MOVIE_API_KEY`
- All requests include: `Authorization: Bearer <token>`

### Image URLs:
- TMDB returns image paths like `/abc123.jpg`
- Full URL: `https://image.tmdb.org/t/p/w500/abc123.jpg`
- `w500` = width 500px. Other sizes: `w200`, `w300`, `w780`, `original`

---

## 9. Firebase (Database)

### Firebase Services Used:

| Service | Purpose |
|---|---|
| **Firebase Auth** | User accounts (signup, login, logout) |
| **Cloud Firestore** | Database for saved movies and trending data |

### Firestore Database Structure:

```
firestore/
├── searches/                          ← Trending movie data
│   ├── {movie_id}/                    ← Document per movie
│   │   ├── searchTerm: "batman"       ← What was searched
│   │   ├── movie_id: 123             ← TMDB movie ID
│   │   ├── title: "Batman Begins"    ← Movie title
│   │   ├── poster_url: "https://..." ← Full poster URL
│   │   ├── count: 15                 ← How many times searched
│   │   └── createdAt: timestamp      ← When first searched
│   │
│   └── {another_movie_id}/...
│
└── users/                             ← Per-user data
    └── {userId}/
        └── savedMovies/               ← User's bookmarked movies
            ├── {movie_id}/
            │   ├── movie_id: 456
            │   ├── title: "Inception"
            │   ├── poster_path: "/abc.jpg"
            │   ├── vote_average: 8.4
            │   ├── release_date: "2010-07-16"
            │   └── savedAt: timestamp
            │
            └── {another_movie_id}/...
```

### Firestore Security Rules:

These rules control who can read/write data. Set them in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read trending searches, only logged-in users can write
    match /searches/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Users can only access their own saved movies
    match /users/{userId}/savedMovies/{movieId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Real-time Updates:

The app uses Firestore's `onSnapshot` for real-time data:
- **Trending movies** on Home screen update live when anyone searches
- **Saved movies** on Saved screen update instantly when you save/unsave

---

## 10. Trailer Playback

### How Trailers Work:

```
1. User opens movie detail page
2. App calls TMDB: GET /movie/{id}/videos
3. TMDB returns list of videos (trailers, teasers, clips)
4. App picks the best one:
   - First: Official YouTube Trailer
   - Then: YouTube Teaser
   - Then: Any YouTube video
5. Gets the YouTube video key (e.g., "dQw4w9WgXcQ")
6. react-native-youtube-iframe renders the video using WebView
```

### Key Configuration (why video works, not just audio):

The YouTube player needs specific WebView settings to show video properly:

```typescript
webViewProps={{
  allowsInlineMediaPlayback: true,       // Show video inline (not fullscreen only)
  mediaPlaybackRequiresUserAction: false, // Allow auto-play
  javaScriptEnabled: true,               // YouTube needs JavaScript
  domStorageEnabled: true,               // YouTube needs localStorage
  allowsProtectedMedia: true,            // For DRM content
  androidLayerType: "hardware",          // Hardware-accelerated rendering
  userAgent: "Chrome mobile UA",         // Prevents YouTube from serving audio-only
}}
```

> **Without these settings**, YouTube may serve audio-only streams, especially on Android.

---

## 11. Components

### MovieCard.tsx
- **Used in**: Home screen grid, Search results grid
- **Props**: Takes a `Movie` object (id, poster_path, title, vote_average, release_date)
- **Features**: Poster image with fallback, rating star, release year
- **Navigation**: Tapping navigates to `/movies/{id}`

### TrendingCard.tsx
- **Used in**: Home screen trending section (horizontal scroll)
- **Props**: `TrendingMovie` + `index` (for ranking number)
- **Features**: Poster with large gradient ranking number (1, 2, 3...) using MaskedView
- **Navigation**: Tapping navigates to `/movies/{movie_id}`

### SearchBar.tsx
- **Used in**: Home screen (as a button to navigate to Search), Search screen (as actual input)
- **Props**: `placeholder`, `onPress`, `onChangeText`, `value`
- **Dual purpose**: Acts as button (onPress) or input (onChangeText + value)

---

## 12. Services (Backend Logic)

### firebaseConfig.ts
- Initializes Firebase app (only once — handles hot-reload)
- Sets up Firebase Auth with AsyncStorage persistence
- Exports `auth` (for login) and `db` (for Firestore)

### auth.ts
- `signUp(email, password, name)` → Creates account + sets display name
- `login(email, password)` → Signs in with credentials
- `logout()` → Signs out current user

### api.ts
- `fetchMovies({ query })` → If query is empty, fetches popular movies. If query has text, searches TMDB
- `fetchMovieDetails(id)` → Gets full movie info (runtime, genres, budget, etc.)
- `fetchMovieVideos(id)` → Gets YouTube trailer key for the movie

### addData.ts
- `updateSearchCount(term, movie)` → Increments search count for trending
- `getTrendingMovies()` → Gets top 10 most-searched movies
- `subscribeToTrendingMovies(callback)` → Real-time trending listener
- `saveMovie(userId, movie)` → Saves movie to user's watchlist
- `unsaveMovie(userId, movieId)` → Removes from watchlist
- `checkIfSaved(userId, movieId)` → Returns true/false
- `getSavedMovies(userId)` → Gets all saved movies
- `subscribeToSavedMovies(userId, callback)` → Real-time watchlist listener

All Firestore functions have **error handling** — they catch `permission-denied` errors and log clear warnings instead of crashing the app.

### useFetch.ts
- Custom React hook that wraps any async function
- Returns `{ data, loading, error, refetch, reset }`
- Auto-fetches on component mount (optional)
- Used by Home screen and Movie detail screen

---

## 13. Styling

### Approach: NativeWind (TailwindCSS for React Native)

Most components use **NativeWind class names** for styling:
```jsx
<View className="flex-1 bg-primary px-5">
<Text className="text-white font-bold text-lg">
```

Some components use **inline styles** for dynamic values:
```jsx
<View style={{ backgroundColor: "rgba(171,139,255,0.2)", borderRadius: 12 }}>
```

### Color Palette:

| Color | Hex | Used for |
|---|---|---|
| Primary (background) | `#030014` | Main app background |
| Secondary (dark) | `#0f0D23` | Tab bar, cards |
| Accent (purple) | `#AB8BFF` | Buttons, highlights, active states |
| Light text | `#fff` | Titles, headings |
| Muted text | `#A8B5DB` | Subtitles, descriptions |
| Rating gold | `#fbbf24` | Star ratings |
| Error red | `#f87171` | Error messages, logout button |

### Tailwind Config:
Custom colors and fonts are defined in `tailwind.config.js`.

---

## 14. Building the App

### Development (Testing):
```bash
npx expo start          # Start dev server (same WiFi)
npx expo start --tunnel # Start with tunnel (any network)
```

### Build APK (Android):
```bash
eas build -p android --profile preview
```
This creates a downloadable `.apk` file via Expo's cloud build service.

### Build for Production (Play Store):
```bash
eas build -p android --profile production
```
This creates an `.aab` (Android App Bundle) for Google Play Store.

### Build for iOS:
```bash
eas build -p ios --profile production
```
Requires an Apple Developer account ($99/year).

---

## 15. Known Limitations

1. **Firebase config is hardcoded** — The Firebase API keys are in `firebaseConfig.ts` instead of reading from `.env`. This works but isn't ideal for multiple environments.

2. **No offline support** — App requires internet to load movies. Cached data is not stored locally.

3. **No pagination** — Home screen loads all movies at once. For very large lists, infinite scroll with pagination should be added.

4. **SafeAreaView warning** — A deprecation warning from a library dependency (not our code) may appear in development. Safe to ignore.

5. **No image caching** — Movie posters are re-downloaded each time. `expo-image` (already installed) supports caching but it's not fully utilized.

6. **Search is client-debounced only** — No server-side rate limiting on TMDB API calls.

---

## 16. Troubleshooting

### "Firebase permission denied" error
→ Update Firestore Security Rules in Firebase Console (see Section 9)

### App shows blank white screen
→ Run `npx expo start --clear` to clear the cache

### Trailer plays audio only (no video)
→ This was fixed. The WebView props in `[id].tsx` enable hardware video rendering. If it happens again, check that `react-native-youtube-iframe` and `react-native-webview` are up to date.

### "Module not found" error
→ Run `npm install` then restart the dev server

### Hot reload not working
→ Shake your phone and tap "Reload" in the Expo dev menu

### Build fails on EAS
→ Check that `eas.json` has the correct profile and run `eas build` with `--clear-cache`

---

## Quick Reference Card

| Need to... | File to edit |
|---|---|
| Change app colors/theme | `tailwind.config.js` + component styles |
| Add a new screen | Create file in `app/` folder |
| Add a new tab | Add file in `app/(tabs)/` + update `_layout.tsx` |
| Change TMDB API key | `.env` file |
| Change Firebase project | `services/firebaseConfig.ts` |
| Add new Firestore data | `services/addData.ts` |
| Change auth logic | `services/auth.ts` + `context/AuthContext.tsx` |
| Add new component | Create file in `components/` |
| Change tab icons | `constants/icons.ts` + `app/(tabs)/_layout.tsx` |
| Change app name/icon | `app.json` |

---

*Built with ❤️ using React Native + Expo*

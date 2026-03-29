import { View, Text, Image, FlatList, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import { images } from '@/constants/images'
import { fetchMovies } from '@/services/api';
import MovieCard from '@/components/MovieCard';
import { icons } from '@/constants/icons';
import SearchBar from '@/components/SearchBar';
import { updateSearchCount } from '@/services/addData';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState<Movie[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const lastSearchedQuery = useRef('')

  const loadMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setMovies(null);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const results = await fetchMovies({ query });
      setMovies(results);
      lastSearchedQuery.current = query;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to search movies"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadMovies(searchQuery);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadMovies]);

  // Update search count when results arrive
  useEffect(() => {
    if (
      lastSearchedQuery.current.trim() &&
      movies &&
      movies.length > 0
    ) {
      updateSearchCount(lastSearchedQuery.current, movies[0]);
    }
  }, [movies]);

  return (
    <View className='flex-1 bg-primary'>
      <Image source={images.bg} className=' flex-1 absolute w-full z-0' />
      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard{...item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        className='px-5'
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
        contentContainerStyle={
          { paddingBottom: 100 }
        }
        ListHeaderComponent={
          <>
            <View className='w-full flex-row justify-center mt-20 items-center'>
              <Image source={icons.logo} className='w-12 h-10' />
            </View>
            <View className='my-5 mt-10'>
              <SearchBar placeholder='Search movies...'
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {loading && (
              <ActivityIndicator size='large' color='#AB8BFF' className='my-3' />
            )}
            {error && (
              <Text className='text-red-500 px-5 my-3'>Error: {error.message}</Text>
            )}
            {!loading && !error && searchQuery.trim() && movies && movies.length > 0 && (
              <Text className='text-xl text-white font-bold mb-4'>Search Results for{' '}
                <Text className='text-accent'>{searchQuery.trim()}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className='mt-10 px-5'>
              <Text className='text-center text-gray-500'>
                {searchQuery.trim() ? 'No movies found' : 'Search for a movie'}
              </Text>
            </View>
          ) : null
        }
      >

      </FlatList>
    </View>
  )
}

export default Search
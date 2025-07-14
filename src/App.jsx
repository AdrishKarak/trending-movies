import { useEffect, useState } from 'react';
import Search from './components/search.jsx';
import Loading from "./components/loading.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_KEY = import.meta.env.VITE_API_KEY;

const DISCOVER_URL = 'https://api.themoviedb.org/3/discover/movie';
const SEARCH_URL = 'https://api.themoviedb.org/3/search/movie';

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4MWUwODljMGU1NjI0NjQwZGZmY2E4NGJlNzM3MmY4NCIsIm5iZiI6MTc1MjM4NDkyNC42LCJzdWIiOiI2ODczNDU5Y2Q0ODlhOWMzMmE1NDIzMjYiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2cVGOIUhukr7-JKJ6SqrHIwA9JZfjGktTtrAu8YTkRY'
    }
};
// console.log("API Key:", API_KEY);

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList    , setMovieList    ] = useState([]);
    const [isLoading   , setIsLoading   ] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const [trendingMovies, setTrendingMovies] = useState([]);

    const fetchMovies = async (query='') => {
        // console.log("fetchMovies called");
        setIsLoading(true);
        setErrorMessage('');
        try {
            const endpoint = query
                ? `${SEARCH_URL}?query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`
                : `${DISCOVER_URL}?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }
            const data = await response.json();

            if(data.Response === "False") {
                setErrorMessage(data.Error || 'Something went wrong. Try again later.');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if(query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.log(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main
            className="bg-cover bg-center h-screen"
            style={{ backgroundImage: "url('./BG.png')" }}
        >
            <div className="pattern" />

            <div className="wrapper">
                <header>
                    <div className="flex justify-center">
                        <img src="./logo.png" alt="logo" className="w-20 h-20" />
                    </div>
                    <img src="./hero-img.png" alt="hero banner" />
                    <h1>
                        Find <span className="text-gradient">movies</span> you <span className="text-gradient">enjoy</span> without
                        <span className="text-gradient"> Hassle</span>
                    </h1>
                    <Search searchterm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2 className="mt-[40px]">All movies</h2>
                    {isLoading ? (

                        <Loading/>

                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                               <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}

export default App;



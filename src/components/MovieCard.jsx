import React, { useEffect, useState } from 'react'

const MovieCard = ({ movie: { id, title, vote_average, poster_path, release_date, original_language } }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(true);
  const [trailerError, setTrailerError] = useState(false);

  useEffect(() => {
    async function fetchTrailer() {
      setLoadingTrailer(true);
      setTrailerError(false);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        console.log('TMDB API Key:', apiKey);
        console.log('Movie ID:', id);
        
        if (!apiKey || apiKey === 'VITE_TMDB_API_KEY') {
          console.error('API key not configured properly');
          setTrailerError(true);
          setLoadingTrailer(false);
          return;
        }
        
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/videos`,
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${apiKey}`
            }
          }
        );
        console.log('API Response status:', res.status);
        
        const data = await res.json();
        console.log('API Response data:', data);
        
        const trailer = data.results?.find(
          (vid) => vid.type === 'Trailer' && vid.site === 'YouTube'
        );
        console.log('Found trailer:', trailer);
        
        if (trailer) {
          setTrailerKey(trailer.key);
        } else {
          setTrailerKey(null);
        }
      } catch (err) {
        console.error('Error fetching trailer:', err);
        setTrailerError(true);
      } finally {
        setLoadingTrailer(false);
      }
    }
    if (id) fetchTrailer();
  }, [id]);

  return (
    <div className="movie-card">
      <img
        src={poster_path ?
          `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
        alt={title}
        style={{ width: '200px', borderRadius: '8px' }}
      />

      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">
            {release_date ? release_date.split('-')[0] : 'N/A'}
          </p>
        </div>
        <div className="trailer-section" style={{ marginTop: '1rem' }}>
          {loadingTrailer && <p>Loading trailer...</p>}
          {trailerError && <p style={{ color: 'red' }}>Trailer unavailable.</p>}
          {trailerKey && !loadingTrailer && !trailerError && (
            <iframe
              width="100%"
              height="215"
              src={`https://www.youtube.com/embed/${trailerKey}`}
              title="YouTube trailer"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ borderRadius: '8px', marginTop: '0.5rem' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
export default MovieCard

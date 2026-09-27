import "./movie-card.css";
import type { Movie } from "../types/movie";

interface MovieCardProps {
    movie: Movie;
    onToggleBookmark: (movieId: number) => void;
}

export default function MovieCard({movie,onToggleBookmark,}: MovieCardProps) {
    return(
        <article className="movie-card">
            <div className="poster-wrapper">
                <img className="movie-poster" src={movie.posterPath} alt={`${movie.title} 포스터`}/>
                <button className={`bookmark-button ${movie.isBookmarked ? "active" : ""}`} onClick={() => onToggleBookmark(movie.id)}>
                    <img src={movie.isBookmarked? "/icons/movie-icons/bookmark.svg": "/icons/movie-icons/bookmark-outline.svg"} alt="북마크"/>
                </button>
            </div>
            <h2 className="movie-title">{movie.title}</h2>
            <p className="movie-date">{movie.releaseDate}</p>
        </article>
    );

}
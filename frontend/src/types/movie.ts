// Display models for each screen; API response models live in api/movies/models.ts.
export interface MovieListItem {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
}

export interface MovieSearchItem extends MovieListItem {
  originalTitle: string;
  overview: string;
}

export interface MovieDetail extends MovieSearchItem {
  backdropPath: string;
  genres: string[];
  runtime: string;
  tagline: string;
}

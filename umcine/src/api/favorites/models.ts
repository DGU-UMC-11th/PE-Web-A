// dto/FavoriteResponse.java
export interface Favorite {
  favoriteId: number;
  movieId: number;
  createdAt: string;
}

// dto/FavoriteStatusResponse.java
export interface FavoriteStatus {
  isFavorite: boolean;
}

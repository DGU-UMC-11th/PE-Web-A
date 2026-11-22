package com.umc.movie.dto;
import com.umc.movie.entity.Favorite;
import java.time.LocalDateTime;

public record FavoriteResponse(Long favoriteId, Long movieId, LocalDateTime createdAt) {
    /** 엔티티에서 공개할 즐겨찾기 정보만 꺼낸다. */
    public static FavoriteResponse from(Favorite favorite) {
        return new FavoriteResponse(favorite.getFavoriteId(), favorite.getMovieId(), favorite.getCreatedAt());
    }
}

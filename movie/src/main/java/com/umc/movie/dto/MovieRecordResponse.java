// src/main/java/com/umc/movie/dto/MovieRecordResponse.java
package com.umc.movie.dto;

// addToFavorites가 false면 favorite은 null로 나갑니다
public record MovieRecordResponse(
        RatingResponse rating,
        FavoriteResponse favorite
) {}

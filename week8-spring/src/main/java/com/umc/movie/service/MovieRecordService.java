package com.umc.movie.service;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.CreateMovieRecordRequest;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.dto.MovieRecordResponse;
import com.umc.movie.dto.RatingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovieRecordService {

    private final RatingService ratingService;
    private final FavoriteService favoriteService;

    @Transactional
    public MovieRecordResponse create(Long memberId, CreateMovieRecordRequest request) {
        RatingResponse rating = ratingService.create(
                memberId, new CreateRatingRequest(request.movieId(), request.score(), request.comment()));

        FavoriteResponse favorite = null;
        if (request.addToFavorites()) {
            favorite = favoriteService.create(memberId, new CreateFavoriteRequest(request.movieId()));
        }

        return new MovieRecordResponse(rating, favorite);
    }
}

package com.umc.movie.service;

import com.umc.movie.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MovieRecordService {
    private final RatingService ratingService;
    private final FavoriteService favoriteService;

    /** 두 서비스의 저장이 같은 트랜잭션에 참여한다. 후속 저장이 실패하면 먼저 저장한 평점도 롤백한다. */
    @Transactional
    public MovieRecordResponse create(Long memberId, CreateMovieRecordRequest request) {
        RatingResponse rating = ratingService.create(memberId,
                new CreateRatingRequest(request.movieId(), request.score(), request.comment()));
        FavoriteResponse favorite = null;
        if (request.addToFavorites()) {
            favorite = favoriteService.create(memberId, new CreateFavoriteRequest(request.movieId()));
        }
        return new MovieRecordResponse(rating, favorite);
    }
}

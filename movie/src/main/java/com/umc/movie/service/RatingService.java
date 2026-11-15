
package com.umc.movie.service;

import com.umc.movie.dto.RatingResponse;
import com.umc.movie.dto.RatingPageResponse;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.UpdateRatingRequest;

import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;

import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final MemberRepository memberRepository;

    // 5주차: 회원별 평점 조회 및 페이징 (기존 기능 유지)
    @Transactional(readOnly = true)
    public RatingPageResponse getRatingsByMember(
            Long memberId,
            int page,
            int size
    ) {
        if (!memberRepository.existsById(memberId)) {
            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "MEMBER404_1",
                    "해당 회원을 찾을 수 없습니다."
            );
        }

        var ratings = ratingRepository
                .findByMember_MemberIdOrderByRatingIdDesc(
                        memberId,
                        PageRequest.of(page, size)
                )
                .map(RatingResponse::from);

        return new RatingPageResponse(
                ratings.getContent(),
                ratings.getNumber(),
                ratings.getSize(),
                ratings.getTotalElements(),
                ratings.getTotalPages(),
                ratings.isFirst(),
                ratings.isLast()
        );
    }

    // 7주차: JWT 기반 평점 등록
    @Transactional
    public RatingResponse create(
            Long memberId,
            CreateRatingRequest request
    ) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "MEMBER404_1",
                        "해당 회원을 찾을 수 없습니다."
                ));

        // 같은 회원이 같은 영화에 평점을 남겼는지 확인
        if (ratingRepository.existsByMember_MemberIdAndMovieId(
                memberId,
                request.movieId()
        )) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "RATING409_1",
                    "이미 이 영화에 평점을 남기셨습니다."
            );
        }

        // 평점 객체 생성
        Rating rating = Rating.builder()
                .member(member)
                .movieId(request.movieId())
                .score(request.score())
                .comment(request.comment())
                .build();

        // DB 저장 후 RatingResponse 전체 반환
        Rating savedRating = ratingRepository.save(rating);

        return RatingResponse.from(savedRating);
    }

    // 7주차: JWT 기반 평점 수정
    @Transactional
    public RatingResponse update(
            Long memberId,
            Long ratingId,
            UpdateRatingRequest request
    ) {
        Rating rating = findOwnedRating(memberId, ratingId);

        rating.update(
                request.score(),
                request.comment()
        );

        ratingRepository.save(rating);

        return RatingResponse.from(rating);
    }

    // 7주차: JWT 기반 평점 삭제
    @Transactional
    public void delete(Long memberId, Long ratingId) {
        Rating rating = findOwnedRating(memberId, ratingId);

        ratingRepository.delete(rating);
    }

    // 7주차: 평점 존재 여부 및 작성자 소유권 검증
    private Rating findOwnedRating(
            Long memberId,
            Long ratingId
    ) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "RATING404_1",
                        "해당 평점을 찾을 수 없습니다."
                ));

        if (!rating.getMember().getMemberId().equals(memberId)) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "RATING403_1",
                    "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다."
            );
        }

        return rating;
    }
}

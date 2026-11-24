package com.umc.movie.service;

import com.umc.movie.dto.*;
import com.umc.movie.entity.*;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {
    private final RatingRepository ratingRepository;
    private final MemberRepository memberRepository;

    /** 공개 평점 목록을 최신 등록순으로 조회한다. */
    @Transactional(readOnly = true)
    public List<RatingResponse> getRatingsByMember(Long memberId) {
        if (!memberRepository.existsById(memberId)) throw new ApiException(HttpStatus.NOT_FOUND, "MEMBER404_1", "해당 회원을 찾을 수 없습니다.");
        return ratingRepository.findByMember_MemberIdOrderByRatingIdDesc(memberId).stream().map(RatingResponse::from).toList();
    }

    /** 토큰의 회원에게 평점을 등록한다. 동시 중복은 DB 제약으로 방지한다. */
    @Transactional
    public RatingResponse create(Long memberId, CreateRatingRequest request) {
        Member member = memberRepository.findById(memberId).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "MEMBER404_1", "해당 회원을 찾을 수 없습니다."));
        if (ratingRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
            throw new ApiException(HttpStatus.CONFLICT, "RATING409_1", "이미 이 영화에 평점을 남기셨습니다.");
        }
        return RatingResponse.from(ratingRepository.saveAndFlush(new Rating(member, request.movieId(), request.score(), request.comment())));
    }

    /** 본인 평점의 별점과 후기를 교체한다. 후기를 생략하면 기존 후기를 지운다. */
    @Transactional
    public RatingResponse update(Long memberId, Long ratingId, UpdateRatingRequest request) {
        Rating rating = findOwnedRating(memberId, ratingId);
        rating.update(request.score(), request.comment());
        ratingRepository.flush();
        return RatingResponse.from(rating);
    }

    /** 소유권을 확인하고 본인의 평점을 삭제한다. */
    @Transactional
    public void delete(Long memberId, Long ratingId) {
        ratingRepository.delete(findOwnedRating(memberId, ratingId));
    }

    /** 존재하지 않는 평점과 다른 회원의 평점을 구분한다. */
    private Rating findOwnedRating(Long memberId, Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "RATING404_1", "해당 평점을 찾을 수 없습니다."));
        if (!rating.getMember().getMemberId().equals(memberId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "RATING403_1", "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
        }
        return rating;
    }
}

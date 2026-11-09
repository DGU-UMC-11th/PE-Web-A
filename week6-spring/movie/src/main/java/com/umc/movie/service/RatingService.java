package com.umc.movie.service;

import com.umc.movie.dto.RatingResponse;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.exception.ConflictException;
import com.umc.movie.exception.IntegrityViolationClassifier;
import org.springframework.dao.DataIntegrityViolationException;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import com.umc.movie.exception.ResourceNotFoundException;
import com.umc.movie.exception.RatingOwnershipException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final MemberRepository memberRepository;

    /** 회원 존재 여부를 확인하고 최신 등록순 평점 DTO 목록을 반환한다. */
    @Transactional(readOnly = true)
    public List<RatingResponse> getRatingsByMember(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException( "존재하지 않는 유저입니다.");
        }

        return ratingRepository.findByMember_MemberIdOrderByRatingIdDesc(memberId).stream()
                .map(RatingResponse::from)
                .toList();
    }

    /** 회원과 중복 평점을 확인하고 저장한 평점 ID를 반환한다. */
    @Transactional
    public Long create(Long memberId, CreateRatingRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException( "존재하지 않는 유저입니다."));
        if (ratingRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
            throw new ConflictException("RATING4091", "이미 이 영화에 평점을 남기셨습니다.");
        }
        try {
            return ratingRepository.saveAndFlush(new Rating(member, request.movieId(), request.score(), request.comment())).getRatingId();
        } catch (DataIntegrityViolationException ex) {
            // 실패한 트랜잭션에서 추가 DB 작업 없이 런타임 예외를 다시 던져 롤백한다.
            if (IntegrityViolationClassifier.isDuplicateRating(ex)) {
                throw new ConflictException("RATING4091", "이미 이 영화에 평점을 남기셨습니다.", ex);
            }
            throw ex;
        }
    }

    /** 별점과 후기를 교체하며 null 후기는 기존 후기를 지운다. */
    @Transactional
    public void update(Long ratingId, Long memberId, UpdateRatingRequest request) {
        Rating rating = findOwnedRating(ratingId, memberId);
        rating.update(request.score(), request.comment());
    }

    /** 평점 존재 여부와 소유권을 확인한 뒤 삭제한다. */
    @Transactional
    public void delete(Long ratingId, Long memberId) {
        ratingRepository.delete(findOwnedRating(ratingId, memberId));
    }

    /** 평점이 없으면 조회 실패, 소유자가 다르면 권한 오류를 발생시킨다. */
    private Rating findOwnedRating(Long ratingId, Long memberId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException( "존재하지 않는 평점입니다."));
        if (!rating.getMember().getMemberId().equals(memberId)) {
            throw new RatingOwnershipException( "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.");
        }
        return rating;
    }
}

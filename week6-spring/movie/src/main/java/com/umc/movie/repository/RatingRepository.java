package com.umc.movie.repository;

import com.umc.movie.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    /** 회원의 평점을 ID 내림차순으로 조회한다. */
    List<Rating> findByMember_MemberIdOrderByRatingIdDesc(Long memberId);
    /** 회원과 영화 조합으로 이미 등록된 평점이 있는지 조회한다. */
    boolean existsByMember_MemberIdAndMovieId(Long memberId, Long movieId);
}

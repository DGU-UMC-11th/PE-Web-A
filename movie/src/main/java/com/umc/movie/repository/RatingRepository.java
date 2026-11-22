package com.umc.movie.repository;

import com.umc.movie.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    // 5주차: 회원별 평점, 최신순
    List<Rating> findByMember_MemberIdOrderByRatingIdDesc(Long memberId);

    // 6주차: 이 회원이 이 영화에 평점을 이미 남겼나?
    boolean existsByMember_MemberIdAndMovieId(Long memberId, Long movieId);
}
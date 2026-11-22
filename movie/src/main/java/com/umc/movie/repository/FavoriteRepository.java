package com.umc.movie.repository;

import com.umc.movie.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByMemberIdOrderByFavoriteIdDesc(Long memberId);
    boolean existsByMemberIdAndMovieId(Long memberId, Long movieId);

    @Modifying
    @Query("delete from Favorite f where f.memberId = :memberId and f.movieId = :movieId")
    void deleteByMemberIdAndMovieId(Long memberId, Long movieId);
}

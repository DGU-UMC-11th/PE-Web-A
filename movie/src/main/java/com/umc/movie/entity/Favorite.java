package com.umc.movie.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "favorite", uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "movie_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Favorite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favorite_id")
    private Long favoriteId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    public Favorite(Long memberId, Long movieId) {
        this.memberId = memberId;
        this.movieId = movieId;
    }
}

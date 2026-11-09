package com.umc.movie.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rating", uniqueConstraints = @UniqueConstraint(name = "uk_rating_member_movie", columnNames = {"member_id", "movie_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Rating extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rating_id")
    private Long ratingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.TINYINT)
    @Column(nullable = false, columnDefinition = "TINYINT")
    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String comment;
    /** 회원과 TMDB 영화 ID를 연결한 새 평점을 생성한다. */
    public Rating(Member member, Long movieId, Integer score, String comment) {
        this.member = member;
        this.movieId = movieId;
        this.score = score;
        this.comment = comment;
    }

    /** 별점과 후기를 교체하며 null 후기는 기존 후기를 지운다. */
    public void update(Integer score, String comment) {
        this.score = score;
        this.comment = comment;
    }
}

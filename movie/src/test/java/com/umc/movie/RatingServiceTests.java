package com.umc.movie;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.*;
import com.umc.movie.service.RatingService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class RatingServiceTests {
    @Test void repositoryReceivesPagination() {
        var members = mock(MemberRepository.class);
        var ratings = mock(RatingRepository.class);
        when(members.existsById(1L)).thenReturn(true);
        when(ratings.findByMember_MemberIdOrderByRatingIdDesc(1L, PageRequest.of(1, 2)))
                .thenReturn(Page.empty(PageRequest.of(1, 2)));
        var result = new RatingService(ratings, members).getRatingsByMember(1L, 1, 2);
        assertEquals(1, result.page());
        assertEquals(2, result.size());
        verify(ratings).findByMember_MemberIdOrderByRatingIdDesc(1L, PageRequest.of(1, 2));
    }
    @Test void missingMemberReturns404() {
        var members = mock(MemberRepository.class);
        var ratings = mock(RatingRepository.class);
        var error = assertThrows(ApiException.class,
                () -> new RatingService(ratings, members).getRatingsByMember(999L, 0, 10));
        assertEquals(404, error.getStatus().value());
        verifyNoInteractions(ratings);
    }

    @Test
    void duplicateRatingForSameMemberAndMovieReturns409() {
        // given
        var members = mock(MemberRepository.class);
        var ratings = mock(RatingRepository.class);
        var service = new RatingService(ratings, members);
        var request = new CreateRatingRequest(550L, 5, "재관람 후기");
        when(members.findById(1L)).thenReturn(Optional.of(mock(Member.class)));
        when(ratings.existsByMember_MemberIdAndMovieId(1L, request.movieId())).thenReturn(true);

        // when
        var error = assertThrows(ApiException.class, () -> service.create(1L, request));

        // then
        assertEquals(409, error.getStatus().value());
        assertEquals("RATING409_1", error.getCode());
        verify(ratings, never()).save(any(Rating.class));
    }

    @Test
    void updatingAnotherMembersRatingReturns403() {
        // given
        var members = mock(MemberRepository.class);
        var ratings = mock(RatingRepository.class);
        var service = new RatingService(ratings, members);
        var owner = mock(Member.class);
        when(owner.getMemberId()).thenReturn(2L);
        var rating = Rating.builder().member(owner).movieId(550L).score(3).comment("원래 후기").build();
        when(ratings.findById(10L)).thenReturn(Optional.of(rating));
        var request = new UpdateRatingRequest(5, "수정된 후기");

        // when
        var error = assertThrows(ApiException.class, () -> service.update(1L, 10L, request));

        // then
        assertEquals(403, error.getStatus().value());
        assertEquals("RATING403_1", error.getCode());
        assertEquals(3, rating.getScore());
        assertEquals("원래 후기", rating.getComment());
        verify(ratings, never()).save(any(Rating.class));
    }
}

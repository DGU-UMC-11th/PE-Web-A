package com.umc.movie;
import com.umc.movie.repository.*;
import com.umc.movie.service.RatingService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.*;
import org.springframework.web.server.ResponseStatusException;
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
        var error = assertThrows(ResponseStatusException.class,
                () -> new RatingService(ratings, members).getRatingsByMember(999L, 0, 10));
        assertEquals(404, error.getStatusCode().value());
        verifyNoInteractions(ratings);
    }
}

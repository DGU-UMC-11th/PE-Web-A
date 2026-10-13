package com.umc.study.service;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import com.umc.study.repository.RentalRepository;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RentalServiceTest {
    private final RentalRepository repository = mock(RentalRepository.class);
    private final RentalService service = new RentalService(repository);

    @Test
    void returnsCreatedRental() {
        Map<String, Object> rental = Map.of("rental_id", 10L, "user_id", 1L, "book_id", 2L);
        when(repository.save(1L, 2L)).thenReturn(10L);
        when(repository.findById(10L)).thenReturn(rental);
        assertEquals(rental, service.create(Map.of("userId", 1, "bookId", 2)));
    }

    @Test
    void rejectsMissingIdBeforeWriting() {
        assertThrows(ResponseStatusException.class, () -> service.create(Map.of("userId", 1)));
        verifyNoInteractions(repository);
    }

    @Test
    void rejectsFractionalNegativeAndStringIds() {
        for (Object invalid : new Object[] {1.5, -1, 0, "1"}) {
            assertThrows(ResponseStatusException.class,
                () -> service.create(Map.of("userId", invalid, "bookId", 1)));
        }
        verifyNoInteractions(repository);
    }
}

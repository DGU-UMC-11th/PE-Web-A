package com.umc.study.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.umc.study.dto.*;
import com.umc.study.entity.*;
import com.umc.study.repository.*;
import com.umc.study.exception.CategoryNotFoundException;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<BookResponse> getBooks() {
        return bookRepository.findAllByOrderByBookIdDesc().stream()
            .map(BookResponse::from).toList();
    }

    @Transactional
    public BookResponse createBook(CreateBookRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
            .orElseThrow(CategoryNotFoundException::new);
        Book book = new Book(category, request.title(), request.description());
        return BookResponse.from(bookRepository.save(book));
    }
}

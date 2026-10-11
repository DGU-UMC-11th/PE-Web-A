package com.umc.study.repository;

import java.util.List;
import com.umc.study.entity.Book;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {
    // 응답에 필요한 카테고리를 함께 조회하여 N+1 쿼리를 방지한다.
    @EntityGraph(attributePaths = "category")
    List<Book> findAllByOrderByBookIdDesc();
}

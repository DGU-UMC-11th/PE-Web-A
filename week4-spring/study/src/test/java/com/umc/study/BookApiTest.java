package com.umc.study;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;
import org.springframework.http.MediaType;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BookApiTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach
    void seed() {
        jdbc.update("DELETE FROM book");
        jdbc.update("DELETE FROM category");
        jdbc.update("INSERT INTO category(category_id, name) VALUES (1, '문학')");
        jdbc.update("INSERT INTO book(book_id, category_id, title, is_available) VALUES (1, 1, '달빛 도서관', true), (2, 1, '겨울의 편지', false)");
    }

    @Test
    void listsAllBooksNewestFirstWithDtoFields() throws Exception {
        mvc.perform(get("/books")).andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].bookId").value(2))
            .andExpect(jsonPath("$[0].categoryName").value("문학"))
            .andExpect(jsonPath("$[0].isAvailable").value(false))
            .andExpect(jsonPath("$[1].bookId").value(1))
            .andExpect(jsonPath("$[0].category").doesNotExist())
            .andExpect(jsonPath("$[0].book_id").doesNotExist());
    }

    @Test
    void createsBookAndCommitsToDatabase() throws Exception {
        mvc.perform(post("/books").contentType(MediaType.APPLICATION_JSON)
                .content("{\"categoryId\":1,\"title\":\"새 도서\",\"description\":\"소개\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookId").isNumber())
            .andExpect(jsonPath("$.title").value("새 도서"))
            .andExpect(jsonPath("$.description").value("소개"))
            .andExpect(jsonPath("$.categoryName").value("문학"))
            .andExpect(jsonPath("$.isAvailable").value(true));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM book WHERE title = '새 도서'", Integer.class)).isEqualTo(1);
        mvc.perform(get("/books")).andExpect(jsonPath("$[0].title").value("새 도서"));
    }

    @Test
    void descriptionIsOptional() throws Exception {
        mvc.perform(post("/books").contentType(MediaType.APPLICATION_JSON)
            .content("{\"categoryId\":1,\"title\":\"설명 없는 책\"}"))
            .andExpect(status().isCreated());
    }

    @Test
    void rejectsInvalidRequestsWithoutInserting() throws Exception {
        String[] bodies = {
            "{\"categoryId\":1,\"title\":\"   \"}",
            "{\"title\":\"책\"}",
            "{\"categoryId\":0,\"title\":\"책\"}",
            "{\"categoryId\":1,\"title\":\"" + "가".repeat(101) + "\"}",
            "{\"categoryId\":\"invalid\",\"title\":\"책\"}",
            "broken json"
        };
        for (String body : bodies) {
            mvc.perform(post("/books").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
        }
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM book", Integer.class)).isEqualTo(2);
    }

    @Test
    void missingCategoryReturns404WithoutInserting() throws Exception {
        mvc.perform(post("/books").contentType(MediaType.APPLICATION_JSON)
            .content("{\"categoryId\":999999,\"title\":\"책\"}"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("존재하지 않는 카테고리입니다."));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM book", Integer.class)).isEqualTo(2);
    }
}

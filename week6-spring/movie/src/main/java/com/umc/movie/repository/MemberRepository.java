package com.umc.movie.repository;

import com.umc.movie.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
    /** 해당 닉네임을 사용하는 회원이 있는지 조회한다. */
    boolean existsByNickname(String nickname);
    /** 해당 이메일을 사용하는 회원이 있는지 조회한다. */
    boolean existsByEmail(String email);
}

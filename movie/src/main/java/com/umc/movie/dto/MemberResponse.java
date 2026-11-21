// src/main/java/com/umc/movie/dto/MemberResponse.java
package com.umc.movie.dto;

import com.umc.movie.entity.Member;

// 비밀번호는 절대 응답에 포함하지 않습니다.
public record MemberResponse(
        Long memberId,
        String email,
        String nickname
) {
    public static MemberResponse from(Member member) {
        return new MemberResponse(member.getMemberId(), member.getEmail(), member.getNickname());
    }
}

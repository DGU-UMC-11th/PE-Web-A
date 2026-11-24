package com.umc.movie.dto;
import com.umc.movie.entity.Member;
import java.time.LocalDateTime;

public record MemberInfoResponse(String email, String nickname, LocalDateTime createdAt) {
    /** 비밀번호를 제외한 본인 정보만 반환한다. */
    public static MemberInfoResponse from(Member member) {
        return new MemberInfoResponse(member.getEmail(), member.getNickname(), member.getCreatedAt());
    }
}

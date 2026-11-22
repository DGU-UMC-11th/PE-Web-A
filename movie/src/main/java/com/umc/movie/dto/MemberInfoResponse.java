package com.umc.movie.dto;

import com.umc.movie.entity.Member;

import java.time.LocalDateTime;

public record MemberInfoResponse(
        String email,
        String nickname,
        LocalDateTime createdAt
) {
    // 엔티티를 그대로 보내면 password까지 나가니까 꼭 DTO로 옮겨 담아요
    public static MemberInfoResponse from(Member member) {
        return new MemberInfoResponse(
                member.getEmail(),
                member.getNickname(),
                member.getCreatedAt()
        );
    }
}
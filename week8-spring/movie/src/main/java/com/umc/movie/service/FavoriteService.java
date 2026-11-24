package com.umc.movie.service;

import com.umc.movie.dto.*;
import com.umc.movie.entity.*;
import com.umc.movie.exception.ApiException;
import com.umc.movie.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final MemberRepository memberRepository;

    /** 사전 검사와 DB 복합 UNIQUE 제약으로 중복 즐겨찾기를 막는다. */
    @Transactional
    public FavoriteResponse create(Long memberId, CreateFavoriteRequest request) {
        Member member = memberRepository.findById(memberId).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "MEMBER404_1", "해당 회원을 찾을 수 없습니다."));
        if (favoriteRepository.existsByMember_MemberIdAndMovieId(memberId, request.movieId())) {
            throw new ApiException(HttpStatus.CONFLICT, "FAVORITE409_1", "이미 이 영화를 즐겨찾기하셨습니다.");
        }
        return FavoriteResponse.from(favoriteRepository.saveAndFlush(new Favorite(member, request.movieId())));
    }

    /** 로그인한 회원의 즐겨찾기만 최신 등록순으로 반환한다. */
    @Transactional(readOnly = true)
    public List<FavoriteResponse> getMyFavorites(Long memberId) {
        return favoriteRepository.findByMember_MemberIdOrderByFavoriteIdDesc(memberId).stream().map(FavoriteResponse::from).toList();
    }

    /** 즐겨찾기하지 않은 영화도 200 응답의 false로 표현한다. */
    @Transactional(readOnly = true)
    public FavoriteStatusResponse getStatus(Long memberId, Long movieId) {
        return new FavoriteStatusResponse(favoriteRepository.existsByMember_MemberIdAndMovieId(memberId, movieId));
    }

    /** 다른 회원의 관계에는 접근하지 않고 내 즐겨찾기만 삭제한다. */
    @Transactional
    public void delete(Long memberId, Long movieId) {
        Favorite favorite = favoriteRepository.findByMember_MemberIdAndMovieId(memberId, movieId).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "FAVORITE404_1", "즐겨찾기한 영화를 찾을 수 없습니다."));
        favoriteRepository.delete(favorite);
    }
}

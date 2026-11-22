import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useProfileStore } from "../../stores/profile-store";
import { useAuthStore } from "../../stores/auth-store";
import { getMe } from "../../api/members/me";
import { useFavorites } from "../../hooks/use-favorites";
import { movieQueryOptions } from "../../api/movies/query-options";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import MovieCard from "../../components/movies/movie-card";
import Pagination from "../../components/movies/pagination";
import "../../components/profile-page.css";

export function ProfileAvatar({ src }: { src: string }) {
  return <div className="profile-avatar">{src ? <img src={src} alt="프로필" /> : <svg viewBox="0 0 48 48" fill="currentColor" aria-label="기본 프로필" role="img"><circle cx="24" cy="16" r="8" /><path d="M8 40v-5c0-11 32-11 32 0v5z" /></svg>}</div>;
}

export function ProfilePage() {
  const avatar = useProfileStore((state) => state.avatar);
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const member = accessToken ? meQuery.data : undefined;
  const { list: favorites, useLocal: useLocalFavorites, ids } = useFavorites();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(ids.length / 5));
  const currentPage = Math.min(page, totalPages);
  const movies = useQueries({ queries: ids.slice((currentPage - 1) * 5, currentPage * 5).map((id) => movieQueryOptions.detail(id)) });

  return <main className="profile-page">
    <div className="profile-heading"><h1>내 정보</h1><Link className="profile-primary" to="/mypage/edit">정보 수정</Link></div>
    <section className="profile-basic" aria-labelledby="basic-heading">
      <h2 id="basic-heading">기본 정보</h2>
      <div className="profile-details">
        <ProfileAvatar src={avatar} />
        {member ? (
          <>
            <dl><dt>닉네임</dt><dd>{member.nickname}</dd></dl>
            <dl><dt>이메일</dt><dd>{member.email}</dd></dl>
          </>
        ) : !accessToken ? (
          <p>로그인하면 회원 정보를 볼 수 있어요.</p>
        ) : meQuery.isError ? (
          <p>회원 정보를 불러오지 못했어요. <button type="button" onClick={() => void meQuery.refetch()}>다시 시도</button></p>
        ) : (
          <p>회원 정보를 불러오는 중이에요.</p>
        )}
      </div>
    </section>
    <section className="profile-bookmarks" aria-labelledby="bookmark-heading">
      <h2 id="bookmark-heading">내 즐겨찾기</h2>
      {favorites.isError && !useLocalFavorites ? (
        <div className="profile-empty">
          <p>즐겨찾기를 불러오지 못했어요.</p>
          <button type="button" onClick={() => void favorites.refetch()}>다시 시도</button>
        </div>
      ) : !useLocalFavorites && favorites.isPending && ids.length === 0 ? <p role="status">즐겨찾기를 불러오는 중이에요.</p> : ids.length === 0 ? <div className="profile-empty"><p>아직 즐겨찾기한 영화가 없어요.</p><Link to="/">영화 둘러보기</Link></div> : null}
      {ids.length > 0 && <>
        <div className="profile-movie-grid">{movies.map((movie, index) => movie.data ? <MovieCard key={ids[(currentPage - 1) * 5 + index]} movie={{ id: movie.data.id, title: movie.data.title, releaseDate: movie.data.release_date, posterPath: getTmdbPosterUrl(movie.data.poster_path) ?? "" }} /> : <div className="profile-movie-status" key={index}>{movie.isError ? <><p>영화를 불러오지 못했어요.</p><button type="button" onClick={() => void movie.refetch()}>다시 시도</button></> : <p>영화를 불러오는 중이에요.</p>}</div>)}</div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </>}
    </section>
  </main>;
}

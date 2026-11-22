import { Link, useNavigate } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { movieQueries } from "../../queries/movies/movie-queries";
import { useAuthStore } from "../../stores/auth-store";
import { getFavorites } from "../../api/members/account-api";
import { useMe, useUpdateMeMutation } from "../../hooks/use-account";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import { MovieImage } from "../../components/movies/movie-image";
import { AccountField, primaryButton } from "../auth/account-form";
import { validNickname } from "../auth/account-validation";

const pageClass = "mx-auto w-full max-w-7xl flex-1 px-6 py-6";

export function ProfilePage() {
  const member = useMe();
  const session = useAuthStore((state) => state.session);
  const favorites = useQuery({ queryKey: ["favorites", session, "list"], queryFn: getFavorites, retry: false });
  const movies = useQueries({ queries: (favorites.data ?? []).map((item) => movieQueries.detail(item.movieId)) });
  return (
    <main className={pageClass}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">내 정보</h1>
        <Link to="/me/edit" className={primaryButton}>정보 수정</Link>
      </div>
      <section className="border-y py-5">
        <h2 className="mb-4 font-bold">기본 정보</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-gray-500">닉네임</dt><dd>{member.data?.nickname}</dd></div>
          <div><dt className="text-sm text-gray-500">이메일</dt><dd>{member.data?.email}</dd></div>
        </dl>
      </section>
      <h2 className="my-5 font-bold">내 즐겨찾기</h2>
      {favorites.isPending && <p role="status">즐겨찾기를 불러오는 중이에요.</p>}
      {favorites.isError && <p role="alert">즐겨찾기를 불러오지 못했어요. <button onClick={() => void favorites.refetch()}>다시 시도</button></p>}
      {favorites.isSuccess && !favorites.data.length && <p>즐겨찾기한 영화가 없어요.</p>}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
        {movies.map((movie, index) => movie.data ? <Link key={favorites.data![index].movieId} to="/movies/$movieId" params={{ movieId: String(movie.data.id) }}>
          <MovieImage src={getTmdbPosterUrl(movie.data.poster_path)} alt={movie.data.title} className="aspect-[2/3] w-full rounded-lg object-cover" />
          <p className="mt-2 font-semibold">{movie.data.title}</p>
        </Link> : <p key={index}>{movie.isError ? "영화 정보를 불러오지 못했어요." : "영화 정보를 불러오는 중이에요."}</p>)}
      </div>
    </main>
  );
}
export function EditProfilePage() {
  const member = useMe();
  if (!member.data) return <p>내 정보를 불러오는 중이에요.</p>;
  return <EditForm key={member.data.email} nickname={member.data.nickname} email={member.data.email} />;
}
function EditForm({ nickname: initialNickname, email }: { nickname: string; email: string }) {
  const [nickname, setNickname] = useState(initialNickname);
  const mutation = useUpdateMeMutation();
  const navigate = useNavigate();
  return (
    <main className={pageClass}>
      <form className="space-y-6" onSubmit={(event) => {
        event.preventDefault();
        if (!validNickname(nickname) || mutation.isPending) return;
        mutation.mutate({ nickname: nickname.trim() }, { onSuccess: () => { void navigate({ to: "/me" }); } });
      }}>
        <div className="flex justify-between gap-4">
          <h1 className="text-3xl font-bold">내 정보 수정</h1>
          <button className={primaryButton} disabled={!validNickname(nickname) || mutation.isPending}>{mutation.isPending ? "저장 중" : "변경사항 저장"}</button>
        </div>
        <div className="ml-auto max-w-xl space-y-5">
          <AccountField id="profile-nickname" label="닉네임" value={nickname} disabled={mutation.isPending}
            onChange={(event) => setNickname(event.target.value)} error={validNickname(nickname) ? undefined : "닉네임은 2~12자로 입력해 주세요."} />
          <AccountField id="profile-email" label="이메일" value={email} readOnly />
          {mutation.isError && <p role="alert" className="text-red-600">수정하지 못했어요. 닉네임 중복 여부를 확인하고 다시 시도해 주세요.</p>}
        </div>
      </form>
    </main>
  );
}

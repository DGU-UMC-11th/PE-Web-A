import { Link, useNavigate } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { create } from "zustand";
import { movieQueries } from "../../queries/movies/movie-queries";
import { useBookmarkStore } from "../../stores/bookmark-store";
import { getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import { MovieImage } from "../../components/movies/movie-image";
import { checkAvailability } from "../../api/members/member-api";
import { AccountField, primaryButton } from "../auth/account-form";
import { validNickname } from "../auth/account-validation";

interface Profile {
  email: string;
  nickname: string;
  image: string | null;
  update: (nickname: string, image: string | null) => void;
}

const useProfile = create<Profile>()((set) => ({
  email: "movie@example.com",
  nickname: "영화친구",
  image: null,
  update: (nickname, image) => set({ nickname, image }),
}));

const pageClass = "mx-auto w-full max-w-7xl flex-1 px-6 py-6";
const actionClass = primaryButton + " shrink-0 text-sm";

function Avatar({ src }: { src: string | null }) {
  return (
    <div className="grid size-[74px] shrink-0 place-items-center overflow-hidden rounded-full bg-gray-200">
      <img src={src ?? "/icons/movie-icons/person.svg"} alt="프로필 이미지"
        className={src ? "size-full object-cover" : "size-10"} />
    </div>
  );
}

export function ProfilePage() {
  const { email, nickname, image } = useProfile();
  const ids = useBookmarkStore((state) => state.bookmarkedMovieIds);
  const favorites = useQueries({ queries: ids.map((id) => movieQueries.detail(id)) });

  return (
    <main className={pageClass}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">내 정보</h1>
        <Link to="/me/edit" className={actionClass}>정보 수정</Link>
      </div>
      <section className="border-y border-gray-200 py-4">
        <h2 className="mb-4 font-bold">기본 정보</h2>
        <div className="flex flex-wrap items-center gap-6">
          <Avatar src={image} />
          <dl className="grid min-w-0 flex-1 gap-4 text-sm sm:grid-cols-3">
            <div><dt className="text-xs text-gray-500">닉네임</dt><dd className="mt-1 font-semibold">{nickname}</dd></div>
            <div className="break-all"><dt className="text-xs text-gray-500">이메일</dt><dd className="mt-1 font-semibold">{email}</dd></div>
          </dl>
        </div>
      </section>
      <section className="mt-6">
        <h2 className="mb-4 font-bold">내 즐겨찾기</h2>
        {ids.length === 0 && <p className="text-sm text-gray-500">즐겨찾기한 영화가 없어요.</p>}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {favorites.map(({ data, isPending, isError }, index) => {
            if (isPending) return <p key={ids[index]} role="status" className="text-sm text-gray-500">영화 정보를 불러오는 중이에요.</p>;
            if (isError || !data) return <p key={ids[index]} className="text-sm text-gray-500">영화 정보를 불러오지 못했어요.</p>;
            return (
              <Link key={data.id} to="/movies/$movieId" params={{ movieId: String(data.id) }}>
                <MovieImage src={getTmdbPosterUrl(data.poster_path)} alt={data.title}
                  className="aspect-[7/8] w-full rounded-lg object-cover" />
                <p className="mt-2 text-sm font-semibold">{data.title}</p>
                <p className="text-xs text-gray-500">{data.release_date}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export function EditProfilePage() {
  const profile = useProfile();
  const [nickname, setNickname] = useState(profile.nickname);
  const [image, setImage] = useState(profile.image);
  const [fileError, setFileError] = useState("");
  const [reading, setReading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState("");
  const [feedback, setFeedback] = useState("");
  const navigate = useNavigate();
  const trimmed = nickname.trim();
  const valid = validNickname(nickname);
  const canSave = valid && !reading && !checking && (trimmed === profile.nickname || checked === trimmed);

  async function checkNickname() {
    setChecking(true);
    setChecked("");
    try {
      const available = await checkAvailability("nickname", trimmed);
      if (available) setChecked(trimmed);
      setFeedback(available ? "사용할 수 있는 닉네임이에요." : "이미 사용 중인 닉네임이에요.");
    } catch {
      setFeedback("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setChecking(false);
    }
  }

  function selectImage(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setFileError("5MB 이하의 JPG, PNG, WebP, GIF 이미지를 선택해 주세요.");
      return;
    }
    setFileError("");
    setReading(true);
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => setFileError("이미지를 읽지 못했어요.");
    reader.onloadend = () => setReading(false);
    reader.readAsDataURL(file);
  }

  return (
    <main className={pageClass + " flex flex-col"}>
      <form className="flex flex-1 flex-col" onSubmit={(event) => {
        event.preventDefault();
        if (!canSave) return;
        profile.update(trimmed, image);
        void navigate({ to: "/me" });
      }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">내 정보 수정</h1>
            <p className="mt-2 text-sm text-gray-500">닉네임과 프로필 이미지만 변경할 수 있어요.</p>
          </div>
          <button className={actionClass} disabled={!canSave}>변경사항 저장</button>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="flex flex-col items-center pt-4">
            <label className="relative grid cursor-pointer justify-items-center gap-1 rounded-lg focus-within:ring-2 focus-within:ring-blue-500">
              <Avatar src={image} />
              <img src="/icons/movie-icons/edit.svg" alt="" className="absolute right-[calc(50%-37px)] top-13 size-6 rounded-full border bg-white p-1" />
              <span className="text-sm font-semibold">프로필 이미지</span>
              <span className="text-xs text-gray-500">선택 사항 · 최대 5MB</span>
              <input type="file" aria-label="프로필 이미지" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only"
                disabled={reading} onChange={(event) => {
                  selectImage(event.target.files?.[0]);
                  event.target.value = "";
                }} />
            </label>
            {fileError && <p role="alert" className="mt-2 text-sm text-red-600">{fileError}</p>}
          </div>
          <div className="grid content-start gap-4">
            <AccountField id="profile-nickname" label="닉네임" value={nickname} disabled={checking}
              onChange={(event) => { setNickname(event.target.value); setChecked(""); setFeedback(""); }}
              error={valid ? undefined : "닉네임은 2~12자로 입력해 주세요."}
              action={<button type="button" disabled={!valid || checking || trimmed === profile.nickname}
                className="shrink-0 px-1 py-2 text-xs font-semibold text-blue-700 disabled:text-gray-400"
                onClick={() => void checkNickname()}>{checking ? "확인 중" : "중복 확인"}</button>} />
            {feedback && <p role="status" className="text-sm text-gray-600">{feedback}</p>}
            <AccountField id="profile-email" label="이메일" type="email" value={profile.email} readOnly />
          </div>
        </div>
      </form>
      <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
        <div><h2 className="text-sm font-bold">회원 탈퇴</h2><p className="mt-1 text-xs">탈퇴하면 작성한 평점, 후기와 즐겨찾기가 삭제돼요.</p></div>
        <button type="button" disabled className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-bold opacity-70">회원 탈퇴</button>
      </section>
    </main>
  );
}

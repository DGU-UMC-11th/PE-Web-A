import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode, type SubmitEvent } from "react";
import type { MemberInfo } from "../../api/members/me";
import { useMeQuery } from "../../hooks/use-me-query";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";
import { AccountLayout } from "./account-layout";
import { FavoriteMovies } from "./favorite-movies";

function ProfileLayout({
  title,
  children,
}: {
  title: string;
  children: (profile: MemberInfo) => ReactNode;
}) {
  const { accessToken, meQuery } = useMeQuery();

  return (
    <AccountLayout title={title}>
      {!accessToken ? (
        <p className="signup-login">
          <Link to="/login">
            <span>로그인</span>
          </Link>
        </p>
      ) : meQuery.isLoading ? (
        <p role="status">내 정보를 불러오는 중이에요.</p>
      ) : meQuery.isError || !meQuery.data ? (
        <p role="alert">내 정보를 불러오지 못했어요.</p>
      ) : (
        children(meQuery.data)
      )}
    </AccountLayout>
  );
}

export function MyPage() {
  const navigate = useNavigate();

  return (
    <ProfileLayout title="내 정보">
      {(profile) => (
        <div className="signup-form">
          <div className="signup-field">
            <label htmlFor="profile-email">이메일</label>
            <div className="signup-input-row">
              <input id="profile-email" value={profile.email} readOnly />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="profile-nickname">닉네임</label>
            <div className="signup-input-row">
              <input id="profile-nickname" value={profile.nickname} readOnly />
            </div>
          </div>

          <button
            className="signup-submit"
            type="button"
            onClick={() => void navigate({ to: "/mypage/edit" })}
          >
            내 정보 수정
          </button>
          <FavoriteMovies />
        </div>
      )}
    </ProfileLayout>
  );
}

export function MyPageEdit() {
  return (
    <ProfileLayout title="내 정보 수정">
      {(profile) => <ProfileEditForm key={profile.email} profile={profile} />}
    </ProfileLayout>
  );
}

function ProfileEditForm({ profile }: { profile: MemberInfo }) {
  const navigate = useNavigate();
  const updateMeMutation = useUpdateMeMutation();
  const [nicknameInput, setNicknameInput] = useState(profile.nickname);
  const nickname = nicknameInput.trim();
  const canSubmit = nickname.length >= 2 && nickname.length <= 12;
  const showNicknameError = nicknameInput !== profile.nickname && !canSubmit;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || updateMeMutation.isPending) return;

    updateMeMutation.mutate({ nickname }, {
      onSuccess: () => void navigate({ to: "/mypage" }),
    });
  }

  return (
    <>
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-field">
          <label htmlFor="edit-email">이메일</label>
          <div className="signup-input-row">
            <input
              id="edit-email"
              type="email"
              value={profile.email}
              readOnly
            />
          </div>
        </div>

        <div className="signup-field">
          <label htmlFor="edit-nickname">닉네임</label>
          <div className="signup-input-row">
            <input
              id="edit-nickname"
              autoComplete="nickname"
              value={nicknameInput}
              onChange={(event) => setNicknameInput(event.target.value)}
              aria-invalid={showNicknameError}
              aria-describedby={
                showNicknameError ? "nickname-error" : undefined
              }
              maxLength={12}
              required
            />
          </div>

          {showNicknameError && (
            <p id="nickname-error" className="signup-error" role="alert">
              닉네임은 2~12자로 입력해 주세요.
            </p>
          )}
        </div>

        <button
          className="signup-submit"
          type="submit"
          disabled={!canSubmit || updateMeMutation.isPending}
        >
          {updateMeMutation.isPending ? "저장 중" : "저장하기"}
        </button>
      </form>

      <p className="signup-login">
        <Link to="/mypage">
          <span>취소</span>
        </Link>
      </p>
    </>
  );
}

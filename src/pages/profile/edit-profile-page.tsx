
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { useProfileStore } from "../../stores/profile-store";
import { ProfileAvatar } from "./profile-page";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";

import { getMe } from "../../api/members/me";
import { useAuthStore } from "../../stores/auth-store";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";

import "../../components/signup-page.css";

export function EditProfilePage() {
  const profile = useProfileStore();
  const navigate = useNavigate();

  // 로그인 토큰
  const accessToken = useAuthStore((state) => state.accessToken);

  // 서버에서 현재 회원 정보 조회
  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // 닉네임 수정 Mutation
  const updateMeMutation = useUpdateMeMutation();

  // 입력값 상태
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [checkedNickname, setCheckedNickname] = useState(
    profile.nickname,
  );

  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState("");

  // 서버 회원 정보가 도착하면 입력값 초기화
  useEffect(() => {
    if (!meQuery.data) return;

    setNickname(meQuery.data.nickname);
    setCheckedNickname(meQuery.data.nickname);
  }, [meQuery.data?.nickname]);

  const originalNickname =
    meQuery.data?.nickname ?? profile.nickname;

  const trimmedNickname = nickname.trim();

  const validNickname =
    trimmedNickname.length >= 2 &&
    trimmedNickname.length <= 12;

  const isNicknameChanged =
    trimmedNickname !== originalNickname;

  // 닉네임 중복 확인
  async function checkNickname() {
    if (!validNickname || checking) return;

    const value = nickname.trim();

    // 기존 닉네임은 중복 확인할 필요 없음
    if (value === originalNickname) {
      setCheckedNickname(value);
      setMessage("현재 사용 중인 닉네임이에요.");
      return;
    }

    setChecking(true);
    setMessage("");

    try {
      const result = await checkNicknameDuplicate(value);

      setCheckedNickname(result.available ? value : "");

      setMessage(
        result.available
          ? "사용할 수 있는 닉네임이에요."
          : "이미 사용 중인 닉네임이에요.",
      );
    } catch {
      setCheckedNickname("");
      setMessage(
        "중복 확인에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setChecking(false);
    }
  }

  // 프로필 이미지 변경
  function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    event.target.value = "";

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type,
      ) ||
      file.size > 5 * 1024 * 1024
    ) {
      setImageError(
        "5MB 이하의 JPG, PNG, WebP 이미지를 선택해 주세요.",
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setAvatar(String(reader.result));
      setImageError("");
    };

    reader.onerror = () => {
      setImageError(
        "이미지를 읽을 수 없어요. 다시 선택해 주세요.",
      );
    };

    reader.readAsDataURL(file);
  }

  // 로컬 프로필 이미지 저장 및 페이지 이동
  function finishSave(savedNickname: string) {
    try {
      profile.updateProfile({
        nickname: savedNickname,
        avatar,
      });

      void navigate({ to: "/mypage" });
    } catch {
      setMessage(
        "프로필 정보를 로컬에 저장하지 못했어요. 이미지 크기를 확인해 주세요.",
      );
    }
  }

  // 변경사항 저장
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (checking || updateMeMutation.isPending) return;

    if (!accessToken) {
      setMessage("로그인 후 정보를 수정할 수 있어요.");
      return;
    }

    if (!meQuery.data) {
      setMessage("회원 정보를 불러온 후 다시 시도해 주세요.");
      return;
    }

    if (!validNickname) {
      setMessage("닉네임은 2~12자로 입력해 주세요.");
      return;
    }

    if (
      isNicknameChanged &&
      checkedNickname !== trimmedNickname
    ) {
      setMessage("닉네임 중복 확인을 해 주세요.");
      return;
    }

    // 닉네임이 변경되지 않았다면 이미지 정보만 저장
    if (!isNicknameChanged) {
      finishSave(originalNickname);
      return;
    }

    // 서버에 닉네임 변경 요청
    updateMeMutation.mutate(
      { nickname: trimmedNickname },
      {
        onSuccess: (response) => {
          finishSave(response.result.nickname);
        },
        onError: () => {
          setMessage(
            "닉네임 수정에 실패했어요. 다시 시도해 주세요.",
          );
        },
      },
    );
  }

  return (
    <main className="profile-page profile-edit-page">
      <form onSubmit={save}>
        <div className="profile-heading">
          <div>
            <h1>내 정보 수정</h1>
            <p>닉네임과 프로필 이미지만 변경할 수 있어요.</p>
          </div>

          <button
            className="profile-primary"
            type="submit"
            disabled={
              checking ||
              updateMeMutation.isPending ||
              meQuery.isLoading ||
              !accessToken
            }
          >
            {updateMeMutation.isPending
              ? "저장 중"
              : "변경사항 저장"}
          </button>
        </div>

        <div className="profile-edit-grid">
          {/* 프로필 이미지 */}
          <div className="profile-image-field">
            <label className="profile-upload">
              <ProfileAvatar src={avatar} />

              <span
                className="profile-edit-icon"
                aria-hidden="true"
              >
                ✎
              </span>

              <input
                className="profile-file-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="프로필 이미지 변경"
                onChange={changeAvatar}
              />
            </label>

            <h2>프로필 이미지</h2>
            <p>선택 사항 · 최대 5MB</p>

            {imageError && (
              <p className="signup-error" role="alert">
                {imageError}
              </p>
            )}
          </div>

          {/* 회원 정보 */}
          <div className="signup-form">
            <div className="signup-field">
              <label
                className="signup-label"
                htmlFor="profile-nickname"
              >
                닉네임
              </label>

              <div className="signup-input-wrapper">
                <input
                  id="profile-nickname"
                  className="signup-input"
                  value={nickname}
                  disabled={
                    checking ||
                    updateMeMutation.isPending ||
                    meQuery.isLoading
                  }
                  maxLength={12}
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setCheckedNickname("");
                    setMessage("");
                  }}
                />

                <button
                  className="signup-check-button"
                  type="button"
                  disabled={
                    !validNickname ||
                    checking ||
                    updateMeMutation.isPending
                  }
                  onClick={checkNickname}
                >
                  {checking ? "확인 중" : "중복 확인"}
                </button>
              </div>

              {message && (
                <p className="profile-message" role="status">
                  {message}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div className="signup-field">
              <label
                className="signup-label"
                htmlFor="profile-email"
              >
                이메일
              </label>

              <div className="signup-input-wrapper">
                <input
                  id="profile-email"
                  className="signup-input"
                  type="email"
                  value={meQuery.data?.email ?? ""}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* 회원 탈퇴 */}
      <section className="profile-withdraw">
        <div>
          <h2>회원 탈퇴</h2>
          <p>
            탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두
            삭제되며 복구할 수 없습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            window.alert(
              "회원 탈퇴는 추후 계정 기능 연동 시 제공할 예정이에요.",
            )
          }
        >
          회원 탈퇴
        </button>
      </section>
    </main>
  );
}

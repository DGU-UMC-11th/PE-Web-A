import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@/components/common/icon";
import { ProfileAvatar } from "@/components/my/profile-avatar";
import { MOCK_USER } from "@/pages/my/mock-user";

// 프로필 이미지 최대 크기 (5MB)
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

const inputBoxClass =
  "flex h-12 w-full items-center gap-3 rounded-lg border border-line bg-white px-4";
const inputClass =
  "min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle disabled:text-subtle";
const labelClass = "text-sm font-bold text-ink";
const checkButtonClass =
  "shrink-0 cursor-pointer text-sm font-bold whitespace-nowrap text-brand disabled:cursor-not-allowed disabled:opacity-40";
const errorClass = "text-xs text-red-500";

export function MyEditPage() {
  const [nickname, setNickname] = useState(MOCK_USER.nickname);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 닉네임 유효성 검사 (회원가입과 같은 규칙)
  const trimmedNickname = nickname.trim();
  const isNicknameValid = trimmedNickname.length >= 2 && trimmedNickname.length <= 12;
  const showNicknameError = nickname.length > 0 && !isNicknameValid;

  // 미리보기 URL이 바뀌거나 화면을 벗어나면 이전 URL을 해제한다.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // 같은 파일을 다시 골라도 change 이벤트가 발생하도록 값 초기화
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      alert("프로필 이미지는 최대 5MB까지 올릴 수 있어요.");
      return;
    }

    setProfileImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCheckNickname = () => {
    alert("닉네임 중복 확인 API는 8주차에 연결할 예정이에요.");
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isNicknameValid) return;

    // API 연결은 8주차
    alert(
      `닉네임: ${trimmedNickname}\n프로필 이미지: ${profileImageFile ? `선택함 (${profileImageFile.name})` : "선택 안 함"}`,
    );
  };

  const handleWithdraw = () => {
    // 탈퇴 API는 아직 없어 확인 창만 띄운다.
    window.confirm("정말 탈퇴할까요? 탈퇴하면 복구할 수 없어요.");
  };

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-6 lg:px-20">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-[38px]/[44px] font-bold tracking-[-1.71px] break-keep text-ink">
              내 정보 수정
            </h1>
            <p className="text-sm/[17px] text-muted">닉네임과 프로필 이미지만 변경할 수 있어요.</p>
          </div>
          <button
            type="submit"
            disabled={!isNicknameValid}
            className="h-[42px] shrink-0 cursor-pointer rounded-lg bg-brand px-4 text-sm/[17px] font-extrabold whitespace-nowrap text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            변경사항 저장
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-10 border-t border-line pt-8 lg:flex-row lg:gap-20">
          <div className="flex flex-col items-center gap-3 text-center lg:w-[220px] lg:shrink-0">
            <div className="relative">
              <ProfileAvatar imageUrl={previewUrl ?? MOCK_USER.profileImageUrl} />
              <button
                type="button"
                aria-label="프로필 이미지 변경"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-1 -bottom-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-ink"
              >
                <Icon name="edit" className="size-4 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChangeImage}
                className="hidden"
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base/[19px] font-bold text-ink">프로필 이미지</p>
              <p className="text-xs/[14px] text-subtle">선택 사항 · 최대 5MB</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-6 lg:max-w-[640px]">
            <div className="flex flex-col gap-2">
              <label htmlFor="my-edit-nickname" className={labelClass}>
                닉네임
              </label>
              <div className={inputBoxClass}>
                <input
                  id="my-edit-nickname"
                  type="text"
                  placeholder="2-12자"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={!isNicknameValid}
                  className={checkButtonClass}
                >
                  중복 확인
                </button>
              </div>
              {showNicknameError && (
                <p className={errorClass}>닉네임은 2자 이상 12자 이하로 입력해 주세요.</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="my-edit-email" className={labelClass}>
                이메일
              </label>
              <div className={`${inputBoxClass} bg-page`}>
                <input
                  id="my-edit-email"
                  type="email"
                  value={MOCK_USER.email}
                  readOnly
                  disabled
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <section className="mt-12 flex flex-col gap-4 rounded-lg border border-red-500 bg-red-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-base/[19px] font-bold text-red-500">회원 탈퇴</h2>
          <p className="text-xs/[18px] break-keep text-red-500">
            탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleWithdraw}
          className="h-[42px] shrink-0 cursor-pointer self-start rounded-lg border border-red-500 bg-white px-4 text-sm/[17px] font-bold whitespace-nowrap text-red-500 sm:self-auto"
        >
          회원 탈퇴
        </button>
      </section>
    </main>
  );
}

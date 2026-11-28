"use client";

import { useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useProfileStore } from "../../stores/profile-store";
import { ProfileAvatar } from "./profile-page";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import "../../components/signup-page.css";

function subscribeToProfileHydration(onChange: () => void) {
  return useProfileStore.persist?.onFinishHydration(onChange) ?? (() => {});
}

export function EditProfilePage() {
  const hydrated = useSyncExternalStore(
    subscribeToProfileHydration,
    () => useProfileStore.persist?.hasHydrated() ?? true,
    () => false,
  );
  return hydrated ? <EditProfileForm /> : <main className="profile-page">내 정보를 불러오는 중이에요.</main>;
}

function EditProfileForm() {
  const profile = useProfileStore();
  const [nickname, setNickname] = useState(profile.nickname);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [checkedNickname, setCheckedNickname] = useState(profile.nickname);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const router = useRouter();
  const validNickname = nickname.trim().length >= 2 && nickname.trim().length <= 12;

  async function checkNickname() {
    if (!validNickname || checking) return;
    const value = nickname.trim();
    setChecking(true);
    setMessage("");
    try {
      const result = await checkNicknameDuplicate(value);
      setCheckedNickname(result.available ? value : "");
      setMessage(result.available ? "사용할 수 있는 닉네임이에요." : "이미 사용 중인 닉네임이에요.");
    } catch {
      setMessage("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally { setChecking(false); }
  }

  function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setImageError("5MB 이하의 JPG, PNG, WebP 이미지를 선택해 주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setAvatar(String(reader.result)); setImageError(""); };
    reader.onerror = () => setImageError("이미지를 읽을 수 없어요. 다시 선택해 주세요.");
    reader.readAsDataURL(file);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validNickname) { setMessage("닉네임은 2~12자로 입력해 주세요."); return; }
    if (checkedNickname !== nickname.trim()) { setMessage("닉네임 중복 확인을 해 주세요."); return; }
    try {
      profile.updateProfile({ nickname: nickname.trim(), avatar });
      router.push("/mypage");
    } catch { setMessage("정보를 저장할 공간이 부족해요. 더 작은 이미지를 선택해 주세요."); }
  }

  return <main className="profile-page profile-edit-page">
    <form onSubmit={save}>
      <div className="profile-heading"><div><h1>내 정보 수정</h1><p>닉네임과 프로필 이미지만 변경할 수 있어요.</p></div><button className="profile-primary" type="submit" disabled={checking}>변경사항 저장</button></div>
      <div className="profile-edit-grid">
        <div className="profile-image-field">
          <label className="profile-upload"><ProfileAvatar src={avatar} /><span className="profile-edit-icon" aria-hidden="true">✎</span><input className="profile-file-input" type="file" accept="image/png,image/jpeg,image/webp" aria-label="프로필 이미지 변경" onChange={changeAvatar} /></label>
          <h2>프로필 이미지</h2><p>선택 사항 · 최대 5MB</p>
          {imageError && <p className="signup-error" role="alert">{imageError}</p>}
        </div>
        <div className="signup-form">
          <div className="signup-field"><label className="signup-label" htmlFor="profile-nickname">닉네임</label><div className="signup-input-wrapper"><input id="profile-nickname" className="signup-input" value={nickname} disabled={checking} maxLength={12} onChange={(event) => { setNickname(event.target.value); setCheckedNickname(""); setMessage(""); }} /><button className="signup-check-button" type="button" disabled={!validNickname || checking} onClick={checkNickname}>{checking ? "확인 중" : "중복 확인"}</button></div>{message && <p className="profile-message" role="status">{message}</p>}</div>
          <div className="signup-field"><label className="signup-label" htmlFor="profile-email">이메일</label><div className="signup-input-wrapper"><input id="profile-email" className="signup-input" type="email" value={profile.email} readOnly /></div></div>
        </div>
      </div>
    </form>
    <section className="profile-withdraw"><div><h2>회원 탈퇴</h2><p>탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.</p></div><button type="button" onClick={() => window.alert("회원 탈퇴는 추후 계정 기능 연동 시 제공할 예정이에요.")}>회원 탈퇴</button></section>
  </main>;
}

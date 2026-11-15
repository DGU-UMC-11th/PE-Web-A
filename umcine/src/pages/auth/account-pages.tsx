import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import "./signup-page.css";

type Profile = {
  email: string;
  nickname: string;
};

const STORAGE_KEY = "umcine:profile-preview";

const DEFAULT_PROFILE: Profile = {
  email: "movie@example.com",
  nickname: "영화팬",
};

function readProfile(): Profile {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);

    if (saved) {
      const profile: Partial<Profile> | null = JSON.parse(saved);

      if (
        typeof profile?.email === "string" &&
        typeof profile.nickname === "string"
      ) {
        return { email: profile.email, nickname: profile.nickname };
      }
    }
  } catch {
    return DEFAULT_PROFILE;
  }

  return DEFAULT_PROFILE;
}

function saveProfile(profile: Profile) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function AccountLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="signup-page">
      <section className="signup-panel" aria-labelledby="account-title">
        <h1 id="account-title" className="signup-title">
          {title}
        </h1>
        {children}
      </section>
    </main>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmail = email.trim();
    const profile = readProfile();

    if (profile.email !== nextEmail) {
      saveProfile({ email: nextEmail, nickname: DEFAULT_PROFILE.nickname });
    }

    void navigate({ to: "/mypage" });
  }

  return (
    <AccountLayout title="로그인">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-field">
          <label htmlFor="login-email">이메일</label>
          <div className="signup-input-row">
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="이메일을 입력해 주세요"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="signup-field">
          <label htmlFor="login-password">비밀번호</label>
          <div className="signup-input-row">
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력해 주세요"
              required
            />
          </div>
        </div>

        <button className="signup-submit" type="submit">
          로그인
        </button>
      </form>

      <p className="signup-login">
        아직 계정이 없으신가요?{" "}
        <Link to="/signup">
          <span>회원가입</span>
        </Link>
      </p>
    </AccountLayout>
  );
}

export function MyPage() {
  const navigate = useNavigate();
  const [profile] = useState(readProfile);

  return (
    <AccountLayout title="내 정보">
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
      </div>
    </AccountLayout>
  );
}

export function MyPageEdit() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(readProfile);
  const [showNicknameError, setShowNicknameError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nickname = profile.nickname.trim();

    if (nickname.length < 2 || nickname.length > 12) {
      setShowNicknameError(true);
      return;
    }

    saveProfile({ email: profile.email.trim(), nickname });
    void navigate({ to: "/mypage" });
  }

  return (
    <AccountLayout title="내 정보 수정">
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="signup-field">
          <label htmlFor="edit-email">이메일</label>
          <div className="signup-input-row">
            <input
              id="edit-email"
              type="email"
              autoComplete="email"
              value={profile.email}
              onChange={(event) => {
                const email = event.target.value;
                setProfile((prev) => ({ ...prev, email }));
              }}
              required
            />
          </div>
        </div>

        <div className="signup-field">
          <label htmlFor="edit-nickname">닉네임</label>
          <div className="signup-input-row">
            <input
              id="edit-nickname"
              autoComplete="nickname"
              value={profile.nickname}
              onChange={(event) => {
                const nickname = event.target.value;
                setProfile((prev) => ({ ...prev, nickname }));
                setShowNicknameError(false);
              }}
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

        <button className="signup-submit" type="submit">
          저장하기
        </button>
      </form>

      <p className="signup-login">
        <Link to="/mypage">
          <span>취소</span>
        </Link>
      </p>
    </AccountLayout>
  );
}
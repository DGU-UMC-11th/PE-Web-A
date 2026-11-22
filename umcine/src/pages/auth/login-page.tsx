import { Link } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { useLoginMutation } from "../../hooks/use-login-mutation";
import { AccountLayout } from "./account-layout";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const canSubmit = EMAIL_REGEX.test(email.trim()) && password.length > 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({ email: email.trim(), password });
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
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
        </div>

        <button
          className="signup-submit"
          type="submit"
          disabled={!canSubmit || loginMutation.isPending}
        >
          {loginMutation.isPending ? "로그인 중" : "로그인"}
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

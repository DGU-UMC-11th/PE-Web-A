"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLoginMutation } from "../../hooks/use-login-mutation";

import "../../components/signup-page.css";
import "../../components/profile-page.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();

  const canSubmit =
    EMAIL_REGEX.test(email.trim()) && password.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: email.trim(),
      password: password,
    });
  };

  return (
    <main className="login-page">
      <div className="signup-container">
        <h1 className="signup-title">로그인</h1>

        <form className="signup-form" onSubmit={handleSubmit}>
          {/* 이메일 */}
          <div className="signup-field">
            <label className="signup-label" htmlFor="login-email">
              이메일
            </label>

            <div className="signup-input-wrapper login-input">
              <span aria-hidden="true">✉</span>

              <input
                id="login-email"
                className="signup-input"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="signup-field">
            <label
              className="signup-label"
              htmlFor="login-password"
            >
              비밀번호
            </label>

            <div className="signup-input-wrapper login-input">
              <img
                src="/icons/movie-icons/lock.svg"
                alt=""
              />

              <input
                id="login-password"
                className="signup-input"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            className="signup-submit"
            type="submit"
            disabled={!canSubmit || loginMutation.isPending}
          >
            {loginMutation.isPending ? "로그인 중" : "로그인"}
          </button>
        </form>

        <p className="signup-login">
          처음이신가요?{" "}
          <Link href="/signup">회원가입</Link>
        </p>
      </div>
    </main>
  );
}

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/common/icon";

// 이메일 형식 검사 (회원가입과 같은 규칙)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_FORM = {
  email: "",
  password: "",
};

type LoginFormKey = keyof typeof DEFAULT_FORM;

const inputBoxClass =
  "flex h-12 w-full items-center gap-3 rounded-lg border border-line bg-white px-4";
const inputClass =
  "min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-subtle";
const labelClass = "text-sm font-bold text-ink";

export function LoginPage() {
  const [form, setForm] = useState(DEFAULT_FORM);

  // 이메일 형식이 맞고 비밀번호가 비어 있지 않으면 제출 가능
  const canSubmit = EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  const handleChangeField = (key: LoginFormKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    alert("로그인 API는 8주차에 연결할 예정이에요.");
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-[430px] max-w-full flex-col"
      >
        <h1 className="mb-6 text-[38px]/[44px] font-bold tracking-[-1.71px] text-ink">
          로그인
        </h1>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className={labelClass}>
              이메일
            </label>
            <div className={inputBoxClass}>
              <Icon name="mail" className="size-5 text-muted" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => handleChangeField("email", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className={labelClass}>
              비밀번호
            </label>
            <div className={inputBoxClass}>
              <Icon name="lock" className="size-5 text-muted" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호"
                value={form.password}
                onChange={(e) => handleChangeField("password", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-7 h-[46px] w-full cursor-pointer rounded-lg bg-brand text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          로그인
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          처음이신가요?{" "}
          <Link to="/signup" className="font-bold text-brand">
            회원가입
          </Link>
        </p>
      </form>
    </main>
  );
}

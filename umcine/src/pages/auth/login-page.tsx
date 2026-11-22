import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useLoginMutation } from "../../hooks/use-login-mutation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const loginMutation = useLoginMutation();
  const canSubmit = EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <main className="mx-auto max-w-md px-8 py-12">
      <h1 className="mb-8 text-2xl font-bold">로그인</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="이메일"
          className="rounded border border-neutral-300 px-4 py-2"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="비밀번호"
          className="rounded border border-neutral-300 px-4 py-2"
        />
        <button
          type="submit"
          disabled={!canSubmit || loginMutation.isPending}
          className="rounded bg-neutral-900 py-3 font-bold text-white disabled:opacity-40"
        >
          {loginMutation.isPending ? "로그인 중" : "로그인"}
        </button>
      </form>

      <Link to="/signup" className="mt-6 block text-center text-sm underline">
        회원가입
      </Link>
    </main>
  );
}
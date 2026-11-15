import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 로그인 API 연결은 8주차에 할 예정
    alert(`입력한 이메일: ${email}`);
  };

  return (
    <main className="mx-auto max-w-md px-8 py-12">
      <h1 className="mb-8 text-2xl font-bold">로그인</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="rounded border border-neutral-300 px-4 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="rounded border border-neutral-300 px-4 py-2"
        />
        <button type="submit" className="rounded bg-neutral-900 py-3 font-bold text-white">
          로그인
        </button>
      </form>

      <Link to="/signup" className="mt-6 block text-center text-sm underline">
        회원가입
      </Link>
    </main>
  );
}
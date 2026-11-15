import { useState, type FormEvent } from "react";

export function MyPageEdit() {
  const [nickname, setNickname] = useState("영화광");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 내 정보 수정 API 연결은 8주차에 할 예정
    alert(`닉네임을 ${nickname}(으)로 수정했어요.`);
  };

  return (
    <main className="mx-auto max-w-md px-8 py-12">
      <h1 className="mb-8 text-2xl font-bold">내 정보 수정</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="nickname" className="font-bold">닉네임</label>
        <input
          id="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="rounded border border-neutral-300 px-4 py-2"
        />
        <p className="text-sm text-neutral-500">변경할 닉네임: {nickname}</p>
        <button type="submit" className="rounded bg-neutral-900 py-3 font-bold text-white">
          저장
        </button>
      </form>
    </main>
  );
}
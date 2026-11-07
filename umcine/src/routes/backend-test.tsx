import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const API = "http://localhost:8080";

function BackendTestPage() {
  const [nickname, setNickname] = useState("수현");
  const [email, setEmail] = useState("noco@umc.com");
  const [memberId, setMemberId] = useState("1");
  const [result, setResult] = useState("버튼을 눌러 보세요");

  async function call(path: string) {
    setResult("요청 중이에요...");
    try {
      const res = await fetch(`${API}${path}`);
      const data = await res.json();
      setResult(`${res.status}\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`요청 실패: ${String(error)}`);
    }
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">백엔드 API 연결 확인</h1>

      <div className="flex gap-2">
        <input className="flex-1 border px-2" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        <button className="bg-black px-3 py-1 text-white" onClick={() => call(`/members/nickname/${encodeURIComponent(nickname)}`)}>
          닉네임 중복 체크
        </button>
      </div>

      <div className="flex gap-2">
        <input className="flex-1 border px-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="bg-black px-3 py-1 text-white" onClick={() => call(`/members/email/${encodeURIComponent(email)}`)}>
          이메일 중복 체크
        </button>
      </div>

      <div className="flex gap-2">
        <input className="flex-1 border px-2" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
        <button className="bg-black px-3 py-1 text-white" onClick={() => call(`/members/${memberId}/ratings`)}>
          유저별 평점 조회
        </button>
      </div>

      <pre className="whitespace-pre-wrap rounded bg-neutral-100 p-4">{result}</pre>
    </main>
  );
}

export const Route = createFileRoute("/backend-test")({
  component: BackendTestPage,
});
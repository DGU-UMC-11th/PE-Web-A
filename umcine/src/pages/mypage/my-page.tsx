import { Link } from "@tanstack/react-router";

// 아직 API를 연결하지 않아서 예시 데이터를 사용 (8주차에 연결 예정)
const myInfo = {
  email: "movie@umc.com",
  nickname: "영화광",
  createdAt: "2026-09-02",
};

export function MyPage() {
  return (
    <main className="mx-auto max-w-md px-8 py-12">
      <h1 className="mb-8 text-2xl font-bold">내 정보</h1>

      <div className="flex flex-col gap-3 rounded border border-neutral-300 p-6">
        <p>이메일: {myInfo.email}</p>
        <p>닉네임: {myInfo.nickname}</p>
        <p>가입일: {myInfo.createdAt}</p>
      </div>

      <Link
        to="/mypage/edit"
        className="mt-6 block rounded bg-neutral-900 py-3 text-center font-bold text-white"
      >
        정보 수정
      </Link>
    </main>
  );
}
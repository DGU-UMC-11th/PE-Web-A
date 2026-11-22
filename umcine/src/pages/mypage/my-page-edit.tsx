import { Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/members/me";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";

export function MyPageEdit() {
  const [form, setForm] = useState({ nickname: "" });

  const meQuery = useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const updateMeMutation = useUpdateMeMutation();
  const nickname = form.nickname.trim();
  const canSubmit = nickname.length >= 2 && nickname.length <= 12;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || updateMeMutation.isPending) return;

    updateMeMutation.mutate({ nickname });
  };

  return (
    <main className="mx-auto max-w-md px-8 py-12">
      <h1 className="mb-8 text-2xl font-bold">내 정보 수정</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="nickname" className="font-bold">닉네임</label>
        <input
          id="nickname"
          value={form.nickname}
          onChange={(e) => setForm({ nickname: e.target.value })}
          placeholder={meQuery.data?.nickname ?? "2~12자"}
          className="rounded border border-neutral-300 px-4 py-2"
        />
        <p className="text-sm text-neutral-500">변경할 닉네임: {nickname}</p>
        <button
          type="submit"
          disabled={!canSubmit || updateMeMutation.isPending}
          className="rounded bg-neutral-900 py-3 font-bold text-white disabled:opacity-40"
        >
          {updateMeMutation.isPending ? "저장 중" : "저장"}
        </button>
      </form>

      <Link to="/mypage" className="mt-6 block text-center text-sm underline">
        내 정보로 돌아가기
      </Link>
    </main>
  );
}
import ky from "ky";

const api = ky.create({
  baseUrl: `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "")}/`,
  retry: 0,
});

export async function checkAvailability(field: "email" | "nickname", value: string) {
  const response = await api.get(`members/${field}/${encodeURIComponent(value)}`)
    .json<{ available: boolean }>();
  if (typeof response.available !== "boolean") throw new Error("중복 확인 응답을 확인해 주세요.");
  return response.available;
}

export async function signup(body: { email: string; nickname: string; password: string }) {
  const response = await api.post("members", { json: body })
    .json<{ isSuccess: boolean; message: string }>();
  if (!response.isSuccess) throw new Error(response.message || "회원가입에 실패했어요.");
  return response;
}

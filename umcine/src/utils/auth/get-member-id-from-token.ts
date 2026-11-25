/**
 * JWT payload의 sub 클레임에서 memberId를 꺼낸다.
 * 백엔드(JwtUtil.createAccessToken)가 subject에 memberId를 문자열로 넣는다.
 * 서명은 검증하지 않으므로 화면에서 "내 것"을 고르는 용도로만 쓰고, 권한 확인은 서버에 맡긴다.
 * @param accessToken 저장된 Access Token
 * @returns memberId, 토큰이 없거나 형식이 올바르지 않으면 null
 */
export function getMemberIdFromToken(accessToken: string | null): number | null {
  if (!accessToken) return null;

  const parts = accessToken.split(".");
  if (parts.length !== 3) return null;

  try {
    // base64url → base64 (문자 치환 + 길이를 4의 배수로 맞추는 padding)
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (typeof payload !== "object" || payload === null || !("sub" in payload)) return null;
    if (typeof payload.sub !== "string" && typeof payload.sub !== "number") return null;

    const memberId = Number(payload.sub);
    return Number.isInteger(memberId) && memberId > 0 ? memberId : null;
  } catch {
    return null;
  }
}

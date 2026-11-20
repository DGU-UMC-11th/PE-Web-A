import { apiClient, authApi, readResult } from './api-client';

export interface MemberInfo { memberId?: number; email: string; nickname: string; createdAt: string }
export interface SignupRequest { email: string; nickname: string; password: string }
export const signup = (body: SignupRequest) => readResult<{ memberId: number }>(apiClient.post('members', { json: body }));
export const checkAvailability = (field: 'email' | 'nickname', value: string) =>
  readResult<{ available: boolean }>(apiClient.get(`members/${field}/${encodeURIComponent(value)}`));
export const login = (body: { email: string; password: string }) =>
  readResult<{ nickname: string; accessToken: string }>(apiClient.post('auth/login', { json: body }));
export const getMe = (signal?: AbortSignal) => readResult<MemberInfo>(authApi.get('members/me', { signal }));
export const updateMe = (nickname: string) => readResult<MemberInfo>(authApi.patch('members/me', { json: { nickname } }));

/** 서버 명세 확정 전에는 memberId 또는 숫자형 JWT sub를 조회 ID로 사용한다. 권한 검증은 서버가 수행한다. */
export function getMemberId(member: MemberInfo | undefined, token: string | null): number | null {
  let value: unknown = member?.memberId;
  if (value === undefined && token) {
    try {
      const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, '='))) as { sub?: unknown };
      value = payload.sub;
    } catch { return null; }
  }
  const id = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : NaN;
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

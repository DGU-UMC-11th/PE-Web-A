import ky, { isHTTPError, isNetworkError, isTimeoutError, type ResponsePromise } from 'ky';
import { useAuthStore } from '../stores/auth-store';

const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080';
export const mockApiEnabled = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true';
const fetchOverride = mockApiEnabled
  ? { fetch: ((...args: Parameters<typeof fetch>) => import('../mocks/member-api').then(module => module.mockFetch(...args))) as typeof fetch }
  : {};
export const apiClient = ky.create({ ...fetchOverride, baseUrl: `${baseUrl.replace(/\/+$/, '')}/`, retry: 0, timeout: 15_000, totalTimeout: 15_000 });
export const authApi = apiClient.extend({
  hooks: {
    beforeRequest: [({ request }) => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error('로그인이 필요해요.');
      request.headers.set('Authorization', `Bearer ${token}`);
    }],
    afterResponse: [({ request, response }) => {
      // 이전 로그인 세션의 늦은 401 응답이 새 세션을 종료하지 않도록 한다.
      const token = useAuthStore.getState().accessToken;
      if (response.status === 401 && request.headers.get('Authorization') === `Bearer ${token}`) {
        useAuthStore.getState().setAccessToken(null);
      }
    }],
  },
});

interface ApiResponse<T> { isSuccess: boolean; code: string; message: string; result: T }
/** HTTP 오류 응답의 서버 메시지를 읽어 사용자에게 전달한다. */
async function checkedResponse<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (isHTTPError(error)) {
      const body = error.data;
      const message = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' ? body.message : null;
      throw new Error(message || `요청에 실패했어요. (HTTP ${error.response.status})`, { cause: error });
    }
    throw error;
  }
}

/** ky의 본문 읽기까지 전체 제한 시간과 취소를 적용한 뒤 응답 봉투를 해석한다. */
export async function readResult<T>(request: ResponsePromise): Promise<T> {
  const [response, text] = await checkedResponse(Promise.all([request, request.text()]));
  // 본문 없는 204 쓰기 응답도 같은 제한 시간 안에서 처리한다.
  if (response.status === 204) return undefined as T;
  const body = JSON.parse(text) as ApiResponse<T>;
  if (!body.isSuccess) throw new Error(body.message || '요청을 처리하지 못했어요.');
  return body.result;
}

/** 네트워크 단절을 포함한 요청 오류를 화면 문구로 바꾼다. */
export function errorMessage(error: unknown): string {
  if (isTimeoutError(error)) return '서버 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.';
  if (isNetworkError(error) || error instanceof TypeError) return '서버에 연결할 수 없어요. 연결 상태를 확인하고 다시 시도해 주세요.';
  return error instanceof Error ? error.message : '요청에 실패했어요. 다시 시도해 주세요.';
}

/** 본문이 없는 204는 파싱하지 않고, 다른 쓰기 응답은 공통 봉투를 검사한다. */
export async function readWriteResponse(request: ResponsePromise) {
  await readResult<unknown>(request);
}

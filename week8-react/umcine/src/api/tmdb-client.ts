import ky, { isHTTPError } from 'ky';
import { env, requireTmdbEnv, TmdbEnvError } from '../config/env';

export const tmdbClient = ky.create({
  baseUrl: `${env.tmdbApiBaseUrl.replace(/\/+$/, '')}/`,
  headers: { Authorization: `Bearer ${env.tmdbAccessToken}` },
  // 자동 재시도는 ky에서만 수행하고 기본 백오프와 Retry-After 처리를 유지한다.
  retry: {
    limit: 2,
    shouldRetry: ({ error }) => {
      if (error instanceof TmdbEnvError) return false;
      if (isHTTPError(error) && [401, 404].includes(error.response.status)) return false;
      // undefined는 ky의 기본 오류 분류와 재시도 타이밍을 사용한다.
      return undefined;
    },
  },
  hooks: { beforeRequest: [() => { requireTmdbEnv(); }] },
});

import ky from 'ky';
import { env, requireTmdbEnv } from '../config/env';

export const tmdbClient = ky.create({
  baseUrl: `${env.tmdbApiBaseUrl.replace(/\/+$/, '')}/`,
  headers: { Authorization: `Bearer ${env.tmdbAccessToken}` },
  hooks: { beforeRequest: [() => { requireTmdbEnv(); }] },
});

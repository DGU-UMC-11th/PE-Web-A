import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth-store';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: 60_000, gcTime: 5 * 60_000 }, mutations: { retry: false } },
});

// 로그아웃과 계정 변경 시 이전 사용자의 데이터와 진행 중인 조회를 제거한다.
useAuthStore.subscribe((state, previous) => {
  if (state.accessToken === previous.accessToken) return;
  const filters = { predicate: (query: { queryKey: readonly unknown[] }) =>
    ['members', 'favorites', 'ratings'].includes(String(query.queryKey[0])) };
  void queryClient.cancelQueries(filters);
  queryClient.removeQueries(filters);
});

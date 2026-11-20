import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFavorite, getFavorites, setFavorite } from '../api/favorites';
import { useAuthStore } from '../stores/auth-store';

/** 마이페이지의 북마크 목록을 로그인한 경우에만 조회한다. */
export function useFavorites() {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({ queryKey: ['favorites', 'list'], queryFn: ({ signal }) => getFavorites(signal), enabled: Boolean(token) });
}

/** 영화별 상태를 공유하고 변경 후 단건과 목록을 함께 갱신한다. */
export function useFavorite(movieId: number) {
  const token = useAuthStore(state => state.accessToken);
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['favorites', 'detail', movieId], queryFn: ({ signal }) => getFavorite(movieId, signal), enabled: Boolean(token) });
  const mutation = useMutation({
    mutationKey: ['favorites', 'write', movieId],
    mutationFn: (active: boolean) => setFavorite(movieId, active),
    onSuccess: async (_, active) => {
      if (useAuthStore.getState().accessToken !== token) return;
      client.setQueryData(['favorites', 'detail', movieId], { isFavorite: active });
      await client.invalidateQueries({ queryKey: ['favorites', 'list'] });
    },
  });
  return { query, mutation };
}

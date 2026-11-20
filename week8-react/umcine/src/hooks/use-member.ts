import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { getMe, login, signup, updateMe } from '../api/members';
import { useAuthStore } from '../stores/auth-store';

/** 헤더와 내 정보 화면이 동일한 회원 캐시를 구독한다. */
export function useMe() {
  const token = useAuthStore(state => state.accessToken);
  return useQuery({ queryKey: ['members', 'me'], queryFn: ({ signal }) => getMe(signal), enabled: Boolean(token), staleTime: 5 * 60_000, retry: false });
}

/** 회원가입 성공 후 로그인 화면에서 완료 안내를 보여준다. */
export function useSignupMutation() {
  const navigate = useNavigate();
  return useMutation({ mutationFn: signup, onSuccess: () => { void navigate({ to: '/login', search: { registered: true } }); } });
}

/** 로그인 토큰을 저장하고 회원 정보를 새로 조회한다. */
export function useLoginMutation() {
  const navigate = useNavigate();
  const client = useQueryClient();
  return useMutation({ mutationFn: login, onSuccess: response => {
    if (!response.accessToken) throw new Error('로그인 응답에 토큰이 없어요.');
    useAuthStore.getState().setAccessToken(response.accessToken);
    void client.invalidateQueries({ queryKey: ['members', 'me'] });
    void navigate({ to: '/' });
  } });
}

/** PATCH가 반환한 최신 회원 정보로 캐시를 교체하며 추가 GET을 보내지 않는다. */
export function useUpdateMeMutation() {
  const client = useQueryClient();
  const token = useAuthStore(state => state.accessToken);
  return useMutation({ mutationFn: updateMe, onSuccess: member => {
    if (useAuthStore.getState().accessToken === token) client.setQueryData(['members', 'me'], member);
  } });
}

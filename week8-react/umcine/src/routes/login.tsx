import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth-store';
import { LoginPage } from '../pages/auth/login-page';
export const Route = createFileRoute('/login')({
  validateSearch: (search): { registered?: boolean } => ({ registered: search.registered === true || search.registered === 'true' ? true : undefined }),
  beforeLoad: () => { if (useAuthStore.getState().accessToken) throw redirect({ to: '/' }); },
  component: LoginPage,
});

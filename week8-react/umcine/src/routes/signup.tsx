import { createFileRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth-store';
import { SignupPage } from '../pages/auth/signup-page';
export const Route = createFileRoute('/signup')({
  beforeLoad: () => { if (useAuthStore.getState().accessToken) throw redirect({ to: '/' }); },
  component: SignupPage,
});

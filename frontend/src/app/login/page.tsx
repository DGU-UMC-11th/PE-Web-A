import { AuthGuard } from "@/components/auth-guard";
import { LoginPage } from "@/features/auth/login-page";

export default function Page() {
  return <AuthGuard guest><LoginPage /></AuthGuard>;
}

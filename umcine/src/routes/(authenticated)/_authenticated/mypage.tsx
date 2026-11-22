import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "../../../pages/auth/account-pages";

export const Route = createFileRoute("/(authenticated)/_authenticated/mypage")({
  component: MyPage,
});

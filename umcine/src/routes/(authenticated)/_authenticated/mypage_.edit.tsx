import { createFileRoute } from "@tanstack/react-router";
import { MyPageEdit } from "../../../pages/auth/account-pages";

export const Route = createFileRoute("/(authenticated)/_authenticated/mypage_/edit")({
  component: MyPageEdit,
});

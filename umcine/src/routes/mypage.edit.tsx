import { createFileRoute } from "@tanstack/react-router";
import { MyPageEdit } from "../pages/auth/account-pages";

export const Route = createFileRoute("/mypage/edit")({
  component: MyPageEdit,
});
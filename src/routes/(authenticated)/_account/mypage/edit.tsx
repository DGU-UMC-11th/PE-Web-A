import { createFileRoute } from "@tanstack/react-router";
import { EditProfilePage } from "../../../../pages/profile/edit-profile-page";

export const Route = createFileRoute("/(authenticated)/_account/mypage/edit")({ component: EditProfilePage });

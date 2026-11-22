import { createFileRoute } from "@tanstack/react-router";
import { EditProfilePage } from "../../../../pages/account/profile-page";

export const Route = createFileRoute("/(auth)/_protected/me/edit")({ component: EditProfilePage });

import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/settings/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Restablecer contraseña | LoadZone",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

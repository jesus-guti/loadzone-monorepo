import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/settings/components/reset-password-form";
import { loadPasswordResetPreview } from "@/features/settings/actions/staff-password-actions";

type ResetPasswordPageProperties = {
  readonly params: Promise<{ token: string }>;
};

export const metadata: Metadata = {
  title: "Nueva contraseña | LoadZone",
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProperties) {
  const { token } = await params;
  const preview = await loadPasswordResetPreview(token);

  if (!preview.ok) {
    return (
      <div className="space-y-3">
        <h1 className="font-semibold text-2xl text-text-primary">
          Enlace no válido
        </h1>
        <p className="text-sm text-text-secondary">{preview.message}</p>
      </div>
    );
  }

  return <ResetPasswordForm rawToken={token} />;
}

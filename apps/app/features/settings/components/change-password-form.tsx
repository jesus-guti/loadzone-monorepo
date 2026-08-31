"use client";

import { Button } from "@repo/design-system/components/button";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import { useState, useTransition } from "react";
import { changeStaffPassword } from "@/features/settings/actions/staff-password-actions";
import { SettingsRow } from "./settings-row";
import { SettingsSection } from "./settings-section";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <SettingsSection title="Contraseña">
      <form
        className="space-y-0"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          startTransition(async () => {
            const result = await changeStaffPassword({
              currentPassword,
              newPassword,
            });
            if (!result.success) {
              setError(result.error ?? "No se pudo cambiar la contraseña.");
              return;
            }
            setCurrentPassword("");
            setNewPassword("");
            toast.success("Contraseña actualizada.");
          });
        }}
      >
        <SettingsRow htmlFor="settings-current-password" label="Contraseña actual">
          <Input
            autoComplete="current-password"
            id="settings-current-password"
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            type="password"
            value={currentPassword}
          />
        </SettingsRow>
        <SettingsRow htmlFor="settings-new-password" label="Nueva contraseña">
          <Input
            autoComplete="new-password"
            id="settings-new-password"
            minLength={8}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            type="password"
            value={newPassword}
          />
        </SettingsRow>
        {error ? (
          <p className="bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        ) : null}
        <div className="flex justify-end border-border-secondary border-t py-3">
          <Button disabled={isPending} size="sm" type="submit">
            Cambiar contraseña
          </Button>
        </div>
      </form>
    </SettingsSection>
  );
}

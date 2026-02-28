import { auth } from "@repo/auth/server";
import { database } from "@repo/database";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateTeamForm } from "./components/create-team-form";

export const metadata: Metadata = {
  title: "Configura tu equipo | LoadZone",
};

const OnboardingPage = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const existing = await database.admin.findUnique({
    where: { clerkId: userId },
  });
  if (existing) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido a LoadZone
          </h1>
          <p className="mt-2 text-muted-foreground">
            Crea tu equipo para empezar a registrar el bienestar de tus
            jugadores.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <CreateTeamForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Podrás añadir jugadores y temporadas desde el panel después de crear
          tu equipo.
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;

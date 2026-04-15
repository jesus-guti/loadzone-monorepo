import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserState } from "@/lib/auth-context";
import { CreateTeamForm } from "./components/create-team-form";

export const metadata: Metadata = {
  title: "Configura tu equipo | LoadZone",
};

const OnboardingPage = async () => {
  const user = await getCurrentUserState();
  if (!user) redirect("/sign-in");
  if (user.memberships.length > 0) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido a LoadZone
          </h1>
          <p className="mt-2 text-muted-foreground">
            Crea tu club y tu primer equipo para empezar a trabajar con tus
            jugadores.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <CreateTeamForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Después podrás añadir jugadores, temporadas, sesiones y formularios
          desde el panel.
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;

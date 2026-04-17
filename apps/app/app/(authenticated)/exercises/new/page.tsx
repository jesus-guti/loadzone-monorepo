import type { ReactElement } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentStaffContext } from "@/lib/auth-context";
import { Header } from "../../components/header";
import { ExerciseForm } from "../components/exercise-form";

export const metadata: Metadata = {
  title: "Nuevo ejercicio | LoadZone",
};

const NewExercisePage = async (): Promise<ReactElement> => {
  const staffContext = await getCurrentStaffContext();
  if (!staffContext?.club) {
    notFound();
  }

  return (
    <>
      <Header page="Nuevo ejercicio" pages={["LoadZone", "Ejercicios"]} />
      <div className="mx-auto w-full max-w-3xl flex-1 p-4 md:p-6">
        <ExerciseForm mode="create" />
      </div>
    </>
  );
};

export default NewExercisePage;

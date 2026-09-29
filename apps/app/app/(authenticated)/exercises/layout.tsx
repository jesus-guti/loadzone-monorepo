import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type ExercisesLayoutProps = {
  readonly children: ReactNode;
};

export default function ExercisesLayout(_props: ExercisesLayoutProps) {
  redirect("/sessions");
}

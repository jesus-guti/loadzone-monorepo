import type { Metadata } from "next";
import { Header } from "@/components/layouts/header";
import { CargaPrototypeScreen } from "@/features/carga/prototype/screen";

export const metadata: Metadata = {
  title: "Carga · prototipo | LoadZone",
};

/** PROTOTYPE — season microcycle sheet. */
export default function CargaPrototypePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Header page="Carga" pages={["LoadZone"]} />
      <CargaPrototypeScreen />
    </div>
  );
}

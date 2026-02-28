import type { Metadata } from "next";
import { Header } from "../../components/header";
import { CreatePlayerForm } from "./form";

export const metadata: Metadata = {
  title: "Nuevo jugador | LoadZone",
};

const NewPlayerPage = () => (
  <>
    <Header page="Nuevo jugador" pages={["LoadZone", "Jugadores"]} />
    <div className="mx-auto max-w-md p-4 pt-0">
      <CreatePlayerForm />
    </div>
  </>
);

export default NewPlayerPage;

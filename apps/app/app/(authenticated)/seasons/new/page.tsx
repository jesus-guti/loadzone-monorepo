import type { Metadata } from "next";
import { Header } from "../../components/header";
import { CreateSeasonForm } from "./form";

export const metadata: Metadata = {
  title: "Nueva temporada | LoadZone",
};

const NewSeasonPage = () => (
  <>
    <Header page="Nueva temporada" pages={["LoadZone", "Temporadas"]} />
    <div className="mx-auto max-w-md p-4 pt-0">
      <CreateSeasonForm />
    </div>
  </>
);

export default NewSeasonPage;

import type { Metadata } from "next";
import { Header } from "../components/header";
import { AnalysisChat } from "./components/analysis-chat";

export const metadata: Metadata = {
  title: "Análisis IA | LoadZone",
};

const AnalysisPage = () => (
  <>
    <Header page="Análisis IA" pages={["LoadZone"]} />
    <div className="flex flex-1 flex-col p-4 pt-0">
      <AnalysisChat />
    </div>
  </>
);

export default AnalysisPage;

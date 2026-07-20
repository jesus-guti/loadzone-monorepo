import { database } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { InstallPrompt } from "../components/install-prompt";
import { TokenPersistence } from "./components/token-persistence";

type TokenLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;

  return {
    manifest: `/manifest.json?token=${encodeURIComponent(token)}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "LoadZone",
      startupImage: [],
    },
  };
}

const TokenLayout = async ({ children, params }: TokenLayoutProperties) => {
  const { token } = await params;

  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: { id: true },
  });

  if (!player) {
    notFound();
  }

  return (
    <>
      <TokenPersistence token={token} />
      {children}
      <InstallPrompt />
    </>
  );
};

export default TokenLayout;

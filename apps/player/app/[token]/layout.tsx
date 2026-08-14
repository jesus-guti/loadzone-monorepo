import { database } from "@repo/database";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { InstallPromptLazy } from "../components/install-prompt-lazy";
import { TokenPersistence } from "./components/token-persistence";
import { isPrototypeLabToken } from "./prototype-dd-05/constants";

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

  // PROTOTYPE lab token skips DB so reviewers can open the throwaway UI without seed data.
  if (isPrototypeLabToken(token)) {
    return <>{children}</>;
  }

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
      <InstallPromptLazy />
    </>
  );
};

export default TokenLayout;

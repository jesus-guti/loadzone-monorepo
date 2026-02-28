import { database } from "@repo/database";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

type TokenLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ token: string }>;
};

const TokenLayout = async ({ children, params }: TokenLayoutProperties) => {
  const { token } = await params;

  const player = await database.player.findUnique({
    where: { token, isArchived: false },
    select: { id: true },
  });

  if (!player) {
    notFound();
  }

  return <>{children}</>;
};

export default TokenLayout;

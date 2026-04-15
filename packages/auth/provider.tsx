"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

type AuthProviderProperties = {
  readonly children: ReactNode;
  privacyUrl?: string;
  termsUrl?: string;
  helpUrl?: string;
};

export const AuthProvider = ({
  children,
}: AuthProviderProperties) => <SessionProvider>{children}</SessionProvider>;

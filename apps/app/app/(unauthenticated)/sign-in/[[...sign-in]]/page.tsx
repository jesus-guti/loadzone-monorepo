import { ProductMark } from "@/components/brand/product-mark";
import { env } from "@/env";
import { SignInCollage } from "@/features/auth/sign-in-collage";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const title = "Welcome back";
const description = "Enter your details to sign in.";
const SignIn = dynamic(() =>
  import("@repo/auth/components/sign-in").then((mod) => mod.SignIn)
);

export const metadata: Metadata = createMetadata({ title, description });

function legalUrl(slug: string): string {
  return new URL(`/es/legal/${slug}`, env.NEXT_PUBLIC_WEB_URL).toString();
}

const SignInPage = () => (
  <div className="grid min-h-dvh lg:grid-cols-2">
    <SignInCollage />
    <div className="flex items-center justify-center bg-bg-primary px-6 py-12">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-8">
        <ProductMark />
        <SignIn
          legalLinks={{
            privacyUrl: legalUrl("privacy"),
            cookiesUrl: legalUrl("cookies"),
            legalNoticeUrl: legalUrl("legal-notice"),
          }}
        />
      </div>
    </div>
  </div>
);

export default SignInPage;

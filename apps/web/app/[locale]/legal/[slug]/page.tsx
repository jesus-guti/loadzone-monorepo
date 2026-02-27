import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type LegalPageProperties = {
  readonly params: Promise<{ slug: string }>;
};

const LEGAL_SLUGS = ["privacy", "terms"] as const;

export const generateMetadata = async ({
  params,
}: LegalPageProperties): Promise<Metadata> => {
  const { slug } = await params;
  if (!LEGAL_SLUGS.includes(slug as (typeof LEGAL_SLUGS)[number])) {
    return {};
  }
  const title = slug === "privacy" ? "Privacy Policy" : "Terms of Service";
  return createMetadata({ title, description: title });
};

export const generateStaticParams = async (): Promise<{ slug: string }[]> =>
  LEGAL_SLUGS.map((slug) => ({ slug }));

const LegalPage = async ({ params }: LegalPageProperties) => {
  const { slug } = await params;
  if (!LEGAL_SLUGS.includes(slug as (typeof LEGAL_SLUGS)[number])) {
    notFound();
  }
  const title = slug === "privacy" ? "Privacy Policy" : "Terms of Service";

  return (
    <div className="container max-w-5xl py-16">
      <Link
        className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm focus:underline focus:outline-none"
        href="/"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Home
      </Link>
      <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight lg:text-5xl">
        {title}
      </h1>
      <p className="mt-6 text-balance leading-7">
        Placeholder content. Replace with your legal pages.
      </p>
    </div>
  );
};

export default LegalPage;

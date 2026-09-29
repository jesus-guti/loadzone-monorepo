import { CaretLeftIcon } from "@phosphor-icons/react/ssr";
import { createMetadata } from "@repo/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type LegalPageProperties = {
  readonly params: Promise<{ locale: string; slug: string }>;
};

const LEGAL_LOCALES = ["es", "en"] as const;

const LEGAL_PAGES = {
  privacy: {
    es: {
      title: "Política de privacidad",
      sections: [
        "Responsable",
        "Datos",
        "Finalidad",
        "Conservación",
        "Cesiones",
        "Derechos",
        "Contacto",
      ],
    },
    en: {
      title: "Privacy policy",
      sections: [
        "Controller",
        "Data",
        "Purpose",
        "Retention",
        "Sharing",
        "Rights",
        "Contact",
      ],
    },
  },
  cookies: {
    es: {
      title: "Política de cookies",
      sections: ["Qué son", "Cuáles usamos", "Cómo gestionarlas"],
    },
    en: {
      title: "Cookie policy",
      sections: ["What they are", "Which we use", "How to manage them"],
    },
  },
  "legal-notice": {
    es: {
      title: "Aviso legal",
      sections: ["Titular", "Objeto", "Propiedad intelectual", "Contacto"],
    },
    en: {
      title: "Legal notice",
      sections: ["Owner", "Purpose", "Intellectual property", "Contact"],
    },
  },
} as const;

type LegalSlug = keyof typeof LEGAL_PAGES;
type LegalLocale = (typeof LEGAL_LOCALES)[number];

function isLegalSlug(slug: string): slug is LegalSlug {
  return slug in LEGAL_PAGES;
}

function isLegalLocale(locale: string): locale is LegalLocale {
  return LEGAL_LOCALES.includes(locale as LegalLocale);
}

export const generateMetadata = async ({
  params,
}: LegalPageProperties): Promise<Metadata> => {
  const { locale, slug } = await params;
  if (!isLegalLocale(locale) || !isLegalSlug(slug)) {
    return {};
  }
  const title = LEGAL_PAGES[slug][locale].title;
  return createMetadata({ title, description: title });
};

export const generateStaticParams = async (): Promise<
  { locale: string; slug: string }[]
> =>
  LEGAL_LOCALES.flatMap((locale) =>
    (Object.keys(LEGAL_PAGES) as LegalSlug[]).map((slug) => ({ locale, slug }))
  );

const LegalPage = async ({ params }: LegalPageProperties) => {
  const { locale, slug } = await params;
  if (!isLegalLocale(locale) || !isLegalSlug(slug)) {
    notFound();
  }

  const page = LEGAL_PAGES[slug][locale];
  const backLabel = locale === "es" ? "Volver al inicio" : "Back to home";

  return (
    <div className="container max-w-5xl py-16">
      <Link
        className="mb-4 inline-flex items-center gap-1 text-muted-foreground text-sm focus:underline focus:outline-none"
        href={`/${locale}`}
      >
        <CaretLeftIcon className="h-4 w-4" />
        {backLabel}
      </Link>
      <h1 className="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight lg:text-5xl">
        {page.title}
      </h1>
      <div className="mt-10 space-y-8">
        {page.sections.map((section) => (
          <section key={section}>
            <h2 className="text-xl font-semibold tracking-tight">{section}</h2>
          </section>
        ))}
      </div>
    </div>
  );
};

export default LegalPage;

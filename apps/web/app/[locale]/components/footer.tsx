import Link from "next/link";
import { env } from "@/env";

const navigationItems = [
  { title: "Home", href: "/" },
  { title: "Blog", href: "/blog" },
  { title: "Legal", href: "/legal/privacy", sub: true },
  { title: "Contact", href: "/contact" },
];

export const Footer = () => (
  <section className="dark border-foreground/10 border-t">
    <div className="w-full bg-background py-20 text-foreground lg:py-40">
      <div className="container mx-auto">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                next-forge
              </h2>
              <p className="max-w-lg text-left text-foreground/75 text-lg leading-relaxed tracking-tight">
                This is the start of something new.
              </p>
            </div>
          </div>
          <div className="grid items-start gap-10 lg:grid-cols-3">
            <div className="flex flex-col items-start gap-1 text-base">
              <div className="flex flex-col gap-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    className="flex items-center justify-between text-xl"
                    href={item.href}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    target={
                      item.href.startsWith("http") ? "_blank" : undefined
                    }
                  >
                    {item.title}
                  </Link>
                ))}
                {env.NEXT_PUBLIC_DOCS_URL && (
                  <Link
                    className="flex items-center justify-between text-foreground/75"
                    href={env.NEXT_PUBLIC_DOCS_URL}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Docs
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

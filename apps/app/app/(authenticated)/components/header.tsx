import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/design-system/components/ui/breadcrumb";
import { Separator } from "@repo/design-system/components/ui/separator";
import { SidebarTrigger } from "@repo/design-system/components/ui/sidebar";
import { Fragment, type ReactNode } from "react";

type HeaderProps = {
  pages: string[];
  page: string;
  children?: ReactNode;
};

export const Header = ({ pages, page, children }: HeaderProps) => (
  <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border-secondary bg-bg-primary px-4 md:px-6">
    <div className="flex min-w-0 items-center gap-2">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-2 h-4" orientation="vertical" />
      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          {pages.map((page, index) => (
            <Fragment key={page}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">{page}</BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <div className="flex items-center gap-2">{children}</div>
  </header>
);

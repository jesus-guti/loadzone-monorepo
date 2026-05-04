"use client";

import { ListIcon } from "@phosphor-icons/react/ssr";
import { useSidebarContext } from "@/hooks/geistdocs/use-sidebar";
import { Button } from "../ui/button";

export const MobileMenu = () => {
  const { isOpen, setIsOpen } = useSidebarContext();

  return (
    <Button
      className="xl:hidden"
      onClick={() => setIsOpen(!isOpen)}
      size="icon-sm"
      variant="ghost"
    >
      <ListIcon className="size-4" />
    </Button>
  );
};

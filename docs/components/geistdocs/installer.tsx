"use client";

import { track } from "@vercel/analytics";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { toast } from "@repo/design-system/components/ui/sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

const COPY_TIMEOUT = 2000;

type InstallerProps = {
  command: string;
  className?: string;
};

export const Installer = ({ command, className = "w-48" }: InstallerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    toast.success("Copied to clipboard");
    setCopied(true);

    track("Copied installer command");
    setTimeout(() => {
      setCopied(false);
    }, COPY_TIMEOUT);
  };

  const Icon = copied ? CheckIcon : CopyIcon;

  return (
    <InputGroup className="h-10 bg-background font-mono shadow-none">
      <InputGroupAddon>
        <InputGroupText className="font-normal text-muted-foreground">
          $
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput className={className} readOnly value={command} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label="Copy"
          onClick={handleCopy}
          size="icon-xs"
          title="Copy"
        >
          <Icon className="size-3.5" size={14} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

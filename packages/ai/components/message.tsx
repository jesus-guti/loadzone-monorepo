import type { UIMessage } from "ai";
import type { ComponentProps } from "react";
import { Streamdown } from "streamdown";
import { twMerge } from "tailwind-merge";

type MessageProps = {
  data: UIMessage;
  markdown?: ComponentProps<typeof Streamdown>;
};

export const Message = ({ data, markdown }: MessageProps) => {
  const textContent = data.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  return (
    <div
      className={twMerge(
        "flex max-w-[80%] flex-col gap-2  px-4 py-2",
        data.role === "user"
          ? "self-end bg-foreground text-background"
          : "self-start bg-muted"
      )}
    >
      <Streamdown {...markdown}>{textContent}</Streamdown>
    </div>
  );
};

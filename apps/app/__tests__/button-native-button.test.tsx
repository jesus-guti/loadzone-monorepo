import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "@repo/design-system/components/button";

const NATIVE_BUTTON_RE =
  /nativeButton|native <button>|acts as a button/i;

async function renderAndCollectErrors(
  element: React.ReactElement
): Promise<string[]> {
  const errors: string[] = [];
  const spy = vi.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args.map(String).join(" "));
  });

  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  root.render(element);
  await Promise.resolve();
  await new Promise((r) => setTimeout(r, 0));
  root.unmount();
  host.remove();
  spy.mockRestore();
  return errors;
}

describe("design-system Button + Base UI nativeButton", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("does not warn when render swaps host to <a> (default nativeButton)", async () => {
    const errors = await renderAndCollectErrors(
      createElement(Button, {
        render: createElement("a", { href: "/wellness" }, "Abrir wellness"),
      })
    );
    expect(errors.some((e) => NATIVE_BUTTON_RE.test(e))).toBe(false);
  });

  it("warns if caller forces nativeButton={true} with non-button render", async () => {
    const errors = await renderAndCollectErrors(
      createElement(Button, {
        nativeButton: true,
        render: createElement("a", { href: "/wellness" }, "Abrir wellness"),
      })
    );
    expect(errors.some((e) => NATIVE_BUTTON_RE.test(e))).toBe(true);
  });

  it("does not warn for plain <button>", async () => {
    const errors = await renderAndCollectErrors(
      createElement(Button, null, "Click")
    );
    expect(errors.some((e) => NATIVE_BUTTON_RE.test(e))).toBe(false);
  });

  it("warns if caller forces nativeButton={false} on a real <button>", async () => {
    const errors = await renderAndCollectErrors(
      createElement(Button, { nativeButton: false }, "Click")
    );
    expect(errors.some((e) => NATIVE_BUTTON_RE.test(e))).toBe(true);
  });
});

import { NotePencilIcon } from "@phosphor-icons/react/ssr";

export function DiagramPlaceholder() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border-primary bg-bg-secondary/40 text-center">
      <NotePencilIcon className="size-10 text-text-tertiary" weight="regular" />
      <div>
        <p className="text-sm font-medium text-text-primary">
          Pizarra interactiva
        </p>
        <p className="text-xs text-text-secondary">
          Próximamente — diseña aquí el croquis del ejercicio.
        </p>
      </div>
    </div>
  );
}

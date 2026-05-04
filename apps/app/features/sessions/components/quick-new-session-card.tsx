import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Button } from "@repo/design-system/components/ui/button";
import { PlusIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export function QuickNewSessionCard() {
  return (
    <Card className="bevel-card rounded-lg border-border-tertiary bg-bg-primary p-5">
      <CardHeader className="px-0 pb-0">
        <CardTitle className="text-base font-semibold text-text-primary">
          Acciones rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-0 pb-0">
        <Button asChild className="mt-4 w-full" size="sm">
          <Link href="/sessions/new">
            <PlusIcon className="mr-1 size-4" />
            Crear nueva sesión
          </Link>
        </Button>
        <div className="flex flex-col gap-2">
          <Link
            className="text-sm text-text-secondary hover:text-text-primary"
            href="/exercises/new"
          >
            Crear ejercicio
          </Link>
          <Link
            className="text-sm text-text-secondary hover:text-text-primary"
            href="/exercises"
          >
            Ver biblioteca de ejercicios
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { Button } from "@repo/design-system/components/ui/button";
import { PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export function QuickNewSessionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Atajos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild size="sm">
          <Link href="/sessions/new">
            <PlusIcon className="mr-1 size-4" />
            Crear nueva sesión
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/exercises/new">
            <PlusIcon className="mr-1 size-4" />
            Crear ejercicio
          </Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href="/exercises">Ver biblioteca de ejercicios</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

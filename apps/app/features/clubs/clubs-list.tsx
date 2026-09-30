"use client";

import { Button } from "@repo/design-system/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/design-system/components/dialog";
import { Input } from "@repo/design-system/components/input";
import { toast } from "@repo/design-system/components/sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { createClubWithCoordinator } from "./actions";

export type ClubListRow = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly memberCount: number;
  readonly pendingCount: number;
};

const SEARCH_MIN = 8;

type ClubsListProperties = {
  readonly clubs: readonly ClubListRow[];
};

async function copyText(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}

export function ClubsList({ clubs }: ClubsListProperties) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [createdClubId, setCreatedClubId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) {
      return clubs;
    }
    return clubs.filter(
      (club) =>
        club.name.toLowerCase().includes(needle) ||
        club.slug.toLowerCase().includes(needle)
    );
  }, [clubs, query]);

  function openCreatedClub(): void {
    if (!createdClubId) {
      return;
    }
    const clubId = createdClubId;
    setLink(null);
    setCreatedClubId(null);
    router.push(`/clubs/${clubId}`);
  }

  function onCreate(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await createClubWithCoordinator(name, email);
      if (!(result.success && result.clubId)) {
        toast.error(result.error ?? "No se pudo crear el club.");
        return;
      }
      setName("");
      setEmail("");
      if (result.acceptUrl) {
        setCreatedClubId(result.clubId);
        setLink(result.acceptUrl);
        return;
      }
      router.push(`/clubs/${result.clubId}`);
    });
  }

  return (
    <div className="mx-auto flex min-w-0 max-w-3xl flex-col gap-8 px-4 py-6 md:px-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-medium text-lg text-text-primary">Clubes</h1>
        <p className="text-sm text-text-secondary">
          Crea un club y el primer coordinador en un solo paso.
        </p>
      </header>

      <form
        className="flex flex-col gap-3 border-b border-border-secondary pb-6"
        onSubmit={onCreate}
      >
        <label
          className="flex flex-col gap-1 text-sm text-text-primary"
          htmlFor="club-name"
        >
          Nombre
          <Input
            autoComplete="off"
            disabled={isPending}
            id="club-name"
            onChange={(event) => {
              setName(event.target.value);
            }}
            placeholder="Atlético Norte"
            required
            value={name}
          />
        </label>
        <label
          className="flex flex-col gap-1 text-sm text-text-primary"
          htmlFor="coordinator-email"
        >
          Email del coordinador
          <Input
            autoComplete="off"
            disabled={isPending}
            id="coordinator-email"
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            placeholder="coordinador@club.test"
            required
            type="email"
            value={email}
          />
        </label>
        <Button disabled={isPending} type="submit">
          Crear club
        </Button>
      </form>

      {clubs.length >= SEARCH_MIN ? (
        <Input
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          placeholder="Buscar club"
          value={query}
        />
      ) : null}

      {clubs.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Todavía no hay clubes. Crea el primero con el nombre y el email del
          coordinador.
        </p>
      ) : (
        <ul>
          {visible.map((club) => (
            <li className="border-t border-border-secondary" key={club.id}>
              <Link
                className="flex flex-col gap-1 py-3"
                href={`/clubs/${club.id}`}
              >
                <span className="text-sm text-text-primary">{club.name}</span>
                <span className="text-xs text-text-secondary">
                  {club.slug} · {club.memberCount} miembros ·{" "}
                  {club.pendingCount} invitaciones pendientes
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            openCreatedClub();
          }
        }}
        open={link !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enlace de invitación</DialogTitle>
            <DialogDescription>
              Copia el enlace y entrégalo. No se envía por correo.
            </DialogDescription>
          </DialogHeader>
          <p className="break-all px-4 text-sm text-text-primary">{link}</p>
          <DialogFooter>
            <Button
              onClick={() => {
                if (!link) {
                  return;
                }
                startTransition(async () => {
                  await copyText(link);
                  toast.success("Enlace copiado.");
                });
              }}
              type="button"
              variant="outline"
            >
              Copiar enlace
            </Button>
            <Button onClick={openCreatedClub} type="button">
              Abrir club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

# `apps/app` operating model

## Objetivo

Definir una forma de trabajo estable para `apps/app` inspirada en n8n, pero adaptada a un desarrollador individual con Cursor.

## Principios

1. Arquitectura ligera, no burocrática.
2. Contratos estrictos en fronteras.
3. UI consistente basada en design system y tokens semánticos.
4. Bugs reproducidos antes del fix cuando el problema no es trivial.
5. Reglas y skills pequeñas, enfocadas y reutilizables.

## Estructura recomendada

```text
apps/app/
  app/                    # layouts, pages, route loading/error, server orchestration
  actions/                # acciones cross-feature del shell
  components/layouts/     # shell admin y navegación
  features/
    <feature>/
      actions/            # mutaciones con Zod
      components/         # UI y estado local
      server/             # queries, mappers, read models
      schemas.ts          # validación del dominio
      types.ts            # contratos locales
      index.ts            # API pública de la feature
  lib/                    # helpers transversales todavía no adscritos a una feature
```

## Reglas de separación

- `page.tsx` y `layout.tsx` leen datos, resuelven permisos y componen.
- `features/*/actions/*` validan, autorizan, mutan y revalidan.
- `features/*/server/*` concentra queries y mappers reutilizables.
- `features/*/components/*` contiene interacción, rendering y estado de UI.
- Un contrato solo sube a un paquete compartido cuando lo consumen al menos dos límites reales.

## Fronteras de tipado

- Nada de `any` en datos de producto.
- Preferir `unknown`, Zod y type guards para JSON, `FormData`, Prisma `Json`, o respuestas externas.
- Si una query Prisma cambia, el DTO asociado debe cambiar en la misma tarea.

## Frontend

- Primero primitives de `@repo/design-system`.
- Después tokens semánticos (`bg-bg-*`, `text-text-*`, `border-border-*`).
- No usar tokens legacy en código nuevo o modificado.
- Durations, debounce y motion viven en constantes compartidas.

## Testing

- Unit/schema: validación, helpers puros y mappers.
- Integration: server actions y flujos con DB.
- E2E: solo rutas doradas y bugs de alto valor.

## Workflow de trabajo

1. Investigar y acotar.
2. Crear plan o spec corto si la tarea no es trivial.
3. Implementar por slices pequeños.
4. Verificar con tests y lint/typecheck proporcionales.
5. Registrar follow-ups si quedan deudas reales.

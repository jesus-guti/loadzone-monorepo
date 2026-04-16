# LoadZone Bootstrap

Flujo pensado para entornos donde puedes resetear la base de datos sin conservar datos previos.

## Comandos

```bash
pnpm db:setup
```

Esto hace dos pasos:

1. `pnpm db:reset`
2. `pnpm db:bootstrap`

## Qué crea el bootstrap

- Formularios base de wellness y RPE
- Un usuario admin con `platformRole = SUPER_ADMIN`
- Un `Club`
- Un `Team`
- Una temporada activa
- Un jugador demo con token para probar el flujo del player

## Variables opcionales

Puedes personalizar el arranque exportando variables antes de ejecutar el comando:

```bash
BOOTSTRAP_ADMIN_EMAIL=admin@tuclub.com
BOOTSTRAP_ADMIN_PASSWORD='TuPasswordSegura123!'
BOOTSTRAP_ADMIN_NAME='Admin Club'
BOOTSTRAP_CLUB_NAME='Mi Club'
BOOTSTRAP_TEAM_NAME='Juvenil A'
BOOTSTRAP_TEAM_CATEGORY='Juvenil'
BOOTSTRAP_SAMPLE_PLAYER_NAME='Jugador Demo'
BOOTSTRAP_CREATE_SAMPLE_PLAYER=true
pnpm db:setup
```

## Valores por defecto

Si no defines variables:

- email admin: `admin@loadzone.local`
- nombre admin: `LoadZone Admin`
- club: `Club Demo`
- equipo: `Primer Equipo`
- categoría: `Senior`
- jugador demo: `Jugador Demo`

Si no defines `BOOTSTRAP_ADMIN_PASSWORD`, el script genera una contraseña aleatoria y la imprime por consola.

## Siguiente paso recomendado

1. Inicia la app de staff y entra con el usuario admin creado.
2. Copia el token del jugador demo que imprime el bootstrap.
3. Abre la app del player con ese token para probar el check-in diario.

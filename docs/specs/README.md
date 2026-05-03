# Specs ligeras para LoadZone

Las specs de este proyecto no son documentación pesada. Son notas de implementación para tareas no triviales.

## Cuándo crear una spec

- Nueva feature con varias pantallas o capas.
- Refactor que toca varios dominios.
- Cambio de contrato entre app, player o API.
- Tarea donde quieras fijar decisiones antes de editar código.

## Plantilla mínima

```md
# Nombre de la tarea

## Objetivo

## Alcance

## Archivos afectados

## Contratos / datos

## Estrategia de tests

## Riesgos

## TODO
- [ ] Paso 1
- [ ] Paso 2
```

## Regla práctica

Si la tarea cabe en tu cabeza y toca pocos archivos, no crees spec. Si ya necesitas reexplicar el contexto al agente o a tu yo futuro, sí.

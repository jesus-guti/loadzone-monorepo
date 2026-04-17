export const COMPLEXITY_OPTIONS = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "VERY_HIGH", label: "Muy alta" },
] as const;

export const STRATEGY_OPTIONS = [
  { value: "SET_PIECES", label: "Acciones a balón parado" },
  { value: "COMBINED_ACTIONS", label: "Acciones combinadas" },
  { value: "CIRCUITS", label: "Circuitos" },
  { value: "CONSERVATION", label: "Conservación" },
  { value: "FOOTBALL_ADAPTED_GAME", label: "Juego adaptado" },
  { value: "POSITIONAL_PLAY", label: "Juego de posición" },
  { value: "SPECIFIC_POSITIONAL_PLAY", label: "Juego de posición específico" },
  { value: "WAVES", label: "Oleadas" },
  { value: "MATCHES", label: "Partidos" },
  { value: "POSSESSION", label: "Posesión" },
  { value: "PASSING_WHEEL", label: "Rondo de pase" },
  { value: "SMALL_SIDED_SITUATIONS", label: "Situaciones reducidas" },
  { value: "LINE_WORK", label: "Trabajo de líneas" },
] as const;

export const COORDINATIVE_SKILL_OPTIONS = [
  { value: "STARTING", label: "Arrancadas" },
  { value: "BRAKING", label: "Frenadas" },
  { value: "CHANGE_OF_DIRECTION", label: "Cambios de dirección" },
  { value: "DRIBBLING_CARRY", label: "Conducción" },
  { value: "BALL_CONTROL", label: "Control de balón" },
  { value: "CLEARANCES", label: "Despejes" },
  { value: "MOVEMENT_PATTERNS", label: "Patrones de movimiento" },
  { value: "SHOOTING", label: "Disparo" },
  { value: "TACKLING", label: "Entradas" },
  { value: "BALANCING", label: "Equilibrio" },
  { value: "TURNING", label: "Giros" },
  { value: "INTERCEPTION", label: "Intercepción" },
  { value: "PASSING", label: "Pase" },
  { value: "PROTECTION", label: "Protección" },
  { value: "DRIBBLING_1V1", label: "Regate 1v1" },
  { value: "JUMPING", label: "Saltos" },
] as const;

export const TACTICAL_INTENTION_OPTIONS = [
  { value: "ONE_VS_ONE", label: "1 vs 1" },
  { value: "TWO_VS_ONE", label: "2 vs 1" },
  { value: "TWO_VS_TWO", label: "2 vs 2" },
  { value: "THREE_VS_THREE", label: "3 vs 3" },
  { value: "FOUR_VS_FOUR", label: "4 vs 4" },
  { value: "DEFENSIVE_SET_PIECES", label: "ABP defensivo" },
  { value: "OFFENSIVE_SET_PIECES", label: "ABP ofensivo" },
  { value: "WIDTH", label: "Amplitud" },
  { value: "SUPPORTS", label: "Apoyos" },
  { value: "ORGANIZED_ATTACK", label: "Ataque organizado" },
  { value: "COVER", label: "Coberturas" },
  { value: "KEEP_POSSESSION", label: "Mantener posesión" },
  { value: "COUNTERATTACK", label: "Contraataque" },
  { value: "BUILD_UP_DEFENSE", label: "Defensa salida balón" },
  { value: "DIRECT_PLAY_DEFENSE", label: "Defensa juego directo" },
  { value: "ORGANIZED_DEFENSE", label: "Defensa organizada" },
  { value: "RUNS_OFF_THE_BALL", label: "Desmarques" },
  { value: "SPLIT_LINES", label: "Romper líneas" },
  { value: "PREVENT_PROGRESSION", label: "Evitar progresión" },
] as const;

export const DYNAMIC_TYPE_OPTIONS = [
  { value: "EXTENSIVE", label: "Extensivo" },
  { value: "STRENGTH", label: "Fuerza" },
  { value: "INTENSIVE_ACTION", label: "Acción intensiva" },
  { value: "INTENSIVE_INTERACTION", label: "Interacción intensiva" },
  { value: "RECOVERY", label: "Recuperación" },
  { value: "ENDURANCE", label: "Resistencia" },
  { value: "SPEED", label: "Velocidad" },
] as const;

export const GAME_SITUATION_OPTIONS = [
  { value: "FULL_STRUCTURE", label: "Estructura completa" },
  { value: "INTERSECTORAL", label: "Intersectorial" },
  { value: "SECTORAL", label: "Sectorial" },
] as const;

export const COORDINATION_TYPE_OPTIONS = [
  { value: "TEAM_COORDINATION", label: "Coordinación de equipo" },
  { value: "SINGLE_PLAYER_COORDINATION", label: "Coordinación individual" },
  { value: "MULTI_PLAYER_COORDINATION", label: "Coordinación entre jugadores" },
] as const;

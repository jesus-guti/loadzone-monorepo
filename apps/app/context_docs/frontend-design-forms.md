
## 1. Aplicación al Formulario: Del Registro Manual a la UX Invisible

Para que un jugador mantenga la constancia durante toda una temporada, el formulario debe pasar de ser una "tarea" a ser un "reflejo".

### Fase Pre-sesión (TQR)

* **Acceso "Zero-Step":** En lugar de que el jugador busque un enlace, el sistema debe lanzar una **Live Activity (iOS)** o un **Widget Interactivo (Android)** 30 minutos antes del entrenamiento. El jugador responde desde la pantalla de bloqueo sin desbloquear el móvil.
* **Input Ergonómico:** Olvida los desplegables. Usa una **escala visual en la "Zona del Pulgar"** (parte inferior). El nivel de agujetas se marca con un deslizamiento fluido (swipe).
* **IA Predictiva:** Si el sensor del smartwatch detectó un sueño pobre (captura pasiva), el campo de "Nivel de energía" aparece pre-rellenado con un valor sugerido (ej. 2/5). El jugador solo confirma.
* **Alerta de Fisioterapia:** El aviso no debe ser un "pop-up" intrusivo. Usa **retroalimentación háptica** (una vibración distinta, más "pesada") cuando el jugador marque el máximo de agujetas, seguida de una confirmación visual suave.

### Fase Post-sesión (RPE)

* **Registro Conversacional (VUI):** Al terminar la sesión, el sistema puede enviar una notificación: *"¿Cómo estuvo hoy?"*. El jugador simplemente responde por voz: *"Fue un 8, bastante duro"* mientras se cambia en el vestuario. El **NLP (Procesamiento de Lenguaje Natural)** traduce eso a la escala de Borg.
* **Cierre del Círculo (Efecto Zeigarnik):** Al completar el RPE, el widget de la pantalla de inicio debe mostrar una animación de "Racha Actual" (ej. "¡7 días seguidos! 🔥"). Esto activa la aversión a la pérdida: el jugador no querrá romper la racha mañana.

---

## 2. Resumen: ¿Qué tener en cuenta al construir estos formularios?

Si quieres que tus formularios de alta frecuencia sobrevivan al abandono, sigue estas directrices basadas en la investigación:

### A. Arquitectura de la Interacción

| Concepto | Aplicación Práctica |
| --- | --- |
| **Ley de Hick** | Máximo 3 preguntas por pantalla. Menos opciones = respuesta más rápida. |
| **Zona del Pulgar** | Botones e inputs siempre en el tercio inferior del móvil (mínimo **44x44 px**). |
| **Validación Inline** | Si hay un error, avisa al instante con micro-copia empática, no al final. |
| **Multimodalidad** | Permite alternar entre voz (VUI) para cuando tienen las manos ocupadas y tacto. |

### B. Psicología del Comportamiento

* **Aumentar la Habilidad ($B = MAP$):** No puedes controlar la motivación del jugador cada día, así que haz que la tarea sea ridículamente fácil. Si toma más de 10 segundos, hay demasiada fricción.
* **Micro-interacciones:** Cada "Guardar" debe ir acompañado de una vibración sutil y una animación de éxito. Esto genera una pequeña descarga de dopamina que refuerza el hábito.
* **UX Agéntica:** El sistema debe "hacer" en lugar de "preguntar". Si el GPS detecta que el jugador salió del club, dispara el prompt del RPE automáticamente.

### C. Diseño Visual y Contenido

* **Micro-copia Directa:** Usa "Guardar Registro" en lugar de "Enviar". El lenguaje debe ser invisible y funcional.
* **Jerarquía Visual:** Usa espacios en blanco para separar los niveles de recuperación de las agujetas. No satures la pantalla con logos del club o textos innecesarios.

> **Nota Crítica:** La mejor interfaz para un deportista de alto rendimiento en 2026 es aquella que no parece una interfaz. Si puedes obtener el dato sin que el jugador toque la pantalla (vía sensores de salud), hazlo.
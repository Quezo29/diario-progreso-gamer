---
name: nueva-spec
description: Escribe una spec nueva en docs/specs/ con reglas DEBE/NO DEBE, criterios verificables y trazabilidad a tickets.
disable-model-invocation: true
---

# /nueva-spec — spec antes que código

1. Lee `AGENTS.md`, el PRD (`docs/prd/`), la épica (`docs/backlog/epicas.md`) y el backlog
   de la épica. Si el comportamiento no está en el PRD, detente y pide la decisión de producto.
2. Crea `docs/specs/<área>-<tema>.md` con:
   - Contexto y alcance.
   - Reglas **DEBE** / **NO DEBE** numeradas.
   - Tabla `criterio → verificación` (test puro, build, revisión manual o curl).
   - Tabla `ticket → archivos` que se van a tocar.
   - Decisiones de borde y supuestos.
3. No escribas código todavía. La spec se commitea primero.
4. Verifica que cada criterio sea observable y que no invente producto fuera de la ficha.
5. Cuando el código exista, agrega la evidencia a `docs/AUDITORIA.md`; no cambies el criterio
   para que “pase”.

Si encuentras un hueco de producto, anótalo como punto abierto; no lo resuelvas escondido en el código.

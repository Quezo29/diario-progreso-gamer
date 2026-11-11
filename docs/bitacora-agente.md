# Bitácora del agente · E2 Metas y rachas

Fecha: 2026-11-10  
Rama: `feature/e2-metas-rachas`  
Base: `main` (`e8e1b8d`)  
Alcance: entrega completa de E2, desde el diagnóstico hasta la evidencia y el despliegue.

Esta bitácora registra cómo se usó el agente, qué decisiones se tomaron, qué se verificó y qué
quedó pendiente. No reemplaza la auditoría: la evidencia criterio por criterio está en
`docs/AUDITORIA.md`.

## 1. Punto de partida

El Proyecto 3 tenía el CRUD de videojuegos, la creación y eliminación de partidas, el resumen
calculado, el frontend XMB y el blueprint de Render. No tenía tests, harness, documentación SDD ni
modelo de metas.

Antes de tocar código se encontró una copia del árbol de trabajo con bytes NUL en varios archivos,
un síntoma de fallo de disco. Se comparó contra `HEAD`, se restauró desde Git y se confirmó que los
builds del Proyecto 3 seguían pasando. No se perdió trabajo previo.

También se detectó que el shim de NVM apuntaba a una instalación incompleta de Node. Todos los
comandos de la entrega se ejecutaron con:

```powershell
$env:PATH = 'C:\Users\Ricardo\AppData\Local\Author Software\nvm\installs\v22.22.0;' + $env:PATH
```

## 2. Harness

Se creó el harness antes de implementar:

- `AGENTS.md` con stack, estructura, comandos, convenciones y reglas.
- `CLAUDE.md` con una sola línea: `@AGENTS.md`.
- `.claude/skills/sdd-diario/SKILL.md` con el flujo SDD y invocación manual.
- `.claude/settings.json` con hooks `PreToolUse` y `PostToolUse`.
- `.claude/hooks/bloquear-env.mjs`, que bloquea `.env` y `.env.*` salvo `.env.example`, con exit 2.
- `.claude/hooks/formatear.mjs`, que ejecuta Prettier sobre el archivo editado.
- `DESIGN.md` con tokens, componentes, accesibilidad, tono y límites visuales.

Los hooks se probaron con el mismo payload que recibe el agente. El intento de abrir `.env`
terminó con exit 2 y el archivo no se abrió; `.env.example` sí se pudo editar. La evidencia está en
`docs/evidencias/hooks.md`.

## 3. Orden SDD

El orden de commits refleja el flujo acordado:

1. `f865371` diagnóstico y deudas del Proyecto 3.
2. `b774be2` harness.
3. `64992f1` PRD con los ocho huecos resueltos.
4. `9ed2ccd` historias INVEST, criterios y tickets.
5. `42fa94b` specs de backend, frontend y edición de partidas.
6. `f745ffe` corrección de la ubicación de los tests.
7. `9bbe2a1` tests de dominio y modelo antes de la implementación.
8. `4ae8bfe` a `cfdc680` implementación por tickets.

La spec se commiteó antes que el código que implementa. Los tests de T-01 y T-02 se escribieron y
committearon antes del modelo y del dominio.

## 4. Decisiones

| Tema | Decisión | Motivo |
| --- | --- | --- |
| Relación de `Meta` | Referenciada desde `Videojuego`; hitos embebidos | La meta tiene ciclo de vida propio e historial; los hitos son una lista corta. |
| Meta activa | Una por juego, con comprobación de servicio e índice único parcial | El mensaje 409 es claro y el índice protege ante carreras. |
| Semana | Lunes a domingo en `America/Guayaquil` | Es la regla de la ficha y evita corrimientos de un día. |
| Fecha de partida | Fecha civil: medianoche UTC es el día elegido; otro instante se convierte a Guayaquil | Conserva los datos del Proyecto 3 y permite registrar sin hora. |
| Meta a mitad de semana | La meta activa actual aplica a toda la semana; no se prorratea | Decisión 4 del PRD, explícita en la ficha. |
| Meta superada | Porcentaje limitado a 100; horas reales visibles | No se oculta el esfuerzo real ni se inventan cifras. |
| Racha | Si hoy no hay partida y ayer sí, sigue viva; si no hay hoy ni ayer, es 0 | Evita castigar un día que todavía no termina. |
| Días y rachas | Días distintos, no partidas; fechas futuras ignoradas | Dos sesiones el mismo día no inflan la constancia. |
| Hitos | Estado derivado del avance actual; puede volver a pendiente | No se guarda un histórico que la ficha no pide. |
| Desactivar | Conserva la meta y sus hitos; deja de mostrarse el porcentaje | Permite crear otra meta sin perder historial. |
| Borrar juego | Cascada de partidas, metas e hitos | Evita datos huérfanos. |
| Capas | Semana, horas, rachas e hitos en `dominio/progreso.ts`; servicios solo consultan | El dominio es puro y testeable sin base de datos. |
| Tests | `backend/tests/` fuera de `src` | `tsc` no incluye los tests en el build de producción. |
| Error de progreso | La sección consulta aparte y muestra su propio error con reintento | Un fallo de progreso no debe ocultar la ficha, los logros o las partidas. |
| Edición de partidas | `GET`/`PUT /api/partidas/:id` y formulario en modo edición | E2 exige recalcular al editar; además paga la deuda P-02/P-09. |
| UI | Solo tokens de `DESIGN.md`, sin librerías | Es una regla del proyecto y de la ficha. |

## 5. Implementación

### Backend

| Ticket | Qué se hizo |
| --- | --- |
| T-01 | Modelo `Meta` con validaciones, hitos embebidos e índice único parcial. |
| T-02 | Dominio puro de semana, horas, días, rachas, porcentaje e hitos. |
| T-03 | CRUD de metas con validación de juego, listado ordenado y 409. |
| T-04 | `GET /api/videojuegos/:id/progreso-semanal` con cálculo en dominio. |
| T-05 | Cascada de metas al borrar un juego y E11000 → 409 en el manejador. |
| T-09 | `GET`/`PUT` de partidas, filtrado de campos, `populate` y fecha civil. |

### Frontend

| Ticket | Qué se hizo |
| --- | --- |
| T-06 | Tipos de meta y progreso, `metasApi.ts` y errores traducidos. |
| T-07 | `ProgresoSemanal` en el detalle, con carga, error, vacío, barra e hitos. |
| T-08 | `FormularioMeta` para crear, editar y desactivar, con validación de cliente. |
| T-09 | Modo edición de partida, enlaces desde detalle y lista, refresco del progreso. |
| Corrección | “Hoy” se calcula en `America/Guayaquil` en `formato.ts`. |

## 6. Problemas encontrados y correcciones

| Problema | Corrección |
| --- | --- |
| Archivos del árbol con bytes NUL | Restauración desde `HEAD`; los builds confirmaron que no se perdió trabajo. |
| NVM con una versión incompleta | Se usó Node 22.22.0 con el `PATH` explícito. |
| El día “hoy” del frontend se calculaba en UTC y podía romper la frase de racha viva | `hoyISO()` usa `America/Guayaquil`; commit `cfdc680`, verificado en navegador. |
| Dos tests de “sin partidas” estaban etiquetados BC-19 en lugar de BC-16 | Se renombraron para que la trazabilidad coincida con la spec. |
| Un error de progreso parecía un error de toda la ficha | La sección maneja su propio error y su reintento; probado interceptando la petición. |
| Capturas de página completa con bandas del fondo fijo | Es un artefacto de la captura; las capturas de viewport son limpias y se documentó en la revisión de diseño. |

## 7. Verificación

```text
backend  npm test       -> 38 passed
backend  npm run build  -> OK
frontend npm run build  -> OK (tsc --noEmit + vite build)
API local               -> 15/15 casos correctos
navegador               -> crear, editar, desactivar, 409, validación, error, edición de partida
320 px                  -> una columna, sin scroll horizontal
```

El escenario de API creó un juego temporal, una meta, una segunda meta (409), consultó, editó,
desactivó, listó, comprobó el progreso sin meta, borró el juego y verificó la cascada. Terminó con
15 de 15 y sin datos residuales. El detalle está en `docs/evidencias/pruebas-curl.md`.

Los tests cubren:

- semana en Guayaquil (domingo 23:30 y lunes 00:30);
- horas con redondeo;
- días distintos;
- porcentaje con tope 100;
- racha viva, racha rota, mejor racha y cruce de semana;
- hitos que se alcanzan y vuelven a pendiente;
- fecha civil, medianoche, hora de Ecuador y sesión que cruza medianoche;
- partida futura;
- ausencia de meta o de partidas;
- errores 400, 404, 409 y 500.

La revisión de diseño y las capturas están en `docs/evidencias/revision-diseno.md` y
`docs/evidencias/capturas/`.

## 8. Commits

| Commit | Contenido |
| --- | --- |
| `f865371` | Diagnóstico del Proyecto 3. |
| `b774be2` | Harness, skills, hooks y `DESIGN.md`. |
| `64992f1` | PRD. |
| `9ed2ccd` | Historias, criterios y tickets. |
| `42fa94b` | Specs. |
| `f745ffe` | Corrección de la ubicación de los tests. |
| `9bbe2a1` | Tests de T-01 y T-02. |
| `4ae8bfe` | Dominio de progreso. |
| `4ff1897` | Modelo Meta. |
| `63c3fe1` | CRUD de metas. |
| `9314a98` | Endpoint de progreso. |
| `cf0d58b` | Cascada y 409. |
| `bd27659` | Edición de partidas en backend. |
| `f5ed2ff` | Tipos y API de metas en frontend. |
| `a6e98db` | Sección de progreso. |
| `a5e3bcb` | Formulario de meta. |
| `a4aec56` | Edición de partidas y refresco. |
| `cfdc680` | Fecha de hoy en Guayaquil. |
| T-10 | Auditoría, README, esta bitácora y revisión de diseño. |

## 9. Deuda y pendientes

Quedaron pagadas las deudas P-01, P-02/P-09, P-03, P-06, P-07/P-10 y P-08 del diagnóstico. Las
demás siguen documentadas en el backlog y en la auditoría: tests de frontend y CI, paginación,
OpenAPI, autenticación, reporte mensual, migración de fechas, analítica y notificaciones.

El único pendiente operativo es el despliegue en Render. En este entorno no hay Render CLI ni
credenciales de Render, así que no se pudo ejecutar ni verificar el despliegue. `render.yaml` está
revisado y las URLs públicas siguen siendo:

- https://diario-gamer-api.onrender.com
- https://diario-gamer-web.onrender.com

Ambas responden 200, pero el bundle actual del frontend no contiene “Progreso de esta semana”: es
el build anterior a E2. Al integrar el pull request a `main`, Render debe reconstruir ambos
servicios. La verificación posterior requiere el panel o una API key, comprobar `/api/salud`, abrir
el frontend, crear una meta y confirmar la conexión a Atlas con Network Access `0.0.0.0/0`.

## 10. Cómo se usó el agente

El agente trabajó con el harness del repositorio y con el flujo SDD como contrato:

1. Leyó `AGENTS.md` y `DESIGN.md` antes de tocar código o estilos.
2. Escribió diagnóstico, PRD, historias, criterios, tickets y specs antes de implementar.
3. Commiteó los documentos y los tests antes del código correspondiente.
4. Implementó por tickets pequeños, con commits `tipo(E2): T-XX …`.
5. Verificó con tests, builds, curl y navegador antes de dar cada ticket por terminado.
6. Dejó la evidencia en `docs/evidencias/` y la trazabilidad en la auditoría.
7. No leyó ni modificó `.env`; el hook lo impidió y solo se usaron variables de proceso para la
   base de verificación.

El agente no reemplazó la revisión humana del producto: las decisiones de alcance, los ocho huecos
y la aceptación visual están documentados para que puedan revisarse en el pull request.

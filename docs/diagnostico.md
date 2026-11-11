# Diagnóstico del Proyecto 3

Fecha: 2026-11-10  
Rama de trabajo: `feature/e2-metas-rachas`  
Alcance: estado real del Diario de Progreso Gamer antes de la épica **E2 · Metas y rachas**.

## 1. Resumen del estado

El Proyecto 3 está funcional y se puede reutilizar como base de E2.

- Backend Express + TypeScript + Mongoose con capas `rutas → controladores → servicios → modelos`.
- Modelos `Videojuego` (con logros embebidos) y `Partida` (referenciada).
- CRUD de videojuegos, creación y eliminación de partidas, listado de partidas por juego,
  actualización de logros y resumen calculado en `GET /api/videojuegos/:id/resumen`.
- Manejo centralizado de errores para 400, 404 y 500, con `requestId`.
- Frontend React + TypeScript + Vite con React Router, servicios de API separados de las
  páginas y una identidad visual inspirada en el menú XMB de PlayStation 3.
- Blueprint de Render con un Web Service para la API y un Static Site para el frontend.
- El repositorio no tiene tests automatizados, harness de agente ni documentación SDD.

Evidencia de la línea base (10/11/2026):

```text
backend  npm run build  -> OK
frontend npm run build  -> OK (tsc --noEmit + vite build)
backend  npm test       -> no existe el script
```

> Nota de entorno: una copia de archivos del árbol de trabajo apareció llena de bytes NUL
> (síntoma de un fallo de disco), pero su contenido era idéntico a `HEAD` salvo los finales de
> línea. Se restauró desde Git antes de empezar y no se perdió trabajo del Proyecto 3.

## 2. Lo que se conserva sin cambios

| Elemento | Decisión |
| --- | --- |
| Modelo `Videojuego` y `Partida` | Se conservan. Solo se ajusta lo necesario para E2 y la deuda diagnosticada. |
| Contrato de `GET /api/videojuegos/:id/resumen` | Se conserva. La regla de “porcentaje actual” se extrae a una función pura reutilizable. |
| Arquitectura por capas | Se conserva: modelos, dominio, servicios, controladores, rutas y middlewares. |
| Manejo centralizado de errores | Se conserva y se amplía con 409 Conflict. |
| Identidad visual XMB | Se conserva y se documenta en `DESIGN.md`. |
| Despliegue en Render + Atlas | Se conserva el blueprint y las URLs del Proyecto 3. |

## 3. Tabla de problemas

Estados: **Bloquea E2** = hay que resolverlo antes o durante la épica; **Se difiere** = queda como deuda documentada.

| ID | Problema encontrado | Impacto | Decisión | Motivo |
| --- | --- | --- | --- | --- |
| P-01 | `Partida.fecha` no distingue fecha civil de instante; el frontend envía medianoche UTC y muestra en UTC, mientras E2 exige semana en `America/Guayaquil`. | Bloquea E2 | **Se arregla** | Sin una regla única de día, la semana y la racha pueden correrse un día. Se define una función de dominio y una normalización en la API. |
| P-02 | No existe edición de partidas: solo `POST` y `DELETE`, y el formulario solo crea. | Bloquea E2 | **Se arregla** | E2 exige volver a consultar el progreso al registrar, **editar** o eliminar una partida. |
| P-03 | No hay runner de tests ni tests automatizados. | Bloquea E2 | **Se arregla** | La rúbrica exige tests de funciones puras y un test por criterio verificable sin base de datos. |
| P-04 | No existe harness de agente (`AGENTS.md`, `CLAUDE.md`, skills, hooks). | Bloquea el proceso | **Se arregla** | Es un entregable explícito de la épica. |
| P-05 | No hay documentación SDD ni trazabilidad de decisiones. | Bloquea el proceso | **Se arregla** | Es un entregable explícito de la épica. |
| P-06 | `errorHandler` no contempla la violación de unicidad (E11000) que puede producir una segunda meta activa. | Bloquea un criterio de la spec | **Se arregla** | El contrato exige 409 Conflict con un mensaje claro, incluso ante una carrera entre dos peticiones. |
| P-07 | `Meta` no existe; no hay índice que garantice una sola meta activa por videojuego. | Bloquea E2 | **Se arregla** | Se agrega el modelo, la validación de servicio y un índice único parcial. |
| P-08 | El borrado de videojuego solo elimina partidas; al agregar metas quedarían huérfanas. | Bloquea E2 | **Se arregla** | La política de eliminación del Proyecto 3 se extiende a `Meta`. |
| P-09 | No hay endpoint de detalle de una partida ni `PUT /api/partidas/:id`. | Bloquea P-02 | **Se arregla** | Hace falta para precargar y guardar el formulario de edición. |
| P-10 | No hay validación de `porcentajeObjetivo` de hitos ni límite de 5 hitos. | Bloquea E2 | **Se arregla** | Son reglas del modelo de datos de la ficha. |
| P-11 | No hay tests de frontend ni CI. | No bloquea la demo | **Se difiere** | Se verifica el frontend con build, revisión manual y revisión de diseño contra `DESIGN.md`. |
| P-12 | No hay paginación en listados ni filtros combinados avanzados. | No bloquea E2 | **Se difiere** | El volumen de un diario personal no lo exige todavía. |
| P-13 | No hay OpenAPI/Swagger ni contrato formal fuera de las specs. | No bloquea E2 | **Se difiere** | Las specs y la auditoría cubren el contrato de esta entrega. |
| P-14 | No hay rate limiting, autenticación ni separación por usuario. | No bloquea E2 (la ficha no pide usuarios) | **Se difiere** | “Metas compartidas entre usuarios” está fuera de alcance; agregar auth cambia el producto. |
| P-15 | No hay métricas de producto ni analítica de las 3 de 4 semanas. | No bloquea E2 | **Se difiere** | La métrica de éxito del PRD se evalúa con uso real, no con un gráfico histórico (fuera de alcance). |

## 4. Decisiones de alcance para E2

### Se completa

1. Modelo `Meta` referenciado con hitos embebidos, validaciones y una sola meta activa.
2. Funciones puras de dominio para semana, horas, días jugados, rachas e hitos.
3. Endpoint `GET /api/videojuegos/:id/progreso-semanal`.
4. CRUD de metas (crear, consultar, listar por juego, actualizar y desactivar).
5. Cascada de borrado de metas al eliminar un videojuego.
6. 409 Conflict claro para la segunda meta activa.
7. Sección de progreso, formulario de meta y acción de desactivar en el detalle del juego.
8. Edición de partidas y refresco del progreso tras crear, editar o eliminar.
9. Harness, documentación SDD, tests, auditoría y trazabilidad en Git.

### Se difiere (deuda técnica)

1. Tests automatizados de frontend y pipeline de CI.
2. Paginación de listados.
3. OpenAPI/Swagger.
4. Autenticación, rate limiting y multiusuario.
5. Analítica histórica de cumplimiento mensual y gráficos (explícitamente fuera de alcance).
6. Migración histórica de fechas si en el futuro se decide que `fecha` sea un instante
   con hora real en lugar de una fecha civil.

## 5. Reglas que E2 no va a romper

- La app sigue siendo de una sola persona; no hay login.
- No se guarda el estado “alcanzado” de un hito: se deriva del avance actual.
- La meta no se embebe en `Videojuego`; se referencia.
- Los hitos sí se embeben en `Meta` porque son una lista corta y acotada.
- El resumen del Proyecto 3 conserva su contrato y su semántica.

## 6. Criterio de salida del diagnóstico

El diagnóstico se considera cerrado cuando:

- `docs/prd/` contiene las reglas de negocio de los 8 huecos de la ficha.
- `docs/backlog/E2-metas-y-rachas.md` contiene historias, criterios y tickets.
- `docs/specs/` contiene las specs de backend, frontend y edición de partidas.
- La rama `feature/e2-metas-rachas` tiene los documentos en Git antes del código que implementan.

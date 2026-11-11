# Backlog E2 · Metas y rachas

Épica: E2 · Metas y rachas  
PRD: `docs/prd/PRD.md`  
Estado de los tickets: cerrados; el detalle de la verificación está en `docs/AUDITORIA.md`.

## 1. Historias de usuario (INVEST)

### E2-H1 · Crear una meta semanal con hitos

**Como** persona que registra sus partidas, **quiero** fijar una meta de horas y días por semana
para un videojuego, con hitos de avance, **para** saber qué me propuse y qué quiero alcanzar.

Criterios:

- **C-H1-01.** DADO un videojuego sin meta activa, CUANDO creo una meta de 5 horas y 4 días con
  tres hitos, ENTONCES el detalle muestra esa meta como activa y conserva los tres hitos.
- **C-H1-02.** DADO un videojuego con una meta activa, CUANDO intento crear otra meta activa,
  ENTONCES la app me explica que ya existe una y la meta original no cambia.
- **C-H1-03.** DADO un formulario con horas menores o iguales a 0, más de 100 horas, días fuera
  de 1 a 7, más de 5 hitos o un objetivo de hito fuera de 1 a 100, CUANDO intento guardar,
  ENTONCES la app rechaza la meta y me dice qué corregir.
- **C-H1-04.** DADO un videojuego que no existe, CUANDO intento crearle una meta, ENTONCES la app
  responde que el videojuego no existe y no crea datos sueltos.

### E2-H2 · Ver el progreso de la semana

**Como** persona que juega, **quiero** ver en el detalle del juego cuánto llevo de mi meta esta
semana, **para** saber si voy a tiempo o me falta jugar.

Criterios:

- **C-H2-01.** DADO que estoy a mitad de semana, CUANDO abro el detalle, ENTONCES la semana
  mostrada empieza el lunes y termina el domingo en hora de Ecuador.
- **C-H2-02.** DADO que registré 210 minutos esta semana, CUANDO abro el detalle, ENTONCES veo
  3,5 horas jugadas y el porcentaje que corresponde a mi meta, redondeado a entero.
- **C-H2-03.** DADO que jugué 7 horas con una meta de 5, CUANDO abro el detalle, ENTONCES el
  porcentaje muestra 100 % y las horas reales siguen siendo 7.
- **C-H2-04.** DADO que registré dos partidas el mismo día, CUANDO abro el detalle, ENTONCES los
  días jugados cuentan ese día una sola vez.
- **C-H2-05.** DADO un juego sin meta activa, CUANDO abro el detalle, ENTONCES veo horas, días y
  rachas de la semana, sin porcentaje de cumplimiento, y una invitación a crear una meta.
- **C-H2-06.** DADO un juego sin partidas, CUANDO abro el detalle, ENTONCES las horas, los días y
  las rachas son 0 y ningún hito está alcanzado.
- **C-H2-07.** DADO que el avance actual del juego es 60 %, CUANDO abro el detalle, ENTONCES los
  hitos de 25 % y 50 % están alcanzados y el de 100 % no.

### E2-H3 · Conocer mi racha

**Como** persona que juega, **quiero** saber cuántos días seguidos llevo jugando y cuál fue mi
mejor racha, **para** entender mi constancia sin que un día sin jugar me castigue de más.

Criterios:

- **C-H3-01.** DADO que ayer jugué y hoy todavía no, CUANDO abro el detalle, ENTONCES mi racha
  sigue viva y cuenta los días hasta ayer.
- **C-H3-02.** DADO que no jugué ni hoy ni ayer, CUANDO abro el detalle, ENTONCES mi racha actual
  es 0 y la mejor racha conserva el máximo histórico.
- **C-H3-03.** DADO que jugué dos veces el mismo día, CUANDO abro el detalle, ENTONCES ese día
  suma una sola vez a la racha.
- **C-H3-04.** DADO un historial con una racha de 9 días y una racha actual de 4, CUANDO abro el
  detalle, ENTONCES veo racha actual 4 y mejor racha 9.
- **C-H3-05.** DADO que la racha cruza un domingo a lunes, CUANDO abro el detalle, ENTONCES la
  racha no se reinicia por el cambio de semana.
- **C-H3-06.** DADO que una partida tiene fecha futura, CUANDO abro el detalle, ENTONCES esa
  partida no infla la racha actual.

### E2-H4 · Editar o desactivar mi meta

**Como** persona que cambia de objetivo, **quiero** editar las horas, los días o los hitos de mi
meta y poder desactivarla con confirmación, **para** que el Diario refleje lo que quiero ahora sin
perder el historial.

Criterios:

- **C-H4-01.** DADO que tengo una meta activa, CUANDO edito sus horas, días o hitos, ENTONCES el
  detalle muestra la meta actualizada y el porcentaje se recalcula con la meta nueva.
- **C-H4-02.** DADO que tengo una meta activa, CUANDO pulso «Desactivar meta», ENTONCES la app me
  pide confirmación y explica que dejaré de ver el porcentaje y los hitos.
- **C-H4-03.** DADO que confirmo la desactivación, CUANDO vuelvo al detalle, ENTONCES no hay meta
  activa, sigo viendo horas, días y rachas, y puedo crear otra meta después.
- **C-H4-04.** DADO que desactivo una meta y creo otra, CUANDO consulto el detalle, ENTONCES solo
  la nueva aparece como activa y la anterior queda como historial.

### E2-H5 · Actualizar el progreso al mover mis partidas

**Como** persona que corrige o elimina una partida, **quiero** que el progreso se vuelva a
consultar después de registrar, editar o eliminar, **para** no mirar cifras viejas.

Criterios:

- **C-H5-01.** DADO que registro una partida desde el detalle, CUANDO vuelvo al detalle, ENTONCES
  las horas, los días, la racha y los hitos reflejan la partida nueva.
- **C-H5-02.** DADO que edito la duración o el avance de una partida, CUANDO guardo, ENTONCES el
  progreso se vuelve a consultar y muestra el cambio.
- **C-H5-03.** DADO que elimino una partida, CUANDO confirmo, ENTONCES el progreso se vuelve a
  consultar y muestra el cambio.
- **C-H5-04.** DADO que edito una partida de otro juego, CUANDO guardo, ENTONCES solo se actualiza
  el progreso del juego al que pertenece la partida.

### E2-H6 · Eliminar un videojuego sin dejar datos huérfanos

**Como** persona que ordena su biblioteca, **quiero** que al eliminar un videojuego se eliminen
también su meta, sus hitos y sus partidas, **para** que no queden datos sueltos que no puedo ver.

Criterios:

- **C-H6-01.** DADO un videojuego con meta e hitos, CUANDO pido eliminarlo, ENTONCES la app
  confirma qué se va a borrar antes de hacerlo.
- **C-H6-02.** DADO que confirmo la eliminación, CUANDO intento consultar su meta, ENTONCES ya no
  existe y el videojuego tampoco.
- **C-H6-03.** DADO que elimino el videojuego, CUANDO reviso el resto de la biblioteca, ENTONCES
  ninguna otra meta ni partida se ve afectada.

## 2. Tickets

Convención de tipos: `backend`, `frontend`, `test`, `docs`.

### T-01 · Modelo Meta con validaciones

- **Tipo:** backend.
- **Cubre:** C-H1-01, C-H1-03, C-H6-02.
- **Depende de:** PRD y spec de backend.
- **Definition of Done:**
  - Modelo `Meta` con videojuego referenciado, horas (0 < h ≤ 100), días enteros (1–7),
    `activa` por defecto `true`, máximo 5 hitos y objetivo de 1–100, y timestamps.
  - Índice único parcial que impide dos metas activas para el mismo videojuego.
  - Tests de validación del modelo sin base de datos.
  - `npm test` y `npm run build` en verde.
  - Commit `feat(E2): T-01 ...`.

### T-02 · Funciones puras de dominio

- **Tipo:** backend + test.
- **Cubre:** C-H2-01 a C-H2-07, C-H3-01 a C-H3-06.
- **Depende de:** PRD, decisiones de los ocho huecos y spec de backend.
- **Definition of Done:**
  - Funciones puras en `backend/src/dominio/progreso.ts` para semana, horas, días, rachas e hitos.
  - Tests escritos antes de la implementación, con un caso por criterio verificable sin base de datos.
  - Casos de borde: duplicados en un día, semana Guayaquil, medianoche, hoy sin partida,
    racha rota, meta superada, hito que baja y partida futura.
  - `npm test` en verde y commit con ticket.

### T-03 · CRUD de metas

- **Tipo:** backend.
- **Cubre:** C-H1-01 a C-H1-04, C-H4-01 a C-H4-04.
- **Depende de:** T-01.
- **Definition of Done:**
  - Crear, consultar por id, listar por videojuego, actualizar y desactivar.
  - Validar que el videojuego exista al crear y al listar.
  - Rechazar la segunda meta activa con un mensaje claro y sin modificar la existente.
  - Rutas y controladores delgados; reglas en el servicio.
  - Documentar los curl de 400, 404, 409 y 201 en `docs/evidencias/pruebas-curl.md`.
  - Commit `feat(E2): T-03 ...`.

### T-04 · Endpoint de progreso semanal

- **Tipo:** backend.
- **Cubre:** C-H2-01 a C-H2-07, C-H3-01 a C-H3-06.
- **Depende de:** T-02, T-03.
- **Definition of Done:**
  - El servicio consulta videojuego, meta activa y partidas; el cálculo vive en dominio.
  - Contrato con `semana`, `meta` o `null`, `horasSemana`, `porcentajeHoras` o `null`,
    `diasJugadosSemana`, `rachaActual`, `mejorRacha` e `hitos`.
  - 404 si el juego no existe; 400 si el id no es válido.
  - Sin meta activa: horas, días y rachas calculados; porcentaje en `null`.
  - Documentar pruebas con curl de juego sin partidas y con racha rota.
  - Commit `feat(E2): T-04 ...`.

### T-05 · Cascada de metas y 409 en el manejador de errores

- **Tipo:** backend.
- **Cubre:** C-H6-01 a C-H6-03, C-H1-02.
- **Depende de:** T-01, T-03.
- **Definition of Done:**
  - Eliminar un videojuego elimina sus partidas, metas e hitos embebidos.
  - El manejador distingue 400, 404, 409 y 500.
  - Un duplicado de índice único también responde 409, no 500.
  - Prueba manual con curl y evidencia en la auditoría.
  - Commit `feat(E2): T-05 ...`.

### T-06 · Tipos y servicio de metas en el frontend

- **Tipo:** frontend.
- **Cubre:** C-H1-01, C-H4-01, C-H4-03.
- **Depende de:** T-03, T-04 y spec de frontend.
- **Definition of Done:**
  - `frontend/src/tipos.ts` incluye `Meta`, hitos y `ProgresoSemanal`.
  - `frontend/src/api/metasApi.ts` concentra CRUD y progreso; ninguna página llama a `fetch`.
  - Errores de API se muestran con el mensaje del backend.
  - `npm run build` en verde.
  - Commit `feat(E2): T-06 ...`.

### T-07 · Sección de progreso semanal en el detalle

- **Tipo:** frontend.
- **Cubre:** C-H2-01 a C-H2-07, C-H3-01 a C-H3-06.
- **Depende de:** T-06.
- **Definition of Done:**
  - Barra de horas frente a la meta, días jugados frente a días objetivo, racha actual, mejor
    racha e hitos con su estado.
  - Estados de carga, error y vacío; el vacío invita a crear una meta.
  - Sin meta activa no se inventa un porcentaje.
  - Estilos solo con tokens de `DESIGN.md`.
  - Revisión de diseño documentada y `npm run build` en verde.
  - Commit `feat(E2): T-07 ...`.

### T-08 · Formulario de meta y desactivación

- **Tipo:** frontend.
- **Cubre:** C-H1-01 a C-H1-03, C-H4-01 a C-H4-04.
- **Depende de:** T-06, T-07.
- **Definition of Done:**
  - Crear y editar meta con horas, días y hasta 5 hitos.
  - Validación en cliente con mensajes claros; el backend sigue siendo la autoridad.
  - Acción «Desactivar meta» con confirmación y refresco del detalle.
  - Sin meta activa, el detalle ofrece crearla.
  - `npm run build` en verde.
  - Commit `feat(E2): T-08 ...`.

### T-09 · Edición de partidas y refresco del progreso (deuda pagada)

- **Tipo:** backend + frontend + deuda.
- **Cubre:** C-H5-01 a C-H5-04, P-01, P-02, P-09 del diagnóstico.
- **Depende de:** T-04, T-06.
- **Definition of Done:**
  - `PUT /api/partidas/:id` y `GET /api/partidas/:id` con validaciones del Proyecto 3.
  - Formulario de partida en modo edición; enlaces desde el detalle y la lista.
  - El formulario envía la fecha como fecha civil y el detalle refresca el progreso.
  - Tests puros de la regla de fecha civil (medianoche, cambio de día en Guayaquil).
  - Commit `test(E2): T-09 ...` antes del código cuando aplique, y `feat(E2): T-09 ...`.
  - Evidencia en la auditoría.

### T-10 · Auditoría, README y despliegue

- **Tipo:** docs.
- **Cubre:** proceso SDD completo.
- **Depende de:** T-01 a T-09.
- **Definition of Done:**
  - `docs/AUDITORIA.md` con una fila por criterio de las specs, verificación y evidencia.
  - Backlog con tickets marcados.
  - README con E2, harness y URLs.
  - `render.yaml` y `.env.example` actualizados sin secretos.
  - Pull request con tickets y enlace a la auditoría.
  - Commit `docs(E2): T-10 ...`.

## 3. Estado final de los tickets

| Ticket | Estado | Evidencia |
| --- | --- | --- |
| T-01 | Hecho | `4ff1897`; `backend/tests/meta.model.test.ts` |
| T-02 | Hecho | `4ae8bfe`; `backend/tests/progreso.test.ts` |
| T-03 | Hecho | `63c3fe1`; curl de CRUD y 409 |
| T-04 | Hecho | `9314a98`; curl de progreso |
| T-05 | Hecho | `cf0d58b`; curl de cascada y tests del errorHandler |
| T-06 | Hecho | `f5ed2ff`; `frontend/src/api/metasApi.ts` y build |
| T-07 | Hecho | `a6e98db`; capturas del detalle y revisión de diseño |
| T-08 | Hecho | `a5e3bcb`; formulario, validación y desactivación |
| T-09 | Hecho | `bd27659` y `a4aec56`; curl de partidas y edición desde la UI |
| T-10 | Hecho | `docs/AUDITORIA.md`, `docs/bitacora-agente.md`, README, PR #2 y despliegue verificado en `f475c92` |

**Resultado:** 46 de 46 criterios de spec verificados, 38 tests de backend, builds de backend y
frontend en verde, 15 de 15 casos de API, revisión de diseño aprobada y despliegue verificado en
Render. La API y el frontend públicos sirven el build de E2; la evidencia está en
`docs/AUDITORIA.md` §7 y `docs/evidencias/capturas/produccion-render.jpeg`.

## 4. Trazabilidad rápida

| Historia | Criterios | Tickets | Spec |
| --- | --- | --- | --- |
| E2-H1 | C-H1-01 a C-H1-04 | T-01, T-03, T-06, T-08 | Backend, frontend |
| E2-H2 | C-H2-01 a C-H2-07 | T-02, T-04, T-07 | Backend, frontend |
| E2-H3 | C-H3-01 a C-H3-06 | T-02, T-04, T-07 | Backend, frontend |
| E2-H4 | C-H4-01 a C-H4-04 | T-03, T-06, T-08 | Backend, frontend |
| E2-H5 | C-H5-01 a C-H5-04 | T-04, T-09 | Backend, frontend, edición |
| E2-H6 | C-H6-01 a C-H6-03 | T-01, T-05 | Backend |

## 5. Deuda técnica

| ID | Deuda | Motivo para diferir |
| --- | --- | --- |
| D-01 | Tests automatizados de frontend y pipeline de CI. | El frontend se verifica con `tsc`, build, revisión manual y revisión de diseño; montar CI excede el tiempo de la entrega. |
| D-02 | Paginación de biblioteca y partidas. | Un diario personal no llega a volúmenes que rompan la pantalla; se puede agregar sin cambiar el contrato de dominio. |
| D-03 | OpenAPI/Swagger. | Las specs y la auditoría documentan el contrato de E2; un OpenAPI generado sería la siguiente mejora. |
| D-04 | Autenticación, rate limiting y multiusuario. | La ficha excluye metas compartidas; agregar login cambia el producto y el modelo. |
| D-05 | Reporte histórico de cumplimiento mensual (3 de 4 semanas) y gráficos. | Es una métrica de éxito del PRD, no una funcionalidad de E2; los gráficos están fuera de alcance. |
| D-06 | Migración de fechas si se adopta hora real por partida. | Hoy la fecha es civil (S-01). Migrar sin una necesidad de producto agrega riesgo y no cambia la semana actual. |
| D-07 | Analítica de producto y notificaciones. | Notificaciones y recordatorios están fuera de alcance por ficha. |

### Deuda pagada en esta épica

| ID del diagnóstico | Deuda pagada | Ticket |
| --- | --- | --- |
| P-01 | Regla de fecha civil y conversión a `America/Guayaquil`. | T-02, T-09 |
| P-02 / P-09 | Edición y consulta de una partida. | T-09 |
| P-03 | Vitest y tests de dominio/modelo. | T-02 |
| P-06 | 409 para duplicado de meta activa. | T-05 |
| P-07 / P-10 | Modelo Meta, validaciones e índice único parcial. | T-01 |
| P-08 | Cascada de metas al eliminar un videojuego. | T-05 |

La verificación de cada deuda pagada, con su criterio y su evidencia, está en
`docs/AUDITORIA.md` §8. Las deudas D-01 a D-07 siguen abiertas y no bloquean la entrega.

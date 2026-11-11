# Auditoría E2 · Metas y rachas

Fecha: 2026-11-10  
Rama: `feature/e2-metas-rachas`, integrada en `main` (`f475c92`)  
Base: `main` (`e8e1b8d`)  
Alcance: criterios BC-01 a BC-21, FC-01 a FC-16 y PC-01 a PC-09 de las specs de E2.

## 1. Resultado

| Comprobación | Resultado |
| --- | --- |
| Criterios de spec verificados localmente | **46 de 46** |
| Tests de backend | **38 pasan** (26 dominio, 7 modelo, 5 manejador de errores) |
| Build de backend | Pasa (`tsc`) |
| Build de frontend | Pasa (`tsc --noEmit && vite build`) |
| Escenario de API | **15 de 15** casos correctos, sin datos residuales |
| Revisión en navegador | Crear, editar, desactivar, 409, validación, error aislado, edición de partida, 320 px |
| Revisión de diseño | Aprobada en `docs/evidencias/revision-diseno.md` |
| Despliegue en Render | **Verificado en producción** el 2026-11-10 a las 20:02 (hora local); ver §7 |

La épica está integrada en `main` mediante el PR #2 (`f475c92`) y Render reconstruyó ambos
servicios. La verificación de producción confirmó el bundle nuevo del frontend y la ruta de
progreso semanal de la API. No quedan pendientes de código ni de despliegue.

## 2. Método y entorno

Los comandos se ejecutaron con el Node real de la máquina, porque el shim de NVM apuntaba a una
versión incompleta:

```powershell
$env:PATH = 'C:\Users\Ricardo\AppData\Local\Author Software\nvm\installs\v22.22.0;' + $env:PATH
```

La API local se levantó en `http://localhost:3100` con `MONGODB_DB=diario_gamer_e2_verificacion`,
sin leer ni modificar `backend/.env`. El frontend se revisó en `http://localhost:5173` contra esa
API. Los scripts de prueba crearon y borraron sus propios juegos; no se usaron credenciales en
texto plano ni se imprimió la URI de Atlas.

Evidencia principal:

- `docs/evidencias/pruebas-curl.md`: flujo funcional y matriz de 15 casos de API.
- `docs/evidencias/revision-diseno.md`: revisión visual, accesibilidad y responsive.
- `docs/evidencias/hooks.md`: verificación del harness y de los hooks.
- `docs/evidencias/capturas/`: cinco capturas del detalle y del error de progreso, más
  `produccion-render.jpeg` de la verificación en producción.
- `backend/tests/progreso.test.ts`, `meta.model.test.ts`, `errorHandler.test.ts`.

## 3. Matriz de backend (BC-01 a BC-21)

| Criterio | Verificación realizada | Evidencia | Resultado |
| --- | --- | --- | --- |
| **BC-01** Validaciones de Meta: horas 0 < h ≤ 100, días enteros 1–7, hitos con descripción y objetivo 1–100 | Siete tests de validación sin base de datos, incluidos límites y meta sin hitos | `backend/tests/meta.model.test.ts` | Pasa |
| **BC-02** Una sola meta activa por juego y 409 | Comprobación previa en el servicio, índice único parcial y traducción de E11000 a 409; curl de segunda meta | `metas.service.ts`, `Meta.model.ts`, `errorHandler.test.ts`, `pruebas-curl.md` §2 | Pasa |
| **BC-03** Crear meta válida devuelve 201 | POST con 5 h, 4 días y dos hitos | `pruebas-curl.md` §2 y matriz final | Pasa |
| **BC-04** Consultar, listar, actualizar y desactivar | GET por id, GET por juego, PUT y PATCH idempotente | Matriz final de `pruebas-curl.md` | Pasa |
| **BC-05** Juego inexistente devuelve 404 | POST de meta con ObjectId válido que no existe | Matriz final de `pruebas-curl.md` | Pasa |
| **BC-06** Id inválido devuelve 400 | GET de meta con `abc` | Matriz final de `pruebas-curl.md` | Pasa |
| **BC-07** Semana de lunes a domingo en Guayaquil | Casos de domingo 23:30 y lunes 00:30 en `America/Guayaquil` | `progreso.test.ts`, 3 tests BC-07 | Pasa |
| **BC-08** Horas con redondeo a 1 decimal | 210 minutos → 3,5 h; partidas fuera de la semana no suman | `progreso.test.ts`, 2 tests BC-08 | Pasa |
| **BC-09** Porcentaje entero y limitado a 100 | 7 h / 5 h → 100 con horas reales; redondeo entero | `progreso.test.ts`, 2 tests BC-09 | Pasa |
| **BC-10** Días distintos, no partidas | Dos partidas del mismo día → 1 día | `progreso.test.ts`, test BC-10 | Pasa |
| **BC-11** Racha con gracia de hoy | Hoy sin partida y ayer con partida → racha viva hasta ayer | `progreso.test.ts`, test BC-11 | Pasa |
| **BC-12** Racha rota | Hoy y ayer sin partida → racha actual 0 y mejor histórica intacta | `progreso.test.ts`, test BC-12 | Pasa |
| **BC-13** Mejor racha histórica y cruce de domingo a lunes | Historial de 9 días, racha de 4, cruce de semana y dos partidas el mismo día | `progreso.test.ts`, 3 tests BC-13 | Pasa |
| **BC-14** Hitos derivados y que bajan al bajar el avance | Avance 60 % con hitos 25/50/100; avance posterior menor devuelve un hito a pendiente | `progreso.test.ts`, 3 tests BC-14 | Pasa |
| **BC-15** Sin meta activa: `meta` y `porcentajeHoras` en null | Test puro y curl tras desactivar; horas, días y rachas se siguen calculando | `progreso.test.ts` y matriz final de `pruebas-curl.md` | Pasa |
| **BC-16** Sin partidas: ceros y ningún hito | Test puro y curl de juego vacío; también sin meta | `progreso.test.ts`, 2 tests BC-16; `pruebas-curl.md` | Pasa |
| **BC-17** Fecha civil y sesión que cruza medianoche | Medianoche UTC, instante de Ecuador y sesión 23:30–00:30 | `progreso.test.ts`, 3 tests BC-17 | Pasa |
| **BC-18** Cascada de metas al borrar el juego | Borrar juego, consultar meta y progreso: ambos 404 | Matriz final de `pruebas-curl.md` | Pasa |
| **BC-19** 400/404/409/500 centralizados | Cinco tests del manejador: ApiError 409, ValidationError, CastError, E11000 y 500 sin stack; curl de 400, 404 y 409 | `errorHandler.test.ts`, `pruebas-curl.md` | Pasa |
| **BC-20** Dominio sin base de datos | `backend/src/dominio` no importa Mongoose ni usa modelos, `find*` o `save` | Revisión de código con búsqueda sin coincidencias | Pasa |
| **BC-21** Resumen del Proyecto 3 sin cambios de contrato | Test del desempate por `createdAt` de la última partida y build del backend | `progreso.test.ts`, test BC-21; `npm run build` | Pasa |

## 4. Matriz de frontend (FC-01 a FC-16)

| Criterio | Verificación realizada | Evidencia | Resultado |
| --- | --- | --- | --- |
| **FC-01** Tipos coherentes con el backend | `Meta`, `HitoMeta`, `HitoProgreso` y `ProgresoSemanal` compilan contra los servicios | `frontend/src/tipos.ts`; `npm run build` | Pasa |
| **FC-02** `metasApi.ts` separado y sin `fetch` en páginas | Búsqueda de `fetch(` en `frontend/src/paginas` sin coincidencias; CRUD y progreso en `metasApi.ts` | Revisión de código | Pasa |
| **FC-03** Sección visible en el detalle | La sección aparece antes de logros, resumen y partidas | `detalle-con-meta.jpeg` y `detalle-sin-meta.jpeg` | Pasa |
| **FC-04** Estados de carga, error y vacío | “Calculando tu semana…”, error con `role="alert"` y “Reintentar”, vacío sin meta y sin partidas | `progreso-error.jpeg`; revisión en navegador | Pasa |
| **FC-05** Sin meta activa: datos de semana e invitación | Horas, días y rachas visibles, sin barra ni hitos, con “Crear meta” | `detalle-sin-meta.jpeg` | Pasa |
| **FC-06** Horas, barra y porcentaje con tope 100 | 9 h reales frente a meta de 5 h: barra y texto al 100 %, horas reales conservadas | `detalle-con-meta.jpeg` | Pasa |
| **FC-07** Días, rachas e hitos con estado textual | 2/4 días, racha actual 2, mejor racha 2 y hitos “Alcanzado”/“Pendiente” | `detalle-con-meta.jpeg` | Pasa |
| **FC-08** Crear meta con hitos | Formulario con horas, días y dos o tres hitos; el detalle muestra la meta creada | Navegador y `pruebas-curl.md` §1 | Pasa |
| **FC-09** Editar meta y recalcular | Meta cambiada a 12 h / 5 días; el detalle muestra 10 h y 83 % sin recargar a mano | `detalle-meta-editada.jpeg` | Pasa |
| **FC-10** Desactivar con confirmación | Diálogo con el texto de la spec; al confirmar desaparecen porcentaje, barra e hitos y se conservan horas, días y rachas | Navegador; `ProgresoSemanal.tsx`; `pruebas-curl.md` | Pasa |
| **FC-11** Validación de cliente | Horas ≤ 0 o > 100, días fuera de 1–7, hito vacío y objetivo fuera de 1–100 se rechazan antes de enviar | Navegador; `FormularioMeta.tsx` | Pasa |
| **FC-12** Refresco tras crear, editar y eliminar partida | Los tres flujos vuelven al detalle y consultan el progreso; la eliminación refresca partidas, resumen y progreso | Navegador; `DetalleVideojuego.tsx`; `FormularioPartida.tsx` | Pasa |
| **FC-13** Solo tokens de `DESIGN.md` | Revisión clase por clase de los estilos nuevos; sin colores, fuentes ni sombras inventadas | `revision-diseno.md` §2 | Pasa |
| **FC-14** Accesibilidad básica | `<label>` asociados, `fieldset`/`legend`, `role="progressbar"` con `aria-valuenow`, estado textual, `role="alert"` y foco visible | `revision-diseno.md` §4; revisión de código | Pasa |
| **FC-15** Responsive a 320 px | Una columna, métricas apiladas, sin scroll horizontal en el detalle | `movil-320.jpeg`; `revision-diseno.md` §5 | Pasa |
| **FC-16** Build de producción | `npm run build` en `frontend/` | Salida de build | Pasa |

## 5. Matriz de edición de partidas (PC-01 a PC-09)

| Criterio | Verificación realizada | Evidencia | Resultado |
| --- | --- | --- | --- |
| **PC-01** GET de partida existente | 200 con `{ partida, requestId }` y videojuego populado | `pruebas-curl.md` §2 | Pasa |
| **PC-02** GET con id inválido → 400 | `GET /api/partidas/abc` | `pruebas-curl.md` §2 | Pasa |
| **PC-03** GET de partida inexistente → 404 | ObjectId válido no registrado | `pruebas-curl.md` §2 | Pasa |
| **PC-04** PUT actualiza duración y avance | Tercera partida a 420 min y 85 %; el progreso pasó a 15 h | `pruebas-curl.md` §2; navegador | Pasa |
| **PC-05** PUT con videojuego inexistente → 404 | Cambio de referencia a un ObjectId válido no registrado | `pruebas-curl.md` §2 | Pasa |
| **PC-06** PUT con validación inválida → 400 | `porcentajeAvance: 101` | `pruebas-curl.md` §2 | Pasa |
| **PC-07** Fecha civil a medianoche UTC | Test de fecha `T00:00:00.000Z` interpretada como día civil | `progreso.test.ts`, test BC-17 | Pasa |
| **PC-08** Fecha con hora de Ecuador | Test de instante convertido a `America/Guayaquil` | `progreso.test.ts`, test BC-17 | Pasa |
| **PC-09** Sesión que cruza medianoche | Sesión 23:30–00:30 cuenta para el día en que empezó | `progreso.test.ts`, test BC-17 | Pasa |

## 6. Verificaciones de proceso

| Elemento | Comprobación | Resultado |
| --- | --- | --- |
| Diagnóstico | `docs/diagnostico.md` con P-01 a P-15 y deudas pagadas/diferidas | Completo |
| PRD | `docs/prd/PRD.md` con los ocho huecos resueltos y supuestos S-01 a S-08 | Completo |
| Historias y criterios | `docs/backlog/E2-metas-y-rachas.md` con E2-H1 a E2-H6, C-H1 a C-H6 | Completo |
| Tickets | T-01 a T-10 con DoD y trazabilidad a historias y specs | Completo |
| Specs antes del código | Commits `64992f1`, `9ed2ccd`, `42fa94b` y `f745ffe` anteriores a `9bbe2a1` y al código de T-01 a T-09 | Cumple |
| Harness | `AGENTS.md`, `CLAUDE.md`, skills, hooks y `DESIGN.md`; bloqueo de `.env` verificado con exit 2 | `docs/evidencias/hooks.md` |
| Tests fuera del build | `backend/tests/` no entra en `tsc`; `npm test` usa Vitest | Cumple |
| Secretos | `.env.example` solo tiene placeholders; `.env` no se leyó ni se versionó | Cumple |
| README | Modelo Meta, API, frontend, despliegue, harness y flujo de demo | Completo |
| Blueprint | `render.yaml` con API, static site, rewrite y variables sin secretos | Revisado |
| Commits pequeños | Un commit por ticket o por corrección, con el formato `tipo(E2): T-XX …` | Cumple |

## 7. Despliegue

### Verificado en local

| Servicio | Comprobación | Resultado |
| --- | --- | --- |
| API | `GET /api/salud` en `http://localhost:3100` | 200 `{ estado: "ok" }` |
| Frontend | `http://localhost:5173` | 200 |
| Atlas | Conexión usada por la API local con `diario_gamer_e2_verificacion` | Funciona; no se imprimió la URI |
| Blueprint | Revisión de `render.yaml`; `MONGODB_URI` con `sync: false` | Sin secretos |

### Verificado en producción

El despliegue se disparó al fusionar el PR #2 (`f475c92`) el 2026-11-11T01:01:42Z. Render
reconstruyó ambos servicios y el bundle nuevo apareció a las 20:02 (hora local).

| Servicio | Comprobación | Resultado |
| --- | --- | --- |
| API | `GET /api/salud` | 200 `{ estado: "ok" }` |
| API | `GET /api/videojuegos/abc/progreso-semanal` | 400 con mensaje de id inválido; confirma que la ruta de E2 está desplegada |
| API | `GET /api/videojuegos` y progreso de un juego existente | 200, semana `2026-11-09` a `2026-11-15`, meta, racha e hitos en el contrato nuevo |
| Frontend | `https://diario-gamer-web.onrender.com` | 200, bundle `index-DY79RgsB.js` y CSS `index-BFzI31hp.css` |
| Bundle | Búsqueda de “Progreso de esta semana”, “Crear meta” y la URL pública de la API | Las tres cadenas están presentes |
| Navegador | Detalle de un juego en producción | La sección “Progreso de esta semana” se ve, sin errores en consola |
| Atlas | Lectura de los dos juegos existentes | Responde con datos reales; no se escribieron datos de prueba |

La captura de la verificación en producción está en
`docs/evidencias/capturas/produccion-render.jpeg`. No se crearon ni borraron datos en producción:
las comprobaciones fueron de lectura.

## 8. Deuda

### Pagada en E2

| Deuda | Cómo se pagó | Ticket |
| --- | --- | --- |
| P-01 Fecha civil y zona horaria | `diaDePartida` y pruebas de medianoche, Ecuador y cruce de medianoche | T-02, T-09 |
| P-02 / P-09 Edición y consulta de partidas | `GET`/`PUT /api/partidas/:id`, formulario en modo edición y refresco | T-09 |
| P-03 Tests y runner | Vitest y 38 tests de dominio, modelo y errores | T-01, T-02, T-05 |
| P-06 409 para duplicado | Comprobación de servicio, E11000 y respuesta 409 | T-05 |
| P-07 / P-10 Modelo Meta | Validaciones e índice único parcial | T-01 |
| P-08 Cascada | Borrado de metas junto con el videojuego | T-05 |

### Diferida

| ID | Deuda | Estado |
| --- | --- | --- |
| D-01 | Tests automatizados de frontend y CI | Abierta; se compensa con build, revisión manual y revisión de diseño |
| D-02 | Paginación de listados | Abierta |
| D-03 | OpenAPI/Swagger | Abierta |
| D-04 | Autenticación, rate limiting y multiusuario | Abierta; fuera de alcance del producto |
| D-05 | Reporte mensual de 3 de 4 semanas y gráficos | Abierta; fuera de alcance de E2 |
| D-06 | Migración si la fecha pasa a ser un instante con hora real | Abierta; depende de una decisión futura |
| D-07 | Analítica y notificaciones | Abierta; fuera de alcance |

## 9. Trazabilidad de commits

| Ticket | Commit |
| --- | --- |
| Diagnóstico | `f865371` |
| Harness | `b774be2` |
| PRD | `64992f1` |
| Historias, criterios y tickets | `9ed2ccd` |
| Specs | `42fa94b`, `f745ffe` |
| T-01 / T-02 (tests primero) | `9bbe2a1` |
| T-02 | `4ae8bfe` |
| T-01 | `4ff1897` |
| T-03 | `63c3fe1` |
| T-04 | `9314a98` |
| T-05 | `cf0d58b` |
| T-09 backend | `bd27659` |
| T-06 | `f5ed2ff` |
| T-07 | `a6e98db` |
| T-08 | `a5e3bcb` |
| T-09 frontend | `a4aec56` |
| Corrección de fecha de hoy | `cfdc680` |
| T-10 documentación | Commit de este documento y del README |

## 10. Conclusión

E2 cumple los 46 criterios de verificación de sus tres specs, con tests puros para las reglas de
negocio, un escenario de API reproducible, build de producción, revisión de diseño y despliegue
verificado. La deuda de fecha civil y la edición de partidas quedaron pagadas; el resto sigue
documentado.

El PR #2 se integró a `main` como `f475c92` y Render reconstruyó la API y el frontend. La
verificación de producción confirmó la ruta de progreso semanal, el bundle nuevo y la sección de
progreso en el navegador. No quedan pendientes operativos de esta épica.

## 11. Corrección posterior: transición del tono

El fondo cambiaba de matiz con un intervalo de cinco minutos y una transición de 300 s, lo que en
la práctica se percibía como saltos entre colores. Se reemplazó por una animación CSS continua de
1800 s (`deriva-tono`) sobre la propiedad registrada `--tono`, con interpolación entre los valores
272, 222, 198, 152, 38, 338 y vuelta a 272.

| Comprobación | Resultado |
| --- | --- |
| Regla CSS válida | `animation: deriva-tono 1800s linear infinite` aplicada en `.xmb` |
| Interpolación | Muestreo pausado: 272 → 247 → 222 → 210 → 198 → 175 → 152 → 38 → 338 → 272 |
| Movimiento reducido | `prefers-reduced-motion: reduce` deja `--tono: 272` y `animation: none` |
| Build de frontend | Pasa (`tsc --noEmit && vite build`) |
| Despliegue en Render | PR #4 (`8cce99b`); CSS `index-fk82l1f3.css` con `deriva-tono` y `1800s` |
| Producción | Muestreo con la animación pausada en el sitio publicado: 272 → 222 → 198 → 152 → 38 → 338; sin errores de consola |

El primer intento usó `30min`, una unidad no válida en CSS; el navegador descartaba la animación
completa. La corrección a `1800s` quedó verificada en el navegador, desplegada en producción y
documentada en `DESIGN.md`.

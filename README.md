# Diario de Progreso Gamer

Aplicación web para que cada estudiante lleve el control de los videojuegos que tiene, las partidas que juega y un resumen calculado de su progreso real. La pregunta que responde es: ¿qué estoy jugando ahora, cuánto le he dedicado y qué tan avanzado voy?

La entrega **E2 · Metas y rachas** agrega una meta semanal por videojuego, con horas, días e
hitos, y calcula el progreso de la semana, la racha actual y la mejor racha en
`America/Guayaquil`. También permite editar partidas para que el progreso se vuelva a consultar
después de registrar, editar o eliminar una sesión.

El proyecto sigue el mismo criterio de modelado del Departamento de Parques y Fenómenos Inexplicables de Pawnee (Criatura + Avistamiento), en un dominio distinto y con una pieza nueva: el backend no solo guarda eventos, también calcula un resumen y un progreso semanal a partir de ellos.

Esta carpeta es independiente de `pawnee-app-main`.

## Modelo de datos

### Videojuego

Ficha de cada juego. Los logros viven dentro del documento.

```
Videojuego
├─ nombre: string (obligatorio)
├─ plataforma: "PC" | "PlayStation" | "Xbox" | "Switch" | "Movil"
├─ genero: "accion" | "rol" | "estrategia" | "puzzle" | "deportes" | "otro"
├─ estado: "jugando" | "pausado" | "completado" | "abandonado"
├─ logros: [{ nombre: string, obtenido: boolean }]   ← embebido
└─ timestamps (createdAt, updatedAt)
```

### Partida

Cada sesión es un documento propio y apunta al juego por id. La fecha se guarda como fecha
civil: el frontend de E2 envía `T12:00:00.000Z` y el dominio interpreta medianoche UTC como el
día elegido; cualquier otro instante se convierte a `America/Guayaquil`.

```
Partida
├─ videojuego: ObjectId (ref: "Videojuego")          ← referenciado
├─ fecha: Date (obligatorio)
├─ duracionMinutos: number (obligatorio, 1 a 10080)
├─ porcentajeAvance: number (0 a 100, obligatorio)
├─ notas: string (opcional, hasta 500 caracteres)
└─ timestamps (createdAt, updatedAt)
```

### Meta

La meta semanal es un documento propio que apunta al juego. Los hitos se embeben porque son
una lista corta y acotada.

```
Meta
├─ videojuego: ObjectId (ref: "Videojuego")          ← referenciado
├─ horasSemanales: number (0 < h ≤ 100, admite decimales)
├─ diasPorSemana: number (entero, 1 a 7)
├─ activa: boolean (por defecto true)
├─ hitos: [{ descripcion: string, porcentajeObjetivo: number (1 a 100) }]  ← embebido, máximo 5
└─ timestamps (createdAt, updatedAt)
```

Solo puede haber **una meta activa por videojuego**. Las metas desactivadas se conservan como
historial. El estado “alcanzado” de un hito no se guarda: se deriva del porcentaje de avance
actual.

## Por qué esta estructura

| Decisión | Justificación |
| --- | --- |
| `logros` se embebe en Videojuego | Se lee siempre junto con la ficha, no se consulta solo y es una lista corta y acotada. Cada logro es un subdocumento (`nombre` + `obtenido`), no un string, porque hay que poder marcarlo sin crear otra colección. Es el mismo criterio que las habilidades de Criatura. |
| `Partida` se referencia, no se embebe | Crece sin límite (una sesión por semana durante meses) y también se lista aparte del juego, por ejemplo "todas mis partidas". Es el mismo criterio que Avistamiento. |
| `Meta` se referencia y sus hitos se embeben | La meta tiene ciclo de vida propio (crear, editar, desactivar) y conserva historial. Los hitos son una lista corta que solo tiene sentido dentro de su meta. |
| El resumen y el progreso se calculan en el backend | La regla de negocio no debe repetirse en cada cliente. El resumen vive en `videojuegos.service.ts`; la semana, las rachas y los hitos viven en `dominio/progreso.ts` y no tocan la base. |
| Una sola meta activa por juego | El índice único parcial protege ante carreras y el servicio responde 409 con un mensaje claro antes de intentar guardar. |

Al eliminar un videojuego, el servicio borra sus partidas y sus metas para no dejar referencias huérfanas.

## Fórmula del resumen

`GET /api/videojuegos/:id/resumen` llama a `calcularResumen` en la capa de servicio. Los pasos son exactamente estos:

1. Confirmar que el videojuego existe. Si no, 404. Si el id está mal formado, 400.
2. Leer todas las partidas de ese videojuego.
3. `totalPartidas` = cantidad de partidas.
4. `horasTotales` = redondear a 1 decimal la suma de `duracionMinutos` dividida entre 60.
5. `ultimaPartida` = la `fecha` más reciente. Si dos partidas caen el mismo día, gana la de `createdAt` más nuevo.
6. `porcentajeAvanceActual` = `porcentajeAvance` de esa misma partida.

Si el juego existe pero todavía no tiene partidas:

```json
{
  "totalPartidas": 0,
  "horasTotales": 0,
  "ultimaPartida": null,
  "porcentajeAvanceActual": 0
}
```

Ejemplo con tres sesiones (300 + 300 + 270 minutos):

| Fecha | Minutos | Avance |
| --- | --- | --- |
| 2026-09-01 | 300 | 20 |
| 2026-09-15 | 300 | 45 |
| 2026-10-02 | 270 | 67 |

Resultado: `totalPartidas` 3, `horasTotales` 14.5, `ultimaPartida` `2026-10-02T00:00:00.000Z`, `porcentajeAvanceActual` 67. La partida más reciente manda el avance, aunque se haya registrado después una sesión de un día anterior.

## Capas del backend

```
rutas → controladores → servicios → modelos
```

| Capa | Responsabilidad |
| --- | --- |
| `config/env.ts` | Único lugar que lee `.env`. |
| `conexionDB.ts` | Solo conecta a Atlas con lo que `env` ya validó. |
| `middlewares` | `requestId`, `logger` y `errorHandler`. |
| `modelos` | Esquemas de Mongoose y sus validaciones. |
| `services` | CRUD, existencia de la referencia, logro embebido y resumen. |
| `controllers` | Traducen HTTP. No calculan ni hacen `populate`. |
| `routes` | Declaran los endpoints. |

`config/env.ts` está separado de `conexionDB.ts` a propósito, igual que en Pawnee.

## API

### Videojuegos

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/api/videojuegos` | Lista. Filtros opcionales: `?estado=` y `?plataforma=`. |
| GET | `/api/videojuegos/:id` | Una ficha, con sus logros. |
| POST | `/api/videojuegos` | Crea. |
| PUT | `/api/videojuegos/:id` | Actualiza la ficha completa. |
| DELETE | `/api/videojuegos/:id` | Elimina la ficha y sus partidas. |
| GET | `/api/videojuegos/:id/partidas` | Partidas de ese juego. 404 si el juego no existe. |
| GET | `/api/videojuegos/:id/metas` | Metas del juego, activas primero y luego por `createdAt` descendente. |
| GET | `/api/videojuegos/:id/progreso-semanal` | Progreso de la semana actual con meta, horas, días, rachas e hitos. |
| GET | `/api/videojuegos/:id/resumen` | Resumen calculado. |
| PATCH | `/api/videojuegos/:id/logros/:logroId` | Marca o desmarca un logro embebido. Cuerpo: `{ "obtenido": true }`. |

### Partidas

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/api/partidas` | Todas, con `populate("videojuego")`. Filtro opcional `?videojuegoId=`. |
| GET | `/api/partidas/:id` | Una partida con su videojuego populado. |
| POST | `/api/partidas` | Crea. Si el videojuego no existe, 404. |
| PUT | `/api/partidas/:id` | Edita fecha, duración, avance, notas o videojuego. Si el juego no existe, 404. |
| DELETE | `/api/partidas/:id` | Elimina una sesión. |

### Metas

| Método | Ruta | Qué hace |
| --- | --- | --- |
| POST | `/api/metas` | Crea una meta. 404 si el juego no existe; 409 si ya hay una activa. |
| GET | `/api/metas/:id` | Una meta. |
| PUT | `/api/metas/:id` | Edita horas, días, hitos o `activa`. El juego no se puede cambiar. |
| PATCH | `/api/metas/:id/desactivar` | Desactiva y conserva el historial. Es idempotente. |

`GET /api/videojuegos/:id/progreso-semanal` responde con la semana de lunes a domingo, la meta
activa (o `null`), las horas reales, el porcentaje limitado a 100, los días jugados, la racha
actual, la mejor racha y los hitos derivados. No se prorratea una meta creada a mitad de semana:
la meta activa aplica a toda la semana.

### Errores de la API

| Tipo | Cómo provocarlo | Status |
| --- | --- | --- |
| Validación de esquema | `POST /api/videojuegos` con `"plataforma": "NES"` o sin `nombre` | 400 `ValidationError` |
| Id mal formado | `GET /api/videojuegos/abc` | 400 `CastError` |
| Referencia inexistente | `POST /api/partidas` con un ObjectId válido que no está en la base, por ejemplo `507f1f77bcf86cd799439011` | 404 `ApiError` |
| Conflicto de meta activa | `POST /api/metas` dos veces para el mismo juego, o dos peticiones simultáneas que activan una meta | 409 `ApiError` o duplicado `E11000` |
| Error inesperado | Cualquier excepción que no sea de los casos anteriores. El manejador responde sin filtrar el stack | 500 |

Un JSON mal formado también responde 400, para no disfrazarlo de fallo interno.

## Frontend

React + TypeScript + Vite y React Router. Ninguna página llama a `fetch`: eso está en
`src/api/videojuegosApi.ts`, `src/api/partidasApi.ts` y `src/api/metasApi.ts`. Los estilos nuevos
usan los tokens de `DESIGN.md`; no hay librerías de UI.

| Pantalla | Ruta | Estados |
| --- | --- | --- |
| Biblioteca, con filtro | `/` | cargando / error / vacío |
| Detalle: ficha, progreso, logros, resumen y partidas | `/videojuegos/:id` | cargando / error / vacío por sección |
| Crear o editar videojuego | `/videojuegos/nuevo`, `/videojuegos/:id/editar` | cargando / error |
| Crear o editar meta | `/videojuegos/:id/meta/nueva`, `/videojuegos/:id/meta/editar` | cargando / error / validación / 409 |
| Lista de partidas, con edición | `/partidas` | cargando / error / vacío |
| Nueva partida o edición | `/partidas/nueva`, `/partidas/:id/editar` | cargando / error / validación |

La sección de progreso se consulta aparte: si falla, la ficha, los logros y las partidas siguen
visibles y aparece un botón para reintentar. Después de crear, editar o eliminar una partida, el
detalle vuelve a consultar el progreso.

En local, con `npm run dev` y sin `VITE_API_URL`, el navegador llama directo a `http://localhost:3000`. En Render, `VITE_API_URL` es la URL pública del backend.

## Instalación local

Hacen falta Node 20 o superior y un archivo `backend/.env` (no se sube a git).

```powershell
cd diario-progreso-gamer\backend
copy .env.example .env
# Edita .env y pon tu MONGODB_URI de Atlas. La base puede quedarse en diario_gamer.
npm install
npm run dev
```

En otra terminal:

```powershell
cd diario-progreso-gamer\frontend
npm install
npm run dev
```

Abre `http://localhost:5173`.

En PowerShell, `curl` es un alias de `Invoke-WebRequest`. Usa `curl.exe`. Para un POST, guarda el JSON en un archivo y envíalo así:

```powershell
curl.exe http://localhost:3000/api/salud
curl.exe -X POST http://localhost:3000/api/videojuegos -H "Content-Type: application/json" --data-binary "@videojuego.json"
```

Ejemplo de `videojuego.json`:

```json
{
  "nombre": "Hades",
  "plataforma": "PC",
  "genero": "accion",
  "estado": "jugando",
  "logros": [
    { "nombre": "Escapar del inframundo", "obtenido": false },
    { "nombre": "Vencer a Hades", "obtenido": false }
  ]
}
```

Ejemplo de partida (cambia el id por el que devolvió el POST anterior):

```json
{
  "videojuego": "PON_AQUI_EL_ID",
  "fecha": "2026-10-02T12:00:00.000Z",
  "duracionMinutos": 270,
  "porcentajeAvance": 67,
  "notas": "Llegué al jefe final"
}
```

## Despliegue en Render

Hay dos servicios, descritos en `render.yaml`. La URI de MongoDB no va en el repositorio: se carga en el panel de Render.

1. En Render, crea un Blueprint y elige este repositorio. Render lee `render.yaml`.
2. Cuando pida `MONGODB_URI`, pega la cadena de Atlas. `MONGODB_DB` ya queda en `diario_gamer`.
3. La API es un Web Service (`rootDir: backend`, build `npm install && npm run build`, start `npm start`, plan free).
4. El frontend es un Static Site (`rootDir: frontend`, publish `dist`). `VITE_API_URL` sale de la URL pública de la API y Vite la incrusta al construir.
5. `CORS_ORIGIN=*` deja que el sitio estático llame a la API. El puerto lo pone Render.
6. En Atlas, Network Access debe permitir `0.0.0.0/0`: el plan free de Render no tiene una IP fija.
7. El archivo `frontend/public/_redirects` y la regla del blueprint reescriben las rutas de React Router hacia `index.html`.
8. El plan free de la API se duerme tras unos minutos sin visitas. La primera petición después de eso tarda en responder.

### URLs públicas

- Backend: https://diario-gamer-api.onrender.com
- Frontend: https://diario-gamer-web.onrender.com

El blueprint de `render.yaml` se mantiene sin secretos. El PR #2 se integró a `main` como
`f475c92` y Render reconstruyó ambos servicios. La verificación de producción confirmó la ruta de
progreso semanal, el bundle nuevo y la sección de progreso en el navegador. La base de Atlas debe
seguir permitiendo `0.0.0.0/0`; la URI se carga solo en el panel. La evidencia está en
`docs/AUDITORIA.md` §7.

## Cómo trabajamos con el agente

El repositorio incluye el harness que guía al agente y deja memoria del proceso:

- `AGENTS.md` concentra el stack, la estructura, los comandos y las reglas del proyecto (máximo
  60 líneas). `CLAUDE.md` solo contiene `@AGENTS.md`.
- `.claude/skills/sdd-diario/SKILL.md` describe el flujo SDD y está marcada con
  `disable-model-invocation: true` porque afecta todo el repositorio.
- `.claude/settings.json` define dos hooks: uno bloquea cualquier intento de leer o modificar
  `backend/.env` y `frontend/.env`; el otro formatea los archivos editados con Prettier.
- `DESIGN.md` es la fuente visual. Cualquier estilo nuevo debe salir de sus tokens.
- El flujo es `diagnóstico → harness → PRD → épica → historias → criterios → tickets → specs →
  tests → código → auditoría`. La spec se commitea antes que el código que implementa.

La bitácora de la entrega está en `docs/bitacora-agente.md` y la evidencia en
`docs/AUDITORIA.md` y `docs/evidencias/`.

## Flujo de la demo

1. Crear un videojuego con dos o tres logros.
2. Registrar al menos tres partidas, con fechas y porcentajes distintos.
3. Abrir el detalle y comprobar que el resumen (horas, total, última fecha y avance de la sesión más reciente) cambió.
4. Crear una meta semanal con horas, días y tres hitos. La sección de progreso muestra la semana
   de lunes a domingo, las horas reales, el porcentaje limitado a 100, los días, la racha actual,
   la mejor racha y el estado textual de cada hito.
5. Editar la meta y comprobar que el porcentaje se recalcula. Desactivarla con confirmación y
   comprobar que las horas, los días y la racha se siguen viendo sin porcentaje ni hitos.
6. Editar una partida desde el detalle o desde `/partidas`; al guardar, el detalle consulta el
   progreso nuevo. Eliminar otra partida y comprobar el mismo refresco.
7. Marcar un logro como obtenido. Eso llama a `PATCH /api/videojuegos/:id/logros/:logroId` y no reemplaza la ficha entera.
8. Abrir `/videojuegos/:id/meta/nueva` con una meta ya activa para ver el mensaje 409 del backend.

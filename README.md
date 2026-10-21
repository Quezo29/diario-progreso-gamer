# Diario de Progreso Gamer

Aplicación web para que cada estudiante lleve el control de los videojuegos que tiene, las partidas que juega y un resumen calculado de su progreso real. La pregunta que responde es: ¿qué estoy jugando ahora, cuánto le he dedicado y qué tan avanzado voy?

El proyecto sigue el mismo criterio de modelado del Departamento de Parques y Fenómenos Inexplicables de Pawnee (Criatura + Avistamiento), en un dominio distinto y con una pieza nueva: el backend no solo guarda eventos, también calcula un resumen a partir de ellos.

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

Cada sesión es un documento propio y apunta al juego por id.

```
Partida
├─ videojuego: ObjectId (ref: "Videojuego")          ← referenciado
├─ fecha: Date (obligatorio)
├─ duracionMinutos: number (obligatorio, 1 a 10080)
├─ porcentajeAvance: number (0 a 100, obligatorio)
├─ notas: string (opcional, hasta 500 caracteres)
└─ timestamps (createdAt, updatedAt)
```

## Por qué esta estructura

| Decisión | Justificación |
| --- | --- |
| `logros` se embebe en Videojuego | Se lee siempre junto con la ficha, no se consulta solo y es una lista corta y acotada. Cada logro es un subdocumento (`nombre` + `obtenido`), no un string, porque hay que poder marcarlo sin crear otra colección. Es el mismo criterio que las habilidades de Criatura. |
| `Partida` se referencia, no se embebe | Crece sin límite (una sesión por semana durante meses) y también se lista aparte del juego, por ejemplo "todas mis partidas". Es el mismo criterio que Avistamiento. |
| El resumen se calcula en el backend | La regla de negocio no debe repetirse en cada cliente. Vive en `videojuegos.service.ts`, igual que la validación de que el videojuego referenciado exista vive en `partidas.service.ts`. |

Al eliminar un videojuego, el servicio también borra sus partidas para no dejar referencias huérfanas.

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
| GET | `/api/videojuegos/:id/resumen` | Resumen calculado. |
| PATCH | `/api/videojuegos/:id/logros/:logroId` | Marca o desmarca un logro embebido. Cuerpo: `{ "obtenido": true }`. |

### Partidas

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/api/partidas` | Todas, con `populate("videojuego")`. Filtro opcional `?videojuegoId=`. |
| POST | `/api/partidas` | Crea. Si el videojuego no existe, 404. |
| DELETE | `/api/partidas/:id` | Elimina una sesión. |

### Los 4 errores

| Tipo | Cómo provocarlo | Status |
| --- | --- | --- |
| Validación de esquema | `POST /api/videojuegos` con `"plataforma": "NES"` o sin `nombre` | 400 `ValidationError` |
| Id mal formado | `GET /api/videojuegos/abc` | 400 `CastError` |
| Referencia inexistente | `POST /api/partidas` con un ObjectId válido que no está en la base, por ejemplo `507f1f77bcf86cd799439011` | 404 `ApiError` |
| Error inesperado | Cualquier excepción que no sea de los tres casos anteriores. El manejador responde sin filtrar el stack | 500 |

Un JSON mal formado también responde 400, para no disfrazarlo de fallo interno.

## Frontend

React + TypeScript + Vite y React Router. Ninguna página llama a `fetch`: eso está en `src/api/videojuegosApi.ts` y `src/api/partidasApi.ts`.

| Pantalla | Ruta | Estados |
| --- | --- | --- |
| Biblioteca, con filtro | `/` | cargando / error / vacío |
| Detalle: ficha, logros, resumen y partidas | `/videojuegos/:id` | cargando / error / vacío |
| Crear o editar videojuego | `/videojuegos/nuevo`, `/videojuegos/:id/editar` | cargando / error |
| Lista de partidas | `/partidas` | cargando / error / vacío |
| Nueva partida | `/partidas/nueva` | cargando / error / vacío |

En local, con `npm run dev` y sin `VITE_API_URL`, el navegador llama directo a `http://localhost:3000`. En Render, `VITE_API_URL` es la URL pública del backend.

## Instalación local

Hacen falta Node 18 o superior y un archivo `backend/.env` (no se sube a git).

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
  "fecha": "2026-10-02T00:00:00.000Z",
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

## Flujo de la demo

1. Crear un videojuego con dos o tres logros.
2. Registrar al menos tres partidas, con fechas y porcentajes distintos.
3. Abrir el detalle y comprobar que el resumen (horas, total, última fecha y avance de la sesión más reciente) cambió.
4. Marcar un logro como obtenido. Eso llama a `PATCH /api/videojuegos/:id/logros/:logroId` y no reemplaza la ficha entera.

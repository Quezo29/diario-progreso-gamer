# Spec de backend · Meta y progreso semanal

Épica: E2 · Metas y rachas  
Tickets: T-01 a T-05  
Documentos de producto: `docs/prd/PRD.md`, `docs/backlog/E2-metas-y-rachas.md`  
Estado: implementada y auditada en `docs/AUDITORIA.md`.

## 1. Contexto y alcance

Esta spec define el contrato del backend para:

1. La colección `Meta`, referenciada desde `Videojuego` y con hitos embebidos.
2. El CRUD de metas y la regla de una sola meta activa.
3. El cálculo puro de la semana, las horas, los días jugados, las rachas y los hitos.
4. El endpoint `GET /api/videojuegos/:id/progreso-semanal`.
5. La cascada de borrado y los errores 400, 404, 409 y 500.

No define la interfaz: eso vive en `docs/specs/frontend-progreso-metas.md`.

## 2. Modelo `Meta`

| Campo | Tipo | Regla |
| --- | --- | --- |
| `videojuego` | ObjectId ref `Videojuego` | Obligatorio. Debe existir al crear. |
| `horasSemanales` | number | Obligatorio, mayor que 0 y máximo 100. Se aceptan decimales. |
| `diasPorSemana` | number | Obligatorio, entero entre 1 y 7. |
| `activa` | boolean | Por defecto `true`. Como máximo una meta activa por videojuego. |
| `hitos` | array embebido | Máximo 5. Cada hito: `descripcion` string obligatoria (trim) y `porcentajeObjetivo` number entre 1 y 100. |
| `createdAt` / `updatedAt` | Date | `timestamps: true`. |

Decisiones:

- `Meta` se **referencia** desde `Videojuego`, no se embebe: tiene ciclo de vida propio
  (crear, reemplazar, desactivar) y conserva historial de metas desactivadas.
- Los hitos se **embeben** porque son una lista corta y acotada que solo tiene sentido dentro
  de su meta.
- El estado `alcanzado` **no se guarda**: se deriva del porcentaje de avance actual.
- Se agrega un índice único parcial `{ videojuego: 1 }` con `partialFilterExpression: { activa: true }`.
  El servicio hace una comprobación previa para dar un mensaje claro; el índice protege ante carreras.

## 3. Reglas DEBE / NO DEBE

### Modelo y persistencia

- **B-01 DEBE** validar todos los campos de la tabla anterior antes de guardar.
- **B-02 DEBE** tener como máximo 5 hitos; un sexto hito es un error de validación (400).
- **B-03 DEBE** impedir dos metas activas para el mismo videojuego. El servicio responde
  `409 Conflict` con un mensaje que nombra el problema y no modifica la meta existente.
- **B-04 DEBE** conservar las metas desactivadas; desactivar no borra el documento ni sus hitos.
- **B-05 NO DEBE** permitir que `videojuego` cambie en una actualización. Si el cuerpo intenta
  cambiarlo, se responde 400.
- **B-06 DEBE** validar que el videojuego exista al crear una meta y al listar sus metas;
  si no existe, 404.
- **B-07 DEBE** validar el formato ObjectId de cualquier id de ruta; si es inválido, 400.

### Dominio puro

- **B-08 DEBE** implementar en `backend/src/dominio/progreso.ts` funciones puras, sin Mongoose
  ni acceso a red, para:
  - día civil/Guayaquil de una partida;
  - rango de la semana de lunes a domingo;
  - horas de la semana con redondeo a 1 decimal;
  - días distintos jugados en la semana;
  - racha actual y mejor racha;
  - porcentaje de avance actual y estado de los hitos.
- **B-09 DEBE** calcular la semana en `America/Guayaquil`, de lunes a domingo.
- **B-10 DEBE** tratar la fecha de una partida como fecha civil: si el instante es exactamente
  medianoche UTC, se usa su fecha UTC; en cualquier otro caso se convierte a
  `America/Guayaquil`. Esto conserva los datos del Proyecto 3 y evita corrimientos de un día.
- **B-11 DEBE** sumar `duracionMinutos` de las partidas cuyo día cae dentro de la semana actual,
  dividir entre 60 y redondear a 1 decimal.
- **B-12 DEBE** calcular `porcentajeHoras` como horas / horas de la meta × 100, redondeado a
  entero y limitado a 100. Nunca es negativo.
- **B-13 DEBE** contar días distintos, no partidas, para días jugados y rachas.
- **B-14 DEBE** calcular la racha actual con esta regla:
  - si hoy tiene partida, se cuenta desde hoy hacia atrás;
  - si hoy no tiene partida pero ayer sí, la racha sigue viva y se cuenta hasta ayer;
  - si no hay partida hoy ni ayer, la racha actual es 0.
- **B-15 DEBE** calcular la mejor racha sobre todo el historial de días jugados, sin cortar en
  lunes ni en la semana actual. La racha actual puede ser la mejor.
- **B-16 DEBE** ignorar fechas futuras para la racha actual, la mejor racha y los días jugados
  de la semana; una fecha futura no infla la constancia.
- **B-17 DEBE** derivar cada hito alcanzado comparando el porcentaje de avance actual con
  `porcentajeObjetivo` (`actual >= objetivo`). No se persiste el estado.
- **B-18 DEBE** usar como porcentaje de avance actual el de la partida con `fecha` máxima; si
  empatan, el `createdAt` más nuevo. Es la misma regla del resumen del Proyecto 3.
- **B-19 DEBE** devolver ceros y ningún hito alcanzado si el videojuego no tiene partidas.
- **B-20 DEBE** devolver `meta: null`, `porcentajeHoras: null` y `hitos: []` si no hay meta
  activa, pero seguir calculando horas, días y rachas.
- **B-21 DEBE** mantener el cálculo fuera del servicio: el servicio solo consulta y llama al
  dominio.

### API de metas

| Método | Ruta | Éxito | Errores |
| --- | --- | --- | --- |
| POST | `/api/metas` | 201 `{ meta, requestId }` | 400 validación, 404 juego, 409 meta activa |
| GET | `/api/metas/:id` | 200 `{ meta, requestId }` | 400 id inválido, 404 no existe |
| GET | `/api/videojuegos/:id/metas` | 200 `{ total, metas, requestId }` | 400 id inválido, 404 juego |
| PUT | `/api/metas/:id` | 200 `{ meta, requestId }` | 400 validación, 404, 409 |
| PATCH | `/api/metas/:id/desactivar` | 200 `{ meta, requestId }` | 400 id inválido, 404 |

- **B-22 DEBE** listar las metas de un videojuego con las activas primero y luego por `createdAt`
  descendente.
- **B-23 DEBE** permitir actualizar `horasSemanales`, `diasPorSemana`, `hitos` y `activa`.
  Si se intenta activar una meta cuando ya hay otra activa, 409.
- **B-24 DEBE** hacer `PATCH /:id/desactivar` idempotente: desactivar una meta ya inactiva
  responde 200 con la meta.
- **B-25 NO DEBE** exponer `populate` ni reglas de negocio en controladores.

### Progreso semanal

`GET /api/videojuegos/:id/progreso-semanal` responde 200 con:

```json
{
  "semana": { "inicio": "2026-11-02", "fin": "2026-11-08" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 3.5,
  "porcentajeHoras": 70,
  "diasJugadosSemana": 3,
  "rachaActual": 4,
  "mejorRacha": 9,
  "hitos": [
    { "descripcion": "Llegar al 25 %", "porcentajeObjetivo": 25, "alcanzado": true }
  ]
}
```

- **B-26 DEBE** devolver 404 si el videojuego no existe y 400 si el id no tiene formato válido.
- **B-27 DEBE** usar la meta activa actual para toda la semana, aunque la meta se haya creado o
  cambiado a mitad de semana. No se prorratea ni se consulta una meta histórica.
- **B-28 NO DEBE** incluir detalles internos de Mongoose en la respuesta; el contrato anterior
  es el mínimo y los campos extra permitidos son `requestId`.
- **B-29 DEBE** incluir `requestId` en la respuesta, igual que el resto de la API.

## 4. Errores y cascada

- **B-30 DEBE** distinguir en `errorHandler`: `ApiError` (status propio), `ValidationError` 400,
  `CastError` 400, JSON inválido 400, duplicado E11000 409 y cualquier otro 500 sin stack.
- **B-31 DEBE** eliminar todas las metas del videojuego al eliminar el videojuego, además de sus
  partidas. La respuesta sigue siendo 204.
- **B-32 NO DEBE** dejar metas huérfanas si se elimina un videojuego.

## 5. Criterios → verificación

| Criterio | Verificación | Tipo |
| --- | --- | --- |
| BC-01 Validaciones de Meta (horas, días, hitos, objetivo) | `backend/tests/meta.model.test.ts` | Test sin BD |
| BC-02 Una meta activa por juego y 409 | `POST /api/metas` dos veces con curl + revisión del servicio | Manual + curl |
| BC-03 Crear meta válida devuelve 201 | curl de evidencia | Manual + curl |
| BC-04 Consultar, listar, actualizar y desactivar | curl de evidencia | Manual + curl |
| BC-05 Juego inexistente devuelve 404 | curl con ObjectId válido inexistente | Manual + curl |
| BC-06 Id inválido devuelve 400 | curl con `abc` | Manual + curl |
| BC-07 Semana de lunes a domingo en Guayaquil | `progreso.test.ts` casos de domingo/lunes y UTC-5 | Test puro |
| BC-08 Horas redondeadas a 1 decimal | `progreso.test.ts` 210 minutos → 3.5 | Test puro |
| BC-09 Porcentaje entero y limitado a 100 | `progreso.test.ts` 7 h / 5 h → 100 | Test puro |
| BC-10 Días distintos | `progreso.test.ts` dos partidas el mismo día → 1 | Test puro |
| BC-11 Racha con gracia de hoy | `progreso.test.ts` hoy sin partida, ayer sí | Test puro |
| BC-12 Racha rota | `progreso.test.ts` hoy y ayer sin partida | Test puro |
| BC-13 Mejor racha histórica y cruce de semana | `progreso.test.ts` | Test puro |
| BC-14 Hitos derivados y bajan al bajar el avance | `progreso.test.ts` | Test puro |
| BC-15 Sin meta activa: `meta` y `porcentajeHoras` null | `progreso.test.ts` + curl | Test puro + curl |
| BC-16 Sin partidas: ceros y ningún hito | `progreso.test.ts` + curl | Test puro + curl |
| BC-17 Fecha civil y partida que cruza medianoche | `progreso.test.ts` | Test puro |
| BC-18 Cascada de metas al borrar juego | curl: crear juego + meta, borrar, consultar meta | Manual + curl |
| BC-19 400/404/409/500 centralizados | curl de evidencia + revisión de `errorHandler` | Manual + revisión |
| BC-20 Dominio sin base de datos | Revisión: `dominio/` no importa Mongoose | Revisión de código |
| BC-21 Resumen del Proyecto 3 sin cambios de contrato | Prueba de regresión del helper de última partida | Test puro |

## 6. Tickets → archivos

| Ticket | Archivos |
| --- | --- |
| T-01 | `backend/src/modelos/Meta.model.ts`, `backend/tests/meta.model.test.ts` |
| T-02 | `backend/src/dominio/progreso.ts`, `backend/tests/progreso.test.ts` |
| T-03 | `backend/src/services/metas.service.ts`, `backend/src/controllers/metas.controller.ts`, `backend/src/routes/metas.routes.ts`, `backend/src/routes/videojuegos.routes.ts`, `backend/src/controllers/videojuegos.controller.ts` |
| T-04 | `backend/src/services/progreso.service.ts`, `backend/src/controllers/videojuegos.controller.ts`, `backend/src/routes/videojuegos.routes.ts` |
| T-05 | `backend/src/services/videojuegos.service.ts`, `backend/src/middlewares/errorHandler.ts` |
| T-09 | `backend/src/services/partidas.service.ts`, `backend/src/controllers/partidas.controller.ts`, `backend/src/routes/partidas.routes.ts`, `backend/tests/progreso.test.ts` |

## 7. Decisiones de borde

1. **Meta creada a mitad de semana:** aplica a toda la semana (decisión 4 del PRD).
2. **Meta superada:** el porcentaje se limita a 100 y las horas reales no se recortan.
3. **Hito alcanzado que baja:** vuelve a pendiente; no hay histórico (decisión 6 del PRD).
4. **Juego completado o abandonado:** puede tener meta activa (decisión 7 del PRD).
5. **Dos partidas el mismo día:** un día; la racha no suma dos.
6. **Partida que cruza medianoche:** pertenece al día en que empezó, según la fecha civil.
7. **Fechas futuras:** no cuentan para rachas ni para días de la semana.
8. **Sin hitos:** la meta es válida y `hitos` se devuelve vacío.
9. **Sin meta:** la respuesta sigue siendo 200 y no es un error.
10. **Borrar juego:** cascada de partidas, metas e hitos.

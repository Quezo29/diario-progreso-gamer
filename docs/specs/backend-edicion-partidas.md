# Spec de backend · Edición de partidas (deuda pagada)

Épica: E2 · Metas y rachas  
Ticket: T-09  
Diagnóstico: P-01, P-02, P-09  
Estado: implementada y auditada en `docs/AUDITORIA.md`.

## 1. Contexto

El Proyecto 3 solo permitía crear y eliminar partidas. E2 exige que el progreso se vuelva a
consultar al **editar** una partida, así que hace falta consultar una partida y actualizarla.
También se fija la regla de fecha civil que usa el dominio de progreso.

## 2. Reglas DEBE / NO DEBE

- **PE-01 DEBE** exponer `GET /api/partidas/:id` con 200 `{ partida, requestId }`, 400 si el id
  no es un ObjectId válido y 404 si no existe.
- **PE-02 DEBE** exponer `PUT /api/partidas/:id` con 200 `{ partida, requestId }`, 400 por
  validación o id inválido, 404 si la partida o el videojuego referenciado no existen.
- **PE-03 DEBE** aceptar solo los campos `videojuego`, `fecha`, `duracionMinutos`,
  `porcentajeAvance` y `notas`; `createdAt`, `updatedAt` e `_id` no se editan.
- **PE-04 DEBE** validar que el videojuego exista si se cambia la referencia, igual que al crear.
- **PE-05 DEBE** conservar las validaciones del Proyecto 3: duración 1–10080 minutos y avance 0–100.
- **PE-06 DEBE** devolver la partida con `videojuego` populado, igual que el listado general.
- **PE-07 DEBE** normalizar la fecha del formulario como fecha civil: el frontend envía
  `${fecha}T12:00:00.000Z`; el dominio interpreta medianoche UTC como fecha civil y el resto como
  instante convertido a `America/Guayaquil`.
- **PE-08 NO DEBE** cambiar el contrato del resumen del Proyecto 3 ni la forma de `Partida`.
- **PE-09 DEBE** tener tests puros de la regla de fecha civil: medianoche UTC, hora de Ecuador y
  sesión que cruza medianoche (cuenta el día en que empezó).

## 3. Criterios → verificación

| Criterio | Verificación | Tipo |
| --- | --- | --- |
| PC-01 GET de partida existente | curl de evidencia | Manual |
| PC-02 GET con id inválido → 400 | curl | Manual |
| PC-03 GET de partida inexistente → 404 | curl | Manual |
| PC-04 PUT actualiza duración y avance | curl + formulario | Manual |
| PC-05 PUT con videojuego inexistente → 404 | curl | Manual |
| PC-06 PUT con validación inválida → 400 | curl | Manual |
| PC-07 Fecha civil a medianoche UTC | `progreso.test.ts` | Test puro |
| PC-08 Fecha con hora de Ecuador | `progreso.test.ts` | Test puro |
| PC-09 Sesión que cruza medianoche | `progreso.test.ts` | Test puro |

## 4. Ticket → archivos

| Ticket | Archivos |
| --- | --- |
| T-09 | `backend/src/services/partidas.service.ts`, `backend/src/controllers/partidas.controller.ts`, `backend/src/routes/partidas.routes.ts`, `backend/src/dominio/progreso.ts`, `backend/src/dominio/progreso.test.ts` |

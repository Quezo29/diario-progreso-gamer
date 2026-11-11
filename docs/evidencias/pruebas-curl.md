# Evidencia · Pruebas de API de E2

Fecha: 2026-11-10  
Rama: `feature/e2-metas-rachas`  
API local: `http://localhost:3100`  
Base de verificación: `diario_gamer_e2_verificacion` (separada de la base de la demo)

Para no tocar la base del diario se levantó el backend con dos variables de proceso, sin leer ni
modificar `.env`:

```powershell
$env:PORT = "3100"
$env:MONGODB_DB = "diario_gamer_e2_verificacion"
npm run dev
```

La conexión a Atlas siguió saliendo de `backend/.env`, que el hook del agente protege y que no se
imprimió en ningún momento. Al terminar, los juegos de prueba se borraron por la propia API.

## 1. Flujo principal

1. Crear un videojuego.
2. Consultar el progreso sin meta: `meta: null`, `porcentajeHoras: null`, `hitos: []`.
3. Crear una meta de 5 h y 4 días con tres hitos (20 %, 50 %, 100 %).
4. Registrar tres partidas: 300 min el 9/11, 180 min el 10/11 y 60 min el 10/11.
5. Consultar el progreso.
6. Consultar una partida por id y editarla con `PUT`.
7. Volver a consultar el progreso.
8. Probar 400, 404, 409, desactivación y cascada.

## 2. Resultados clave

### Progreso sin meta

```json
{
  "semana": { "inicio": "2026-11-09", "fin": "2026-11-15" },
  "meta": null,
  "horasSemana": 0,
  "porcentajeHoras": null,
  "diasJugadosSemana": 0,
  "rachaActual": 0,
  "mejorRacha": 0,
  "hitos": []
}
```

### Progreso con tres partidas y meta de 5 h / 4 días

```json
{
  "semana": { "inicio": "2026-11-09", "fin": "2026-11-15" },
  "meta": { "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 9,
  "porcentajeHoras": 100,
  "diasJugadosSemana": 2,
  "rachaActual": 2,
  "mejorRacha": 2,
  "hitos": [
    { "descripcion": "Primer hito", "porcentajeObjetivo": 20, "alcanzado": true },
    { "descripcion": "Mitad del juego", "porcentajeObjetivo": 50, "alcanzado": true },
    { "descripcion": "Casi terminado", "porcentajeObjetivo": 100, "alcanzado": false }
  ]
}
```

Comprueba a la vez:

- 9 horas reales frente a una meta de 5: el porcentaje queda en 100, las horas no se recortan.
- Dos partidas el mismo día cuentan como un día jugado.
- Dos días consecutivos producen racha actual 2 y mejor racha 2.
- Los hitos se derivan del avance actual (70 %): 20 y 50 alcanzados, 100 pendiente.

### GET de una partida

`GET /api/partidas/:id` devuelve 200 con `{ partida, requestId }` y el `videojuego` populado
(nombre, plataforma, género, estado y logros).

### PUT de una partida

Se cambió la tercera partida a 420 minutos, 85 % y notas nuevas:

```json
{
  "fecha": "2026-11-10T12:00:00.000Z",
  "duracionMinutos": 420,
  "porcentajeAvance": 85,
  "notas": "Sesion editada"
}
```

El progreso recalculado devolvió `horasSemana: 15`, `porcentajeHoras: 100`, los mismos 2 días y
la misma racha. El cambio de duración y de avance se reflejó sin tocar el resumen del Proyecto 3.

### Errores y reglas

| Caso | Petición | Resultado |
| --- | --- | --- |
| Id inválido | `GET /api/partidas/abc` | **400** `"abc" no es un id válido...` |
| Partida inexistente | `GET /api/partidas/507f...011` | **404** `No existe una partida...` |
| Validación de partida | `PUT /api/partidas/:id` con `porcentajeAvance: 101` | **400** validación de Mongoose |
| Juego inexistente en partida | `PUT /api/partidas/:id` con `videojuego: 507f...011` | **404** `No existe un videojuego...` |
| Segunda meta activa | `POST /api/metas` con una meta ya activa | **409** `El videojuego ya tiene una meta activa...` |
| Desactivar meta | `PATCH /api/metas/:id/desactivar` | **200**, `activa: false`; el progreso pasa a `meta: null` y `porcentajeHoras: null` |
| Listar metas | `GET /api/videojuegos/:id/metas` | **200**, 1 meta, 0 activas después de desactivar |
| Cascada | Crear juego + meta, `DELETE /api/videojuegos/:id`, luego `GET /api/metas/:idMeta` | **404** la meta ya no existe |
| Juego borrado | `GET /api/videojuegos/:id/progreso-semanal` después del borrado | **404** el juego ya no existe |

### Auditoría final de CRUD y errores

Se repitió el flujo con un juego temporal creado y borrado por la API. El script terminó con
**15 de 15 casos correctos** y no dejó datos de prueba.

| Caso | Esperado | Obtenido |
| --- | --- | --- |
| Crear videojuego | 201 | 201 |
| Crear meta válida (5 h / 4 días, 2 hitos) | 201 | 201 |
| Consultar meta por id | 200 | 200 |
| Progreso con meta activa | 200 | 200 |
| Segunda meta activa | 409 | 409 con el mensaje de meta activa |
| Id de meta inválido (`abc`) | 400 | 400 |
| Meta inexistente (ObjectId válido) | 404 | 404 |
| Meta con videojuego inexistente | 404 | 404 |
| Editar meta (6 h / 5 días, 1 hito) | 200 | 200 |
| Desactivar meta | 200 | 200, `activa: false` |
| Listar metas del juego | 200 | 200, total 1, activas 0 |
| Progreso sin meta activa | 200 | 200, `meta: null`, `porcentajeHoras: null`, `hitos: []` |
| Borrar videojuego | 204 | 204 |
| Consultar la meta borrada | 404 | 404 |
| Progreso del juego borrado | 404 | 404 |

El script de esta pasada está en
`C:\Users\Ricardo\AppData\Local\Temp\opencode\e2-auditoria.mjs`, fuera del repositorio.

## 3. Tests automatizados

```text
backend npm test
  tests/progreso.test.ts      26 passed
  tests/meta.model.test.ts     7 passed
  tests/errorHandler.test.ts   5 passed
  Total                       38 passed
```

Los tests puros cubren semana en Guayaquil, horas con redondeo, días distintos, porcentaje con
tope 100, rachas con gracia de hoy, racha rota, mejor racha histórica y cruce de semana, hitos
derivados, fecha civil, partida que cruza medianoche, partida futura y ausencia de meta o de
partidas.

## 4. Reproducir

El script completo usado en esta evidencia está en
`C:\Users\Ricardo\AppData\Local\Temp\opencode\e2-verificacion.ps1` (fuera del repositorio, para no
agregar datos de prueba ni credenciales). Las peticiones se pueden repetir con `curl.exe` o con
`Invoke-RestMethod`; los ids cambian en cada ejecución.

# Spec de frontend · Progreso semanal y metas

Épica: E2 · Metas y rachas  
Tickets: T-06 a T-09  
Documentos de producto: `docs/prd/PRD.md`, `docs/backlog/E2-metas-y-rachas.md`  
Diseño: `DESIGN.md`  
Estado: implementada y auditada en `docs/AUDITORIA.md`.

## 1. Contexto y alcance

La persona debe poder, desde el detalle de un videojuego:

1. Ver el progreso de la semana actual contra su meta activa.
2. Ver días jugados, racha actual, mejor racha y el estado de sus hitos.
3. Crear una meta con hasta 5 hitos, editarla o desactivarla con confirmación.
4. Actualizar el progreso al registrar, editar o eliminar una partida.

La interfaz conserva la identidad XMB descrita en `DESIGN.md`. No se agregan librerías de UI.

## 2. Reglas DEBE / NO DEBE

### Servicio de API y tipos

- **F-01 DEBE** declarar en `frontend/src/tipos.ts` los tipos `Meta`, `HitoMeta`, `HitoProgreso`
  y `ProgresoSemanal`, coherentes con la respuesta del backend.
- **F-02 DEBE** concentrar las llamadas de E2 en `frontend/src/api/metasApi.ts`:
  crear, obtener por id, listar por videojuego, actualizar, desactivar y obtener progreso.
- **F-03 NO DEBE** llamar a `fetch` desde páginas o componentes; los servicios existentes
  `videojuegosApi.ts` y `partidasApi.ts` siguen siendo los únicos para sus rutas.
- **F-04 DEBE** usar `manejarRespuesta` de `api/http.ts` para traducir errores del backend.

### Sección de progreso en el detalle

- **F-05 DEBE** aparecer en el detalle de todos los videojuegos, antes o después del resumen
  del Proyecto 3, sin ocultar las partidas ni los logros.
- **F-06 DEBE** mostrar:
  - rango de la semana (`lunes` a `domingo`), legible en español;
  - horas jugadas frente a las horas de la meta, con barra y porcentaje;
  - días jugados frente a los días objetivo;
  - racha actual y mejor racha;
  - lista de hitos con descripción, objetivo y estado textual “Alcanzado” o “Pendiente”.
- **F-07 DEBE** mostrar las horas reales aunque el porcentaje esté limitado a 100.
- **F-08 DEBE** mostrar `rachaActual` como número de días y una frase corta que explique el
  estado: “Racha viva”, “Sin racha activa” o “Sin partidas”.
- **F-09 DEBE** manejar estados de carga, error y vacío. Un error de progreso no debe impedir
  ver la ficha y las partidas; se muestra dentro de la sección con opción de reintentar.
- **F-10 DEBE** mostrar el caso “sin meta activa” con los datos de horas, días y rachas y una
  invitación visible a crear una meta. No debe mostrar un porcentaje inventado.
- **F-11 NO DEBE** mostrar porcentaje, barra de cumplimiento ni hitos si no hay meta activa.
- **F-12 DEBE** volver a consultar el progreso al registrar, editar o eliminar una partida.
  No se exige WebSocket ni polling.

### Formulario de meta

- **F-13 DEBE** permitir crear y editar horas semanales, días por semana y hasta 5 hitos.
- **F-14 DEBE** validar en cliente: horas > 0 y ≤ 100, días entero 1–7, hitos con descripción y
  objetivo 1–100, máximo 5 hitos. El backend sigue siendo la autoridad.
- **F-15 DEBE** precargar la meta activa en modo edición y volver al detalle al guardar.
- **F-16 DEBE** pedir confirmación para desactivar, explicando que se deja de ver el porcentaje
  y los hitos, y refrescar el detalle después.
- **F-17 DEBE** mostrar el mensaje del backend cuando rechaza una segunda meta activa (409) o
  una validación (400).
- **F-18 DEBE** conservar la navegación: “Volver” al detalle, sin perder el id del videojuego.

### Edición de partidas y refresco

- **F-19 DEBE** existir un modo edición del formulario de partida, enlazado desde el detalle y
  desde la lista de partidas.
- **F-20 DEBE** precargar fecha, duración, avance, notas y videojuego; al guardar, volver al
  detalle del videojuego y consultar el progreso nuevo.
- **F-21 DEBE** enviar la fecha como fecha civil (`T12:00:00.000Z`) para que no se corra un día
  en `America/Guayaquil`. Al leerla para el formulario se usa la parte `YYYY-MM-DD`.
- **F-22 NO DEBE** permitir guardar una partida sin videojuego o fecha, con duración menor a 1,
  más de 10080 minutos o avance fuera de 0–100.

### Diseño y accesibilidad

- **F-23 DEBE** usar solo los tokens CSS de `DESIGN.md` en los estilos nuevos: color, tipografía,
  espaciado, radios, barra y transiciones. Prohibido inventar colores o usar librerías de UI.
- **F-24 DEBE** tener etiquetas `<label>` asociadas, foco visible, textos de estado que no
  dependan solo del color y `role="progressbar"`/`meter` con `aria-valuenow` en las barras.
- **F-25 DEBE** ser usable a 320 px de ancho: una columna, sin scroll horizontal salvo tablas.
- **F-26 DEBE** respetar `prefers-reduced-motion` para la animación del tono y transiciones.
- **F-27 DEBE** mantener el tono tranquilo de `DESIGN.md`: sin exclamaciones, puntos, medallas
  ni mensajes que culpen por no cumplir.

## 3. Criterios → verificación

| Criterio | Verificación | Tipo |
| --- | --- | --- |
| FC-01 Tipos coherentes con el backend | Revisión de `tipos.ts` + `npm run build` | Build / revisión |
| FC-02 `metasApi.ts` separado y sin `fetch` en páginas | `rg "fetch\\(" frontend/src/paginas` vacío; revisión | Revisión |
| FC-03 Sección visible en el detalle | Revisión manual en navegador | Manual |
| FC-04 Estados de carga, error y vacío | Revisión manual; error de API simulado | Manual |
| FC-05 Sin meta activa: invitación y datos de semana | Revisión manual con juego sin meta | Manual |
| FC-06 Horas, barra y porcentaje con tope 100 | Revisión manual con 7 h / 5 h | Manual |
| FC-07 Días, rachas e hitos con estado textual | Revisión manual con datos de prueba | Manual |
| FC-08 Crear meta con hitos | Revisión manual y curl de verificación | Manual |
| FC-09 Editar meta y recalcular | Revisión manual | Manual |
| FC-10 Desactivar con confirmación | Revisión manual | Manual |
| FC-11 Validación de cliente | Revisión manual con valores inválidos | Manual |
| FC-12 Refresco tras crear, editar y eliminar partida | Revisión manual de los tres flujos | Manual |
| FC-13 Solo tokens de `DESIGN.md` | Revisión de diseño contra `docs/evidencias/revision-diseno.md` | Revisión |
| FC-14 Accesibilidad básica | Revisión de etiquetas, foco y roles | Revisión |
| FC-15 Responsive a 320 px | Revisión en DevTools | Manual |
| FC-16 Build de producción | `npm run build` en `frontend/` | Build |

## 4. Estructura de pantallas

### Detalle del videojuego (`/videojuegos/:id`)

Orden recomendado:

1. Volver, nombre, estado, datos de la ficha y acciones.
2. **Progreso semanal** (nuevo).
3. Logros.
4. Resumen del Proyecto 3.
5. Partidas de este juego, con acción “Editar” además de “Eliminar”.

La sección de progreso tiene:

- Encabezado “Progreso de esta semana” y rango `2 nov – 8 nov`.
- Si hay meta: tres bloques: horas, días, racha; barra de horas; hitos.
- Si no hay meta: horas, días y racha, y el botón “Crear meta”.
- Si hay meta: botones “Editar meta” y “Desactivar meta”.
- Sin partidas: ceros y texto “Todavía no hay partidas esta semana; la racha empieza cuando juegues.”

### Formulario de meta (`/videojuegos/:id/meta/nueva` y `/videojuegos/:id/meta/editar`)

- Campo horas semanales (`number`, paso 0.5, mínimo >0, máximo 100).
- Campo días por semana (`number`, 1–7).
- Lista de hitos con descripción, objetivo (%) y “Quitar”; botón “Agregar hito” deshabilitado al
  llegar a 5.
- Botón primario “Guardar meta”.
- En edición, acción secundaria “Desactivar meta” con confirmación.
- Mensaje de error arriba del formulario; enlace “Volver al juego”.

### Formulario de partida en edición (`/partidas/:id/editar`)

- Reutiliza el formulario existente; precarga los datos.
- El título cambia a “Editar partida” y el botón a “Guardar cambios”.
- Al guardar vuelve al detalle del videojuego y este consulta el progreso.

## 5. Tickets → archivos

| Ticket | Archivos |
| --- | --- |
| T-06 | `frontend/src/tipos.ts`, `frontend/src/api/metasApi.ts` |
| T-07 | `frontend/src/componentes/ProgresoSemanal.tsx`, `frontend/src/paginas/DetalleVideojuego.tsx`, `frontend/src/estilos.css` |
| T-08 | `frontend/src/paginas/FormularioMeta.tsx`, `frontend/src/App.tsx`, `frontend/src/paginas/DetalleVideojuego.tsx`, `frontend/src/estilos.css` |
| T-09 | `frontend/src/api/partidasApi.ts`, `frontend/src/paginas/FormularioPartida.tsx`, `frontend/src/App.tsx`, `frontend/src/paginas/DetalleVideojuego.tsx`, `frontend/src/paginas/ListaPartidas.tsx` |

## 6. Textos de referencia

- Vacío sin meta: “Todavía no tienes una meta activa. Define una para esta semana.”
- Botón: “Crear meta”.
- Meta activa: “5 h por semana · 4 días”.
- Racha: “4 días seguidos”, “Racha viva hasta ayer”, “Sin racha activa”.
- Hito alcanzado: “Alcanzado”; pendiente: “Pendiente”.
- Confirmación de desactivar: “¿Desactivar esta meta? Dejarás de ver el porcentaje y los hitos;
  las horas, los días y la racha se siguen calculando.”
- Error 409: se muestra el mensaje del backend, sin inventar uno genérico.

## 7. Fuera de alcance de esta spec

- Tests automatizados de componentes y E2E (deuda D-01).
- Gráficos históricos, notificaciones, rankings o metas compartidas.
- Nuevas librerías de UI, iconos o fuentes distintas de Outfit.
- Cambios en el resumen del Proyecto 3 o en la biblioteca, salvo los enlaces de edición de partidas.

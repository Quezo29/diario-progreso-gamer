# Revisión de diseño · E2 Metas y rachas

Fecha: 2026-11-10  
Rama: `feature/e2-metas-rachas`  
Referencia visual: `DESIGN.md`  
Frontend local: `http://localhost:5173`  
Backend local: `http://localhost:3100`

La revisión se hizo en el navegador integrado con datos de la base de verificación
`diario_gamer_e2_verificacion`: un juego con meta de 5 h / 4 días y tres partidas, un juego sin
meta activa y un juego con la meta editada a 12 h / 5 días. Las capturas están en
`docs/evidencias/capturas/`.

## 1. Criterios revisados

| Criterio de `DESIGN.md` | Comprobación | Resultado |
| --- | --- | --- |
| Una sola columna y navegación XMB | La sección nueva vive dentro del detalle, debajo de las acciones de la ficha. La navegación de tres accesos no cambia. | Cumple |
| Luz sobre color, sin tarjetas blancas | El progreso usa `.panel`, sin fondo sólido ni caja anidada; el texto blanco conserva la sombra de lectura. | Cumple |
| Datos sin ruido | Horas, días y rachas usan `dl`/`dt`/`dd` con cifra grande y etiqueta pequeña en mayúsculas. | Cumple |
| Progreso sin dramatismo | No hay alertas rojas, exclamaciones, medallas ni mensajes de culpa. El error se explica y ofrece “Reintentar”. | Cumple |
| Barra de horas | Pista `--color-bruma`, relleno `--color-tinta`, altura `--barra-alto` y porcentaje limitado a 100. Las horas reales se muestran aparte. | Cumple |
| Hitos | Lista vertical con borde suave; “Alcanzado” en `--color-exito` y “Pendiente” en texto normal. El estado no depende solo del color. | Cumple |
| Formularios | Etiquetas arriba, un botón primario, “Quitar” y “Desactivar meta” como acciones secundarias o peligrosas. | Cumple |
| Voz y tono | “Todavía no tienes una meta activa. Define una para esta semana.”, “La racha empieza cuando juegues.” | Cumple |

## 2. Tokens y estilos nuevos

Los estilos de E2 están en `frontend/src/estilos.css`, después de los estilos del Proyecto 3:

- `.progreso`, `.progreso-rango`, `.meta-activa`, `.progreso-metricas`, `.progreso-racha`.
- `.barra-progreso`, `.progreso-porcentaje`.
- `.hitos-meta`, `.lista-hitos`, `.hito-alcanzado`, `.estado-hito`.
- `.hitos-editor`, `.fila-hito-meta`, `.campo-hito`.
- `.acciones-secundarias`.

Todos usan variables de `:root`: `--color-tinta`, `--color-tinta-tenue`, `--color-tinta-media`,
`--color-linea`, `--color-linea-suave`, `--color-bruma`, `--color-exito`, `--texto-etiqueta`,
`--texto-menor`, `--texto-cifra`, `--espacio-1` a `--espacio-4`, `--barra-alto` y `--transicion`.
No se agregaron colores, fuentes, sombras ni librerías de UI. Los estilos anteriores del Proyecto 3
conservan sus literales históricos; la revisión se limita a lo nuevo de E2, como pide la spec.

## 3. Estados de la sección

| Estado | Qué se ve | Evidencia |
| --- | --- | --- |
| Carga | “Calculando tu semana...” dentro de la sección; la ficha y las partidas siguen visibles. | Revisión en navegador |
| Error | “No se pudo cargar el progreso: …” con `role="alert"` y botón “Reintentar”; el resto del detalle no se oculta. | `progreso-error.jpeg` |
| Sin meta activa | Horas, días y rachas de la semana, sin barra ni hitos, con “Crear meta”. | `detalle-sin-meta.jpeg` |
| Sin partidas | Ceros y “Todavía no hay partidas esta semana; la racha empieza cuando juegues.” | `detalle-sin-meta.jpeg` |
| Meta superada | 9 h reales frente a una meta de 5 h, barra al 100 %. | `detalle-con-meta.jpeg` |
| Meta editada | 12 h / 5 días y 83 % recalculado sin recargar a mano. | `detalle-meta-editada.jpeg` |

El error de progreso se provocó interceptando la petición de `progreso-semanal` en el navegador.
La ficha, los logros, el resumen y las partidas siguieron visibles, que es el comportamiento
pedido por F-09.

## 4. Accesibilidad

- La sección tiene `aria-labelledby="titulo-progreso"`; la barra usa `role="progressbar"`,
  `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-label` y `aria-valuetext` con las horas
  reales.
- El resumen del Proyecto 3 conserva su `role="meter"` con `aria-valuenow`.
- Los campos del formulario de meta tienen `<label htmlFor>` y los hitos usan `fieldset`/`legend`.
- Los mensajes de error usan `role="alert"` y el aviso de desactivación `role="status"`.
- `:focus-visible` está definido en `frontend/src/estilos.css` con contorno blanco de 2 px y
  separación de 3 px.
- “Alcanzado” y “Pendiente” son texto, no solo color.
- `@media (prefers-reduced-motion: reduce)` desactiva la transición del cielo y reduce animaciones
  y transiciones al mínimo.
- Las acciones destructivas piden confirmación con una frase que explica qué se borra o qué se
  deja de ver.

## 5. Responsive

Se revisó el detalle a 320 px de ancho. La barra de navegación se reduce, las métricas pasan a una
columna, los hitos apilan descripción y estado y las filas de hitos del formulario pasan a una
columna. No aparece scroll horizontal en el detalle; la tabla de partidas conserva su contenedor
con scroll propio, permitido por `DESIGN.md`.

La captura `movil-320.jpeg` muestra el área de 320 px dentro del lienzo del navegador; el resto del
lienzo aparece en negro por el tamaño de la ventana de captura, no por un defecto de la interfaz.

## 6. Hallazgos y correcciones

| Hallazgo | Decisión |
| --- | --- |
| La fecha de “hoy” se calculaba en UTC y podía marcar mal la racha viva en Guayaquil. | Se corrigió en `frontend/src/formato.ts` con `America/Guayaquil` y se verificó en el navegador. Commit `cfdc680`. |
| El error de progreso podía confundirse con un error de toda la ficha. | La sección maneja su propio error y su reintento; la ficha y las partidas siguen visibles. |
| En 320 px los botones de la tabla se apilan y la fila crece. | Es el comportamiento esperado; no hay desbordamiento horizontal y las acciones siguen siendo alcanzables. |
| Las capturas de página completa muestran bandas del fondo fijo. | Es un artefacto de la captura, no del CSS: las capturas de viewport (`detalle-sin-meta.jpeg`, `detalle-meta-editada.jpeg`) no lo presentan. |

No quedaron hallazgos bloqueantes. La deuda D-01 (tests automatizados de frontend y CI) sigue
abierta y se compensa con build, revisión manual y esta revisión de diseño.

## 7. Evidencia

| Captura | Qué muestra |
| --- | --- |
| `capturas/detalle-con-meta.jpeg` | Detalle con meta 5 h / 4 días, 9 h reales, 100 %, días, rachas e hitos. |
| `capturas/detalle-meta-editada.jpeg` | Meta editada a 12 h / 5 días y porcentaje recalculado a 83 %. |
| `capturas/detalle-sin-meta.jpeg` | Juego sin meta activa y sin partidas: ceros, invitación a crear meta. |
| `capturas/progreso-error.jpeg` | Error aislado del progreso con “Reintentar” y el resto del detalle visible. |
| `capturas/movil-320.jpeg` | Detalle a 320 px, una columna y sin scroll horizontal. |
| `capturas/produccion-render.jpeg` | Detalle real en `https://diario-gamer-web.onrender.com` con la sección de progreso desplegada. |

## 8. Transición continua del tono

La revisión posterior detectó que el cambio de color del cielo se percibía como saltos. Se
reemplazó el intervalo de cinco minutos por una animación CSS continua de 1800 s sobre `--tono`,
con los mismos tonos de la identidad XMB y una interpolación gradual entre ellos.

En el navegador se pausó la animación y se muestreó el tono en distintos puntos del ciclo. Los
valores intermedios (247, 210, 175) confirman que la interpolación es continua. Con
`prefers-reduced-motion: reduce` el tono queda fijo en 272 y la animación se desactiva. La
verificación completa está en `docs/AUDITORIA.md` §11.

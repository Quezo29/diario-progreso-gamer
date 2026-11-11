# DESIGN.md — Diario de Progreso Gamer

Identidad visual del Diario: un menú **XMB** de consola, cálido y tranquilo, no una app de
productividad corporativa. La interfaz acompaña; no presiona ni convierte el juego en una tarea.

## 1. Principios

1. **Una sola columna**: el contenido respira en el centro, como una ola XMB.
2. **Luz sobre color**: el fondo cambia de tono lentamente; el texto blanco flota con una sombra
   fina para leerse sobre cualquier tono.
3. **Datos sin ruido**: horas, días y rachas se muestran en cifras grandes y etiquetas pequeñas.
4. **El progreso no se dramatiza**: una meta incumplida se dice con calma; no hay alertas rojas
   ni mensajes que culpen.
5. **Accesible por defecto**: foco visible, etiquetas reales, estado que no depende solo del color
   y movimiento que se puede reducir.

## 2. Tokens

La fuente de verdad son las variables CSS de `frontend/src/estilos.css` (`:root`). Ningún
componente nuevo debe introducir colores, tipografías o sombras fuera de esta lista.

### Color

| Token | Valor | Uso |
| --- | --- | --- |
| `--tono` | `272` (se anima entre 272, 222, 198, 152, 38 y 338) | Matiz del cielo XMB. |
| `--color-fondo` | `hsl(var(--tono) 62% 38%)` | Fondo base del documento. |
| `--color-tinta` | `#ffffff` | Texto principal, iconos activos, barra. |
| `--color-tinta-tenue` | `rgba(255, 255, 255, 0.78)` | Texto secundario y etiquetas. |
| `--color-tinta-media` | `rgba(255, 255, 255, 0.55)` | Texto deshabilitado y líneas de formulario. |
| `--color-linea` | `rgba(255, 255, 255, 0.28)` | Separadores de datos y campos. |
| `--color-linea-suave` | `rgba(255, 255, 255, 0.16)` | Filas de tablas y listas. |
| `--color-bruma` | `rgba(255, 255, 255, 0.14)` | Realces suaves y fondos de campo. |
| `--color-superficie` | `rgba(255, 255, 255, 0.08)` | Panel o tarjeta discreta. |
| `--color-superficie-activa` | `rgba(255, 255, 255, 0.18)` | Hover, selección y botón primario. |
| `--color-peligro` | `#ffe4ea` | Acciones destructivas y avisos. |
| `--color-aviso` | `#ffe3a3` | Estado “pausado” y avisos no destructivos. |
| `--color-exito` | `#d9ffe8` | Hito alcanzado y estado “completado”. |

### Tipografía

| Token | Valor | Uso |
| --- | --- | --- |
| `--fuente` | `"Outfit", "Segoe UI", sans-serif` | Toda la interfaz. |
| `--texto-base` | `1.25rem` con línea `1.4` | Párrafos. |
| `--texto-titulo` | `2.35rem` | `h1`. |
| `--texto-seccion` | `1.7rem` | `h2`. |
| `--texto-etiqueta` | `0.85rem`, mayúsculas, `letter-spacing: 0.1em` | Etiquetas de datos. |
| `--texto-menor` | `0.95rem` | Botones y ayudas de formulario. |
| `--texto-cifra` | `2.15rem` | Números del resumen. |

Outfit se carga desde Google Fonts en `index.html`; es la única fuente autorizada.

### Espaciado y forma

| Token | Valor | Uso |
| --- | --- | --- |
| `--espacio-1` | `0.35rem` | Separación mínima. |
| `--espacio-2` | `0.55rem` | Gap de botones y filas. |
| `--espacio-3` | `0.8rem` | Gap de grids. |
| `--espacio-4` | `1.15rem` | Separación entre bloques. |
| `--espacio-5` | `1.6rem` | Aire interior de panel. |
| `--espacio-6` | `2.2rem` | Margen de columna. |
| `--radio` | `0` | La interfaz XMB es de bordes rectos. |
| `--barra-alto` | `3px` | Barra de avance. |
| `--transicion` | `120ms ease` | Hover, foco y botones. |
| `--ancho-columna` | `52rem` | Ancho máximo del contenido. |

## 3. Componentes

### Navegación XMB
- Tres accesos: Biblioteca, Partidas y Nuevo juego. Iconos de trazo, nunca rellenos.
- El activo se agranda y se ilumina; el resto queda al 78 % de opacidad.
- En móvil se reduce el ancho de cada columna, no se convierte en hamburguesa.

### Panel de sección
- Sin tarjeta blanca: fondo `--color-superficie` muy tenue o transparente.
- Título `h2` y, debajo, una línea de ayuda con `--color-tinta-tenue`.
- Se separa con `--espacio-4`; nunca con cajas anidadas.

### Cifras y barras
- Las métricas usan `dl`/`dt`/`dd`, cifra grande y etiqueta en mayúsculas.
- Barra de horas: pista `--color-bruma`, relleno `--color-tinta`, altura `--barra-alto`.
- Se usa `role="progressbar"` o `role="meter"` con `aria-valuemin`, `aria-valuemax`,
  `aria-valuenow` y `aria-label`.
- El porcentaje se limita visualmente a 100; las horas reales se muestran aparte.

### Hitos
- Lista vertical con borde superior suave.
- Alcanzado: texto `--color-exito` y la palabra **Alcanzado**; pendiente: **Pendiente**.
  El estado nunca se comunica solo por color.
- La descripción va primero y el objetivo entre paréntesis.

### Formularios
- Etiqueta arriba, en mayúsculas pequeñas; campo con borde inferior.
- Un solo botón primario por formulario. “Desactivar meta” y “Eliminar” usan `button.peligro`.
- Los hitos se editan como filas: descripción, objetivo y “Quitar”. Máximo 5.
- Mensajes de error arriba del formulario, en `--color-peligro`, con texto claro y accionable.

### Voz y tono
- Español neutro, segunda persona, frases cortas.
- Hablamos de “tu semana”, “tu racha” y “lo que te propusiste”.
- Nada de signos de exclamación, mayúsculas gritadas, “¡vamos!”, puntos, medallas ni culpa.
- Un estado vacío invita: “Todavía no tienes una meta activa. Define una para esta semana.”

## 4. Accesibilidad

- Contraste mínimo AA (4.5:1) para texto normal; el texto blanco sobre el cielo usa la sombra
  `--sombra-letra` como refuerzo, no como sustituto del contraste.
- `:focus-visible` con contorno blanco de 2 px y separación de 3 px.
- Todo campo tiene `<label>` asociado; los iconos son `aria-hidden`.
- Los estados se anuncian con texto, no solo con color.
- `prefers-reduced-motion: reduce` desactiva la animación del tono y las transiciones.
- En pantallas menores de 720 px, una columna, sin scroll horizontal salvo tablas.
- Los botones destructivos piden confirmación con una frase que explica qué se borra.

## 5. No hacemos

- Notificaciones, recordatorios push o correos.
- Metas compartidas, rankings, amigos o comparaciones entre personas.
- Gráficos históricos, calendarios de calor o estadísticas mensuales.
- Puntos, monedas, insignias, niveles o cualquier gamificación de la constancia.
- Librerías de UI (Material, Bootstrap, Chakra, Tailwind) ni kits de componentes.
- Modo claro/oscuro alternativo: el cielo ya cambia de tono.
- Ilustraciones, emojis en la interfaz, cursores personalizados o sonidos.
- Textos que presionen, ridiculicen o hagan sentir mal por no cumplir una meta.

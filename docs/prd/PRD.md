# PRD — Diario de Progreso Gamer · Épica E2 «Metas y rachas»

Versión: 1.0  
Fecha: 2026-11-10  
Fuente del producto: Ficha de hechos del cliente (E2). Todo lo que no está en la ficha se marca
como supuesto o punto abierto.

## 1. Resumen

El Diario de Progreso Gamer ayuda a una persona a registrar los videojuegos que tiene, las
partidas que juega y el avance que lleva. El Proyecto 3 respondía **qué estoy jugando, cuánto
tiempo le dedico y qué tan avanzado voy**.

La épica E2 agrega una pregunta distinta: **¿estoy cumpliendo lo que me propuse esta semana y
cuántos días seguidos llevo jugando?** Para eso cada videojuego puede tener una meta activa con
horas y días por semana, una lista corta de hitos de avance y un cálculo de progreso semanal y
racha.

## 2. Problema

La persona registra sus partidas, pero no sabe si está jugando lo que se propuso ni si es
constante. Juega mucho un fin de semana y luego abandona el juego dos semanas. Los datos existen,
pero no responden a la pregunta de constancia.

## 3. Usuarios

- **Persona que lleva el Diario** (único rol): registra sus juegos y partidas, define metas,
  consulta su progreso y desactiva metas cuando quiere cambiar de objetivo.
- No hay cuentas, permisos, metas compartidas ni administración.

## 4. Objetivo y métrica

**Objetivo:** que la persona pueda fijar una meta semanal por videojuego y ver, en el detalle del
juego, si la está cumpliendo, cuántos días seguidos lleva jugando y qué hitos alcanzó.

**Métrica de éxito:** en un mes, la persona cumple su meta semanal al menos **3 de 4 semanas**.
La métrica se evalúa con el uso del producto; no se construye un reporte histórico ni gráficos
porque están fuera de alcance.

## 5. Alcance

### Incluido en E2

1. Una meta activa por videojuego, con horas por semana y días por semana.
2. Hitos de avance embebidos en la meta (por ejemplo, «Llegar al 50 %»).
3. Progreso de la semana actual en el detalle del juego:
   horas jugadas frente a la meta, porcentaje de cumplimiento, días jugados frente a días
   objetivo, racha actual, mejor racha y estado de los hitos.
4. Crear, editar y desactivar la meta desde la interfaz, con confirmación al desactivar.
5. Recalcular el progreso después de registrar, editar o eliminar una partida.
6. Mensaje claro cuando ya existe una meta activa para ese juego.
7. Conservar el resumen del Proyecto 3 y el resto de la biblioteca.

### Fuera de alcance

- Notificaciones y recordatorios.
- Metas compartidas entre usuarios.
- Rankings o comparaciones entre personas.
- Gráficos históricos, calendarios de calor y reportes mensuales.
- Autenticación, multiusuario y permisos.
- Gamificación con puntos, medallas o niveles.
- Edición de partidas que ya existían antes de E2: **sí se incluye** como deuda pagada, porque E2
  necesita recalcular el progreso al editar una partida.

## 6. Reglas de negocio

### Reglas generales

- R-01. Una meta pertenece a un videojuego y un videojuego puede tener **como máximo una meta
  activa**. Las metas anteriores se conservan desactivadas.
- R-02. La meta tiene horas semanales (mayor que 0 y hasta 100) y días por semana (entero de 1 a 7).
- R-03. Los hitos son una lista corta: máximo 5. Cada hito tiene una descripción y un porcentaje
  objetivo entre 1 y 100. Puede no haber hitos.
- R-04. La semana va de **lunes a domingo en hora de Ecuador** (`America/Guayaquil`).
- R-05. El progreso semanal se calcula a partir de las partidas del videojuego, no se guarda como
  un dato aparte.
- R-06. El estado de un hito se deriva del porcentaje de avance actual del juego; no se guarda.
- R-07. Sin meta activa se siguen mostrando horas, días y rachas de la semana, pero no hay
  porcentaje de cumplimiento ni hitos.
- R-08. Sin partidas, las horas, los días y las rachas son 0 y ningún hito está alcanzado.

### Los ocho huecos de la ficha, resueltos

| # | Hueco | Decisión de producto | Ejemplo |
| --- | --- | --- | --- |
| 1 | Racha y día de hoy | **La racha no se rompe hasta que termina el día.** Si hoy todavía no hay partida pero ayer sí, la racha sigue viva y se cuenta hasta ayer. Si tampoco hay partida ayer, la racha es 0. | Hoy es miércoles y no jugué; ayer martes sí. La racha sigue. |
| 2 | Varias partidas el mismo día | **Cuentan como un solo día jugado.** Se cuentan días distintos, no sesiones. | Dos partidas el lunes = 1 día. |
| 3 | Partida que cruza la medianoche | **Pertenece al día en que empezó**, según la hora de Ecuador. No se reparte entre dos días. La app registra la fecha de la sesión; si la sesión empieza a las 23:30, cuenta para ese día. | Una sesión del lunes 23:30 al martes 00:30 cuenta para el lunes. |
| 4 | Cambio de meta a mitad de semana | **La semana completa se mide con la meta activa actual.** No se prorratea ni se mezcla con la meta anterior. La meta anterior queda desactivada y conserva su historial. | El jueves cambio de 5 h a 3 h; toda la semana se mide contra 3 h. |
| 5 | Meta superada | **El porcentaje se limita a 100 %.** Las horas reales se siguen mostrando (por ejemplo, 7 h de 5 h) y la meta se considera cumplida. | 7 h con meta de 5 h = 100 %, y se ven 7 h reales. |
| 6 | Hito ya alcanzado | **No queda bloqueado.** Si el avance actual baja por debajo del objetivo, el hito vuelve a estar pendiente. No se guarda un histórico de hitos. | Llegué al 50 % y luego registro 40 %; el hito de 50 % deja de estar alcanzado. |
| 7 | Juego completado o abandonado | **Sí puede tener meta activa.** El estado describe el juego; la meta describe el hábito semanal. No se bloquea por estado. | Un juego “abandonado” puede tener una meta para retomarlo. |
| 8 | Eliminar un videojuego con meta | **Se elimina también su meta y sus hitos**, junto con sus partidas, sin dejar datos huérfanos. La interfaz pide confirmación y avisa qué se borra. | Eliminar el juego borra su meta activa y las metas anteriores. |

### Supuestos adicionales (encontrados por el agente)

| # | Supuesto | Decisión |
| --- | --- | --- |
| S-01 | La fecha de una partida no tiene hora en la interfaz. | Se trata como una **fecha civil**: el día que la persona eligió. Si la API recibe una hora, se convierte a la fecha de Ecuador. Las fechas históricas guardadas a medianoche UTC se interpretan como fecha civil para no correrse un día. |
| S-02 | ¿Las partidas con fecha futura cuentan para la racha? | No. La racha y la mejor racha se calculan con días jugados hasta hoy. Una fecha futura no infla la constancia. |
| S-03 | ¿La racha se reinicia con la semana? | No. La racha y la mejor racha se calculan sobre todo el historial, sin cortar en lunes. |
| S-04 | ¿La mejor racha incluye la racha actual? | Sí. La racha actual es parte del historial y puede ser la mejor. |
| S-05 | ¿Se puede editar la meta? | Sí. Cambiar horas, días o hitos no borra la meta; el cambio aplica a la semana actual según R-04 y el hueco 4. |
| S-06 | ¿Se puede desactivar una meta y quedar sin meta? | Sí. Desactivar no elimina el historial; la persona puede crear otra meta después. |
| S-07 | ¿Una meta sin hitos es válida? | Sí. La ficha no exige un mínimo; los hitos son opcionales y se invita a agregarlos. |
| S-08 | ¿El porcentaje de horas puede ser negativo o superar 100? | No. Se redondea a entero, nunca baja de 0 y se limita a 100. |

## 7. Flujo principal

1. La persona abre un videojuego y ve que todavía no tiene meta activa.
2. Crea una meta: por ejemplo, 5 horas y 4 días por semana, con los hitos «Llegar al 25 %»,
   «Llegar al 50 %» y «Terminar el juego».
3. La app muestra la semana actual, las horas jugadas, el porcentaje, los días jugados, la racha
   actual y la mejor racha.
4. La persona registra una partida. Al volver al detalle, el progreso se consulta de nuevo.
5. Si el avance actual llega al objetivo de un hito, el hito aparece como alcanzado. Si luego baja,
   vuelve a pendiente.
6. Si intenta crear otra meta activa para el mismo juego, la app explica que ya existe una y no
   la duplica.
7. Si desactiva la meta, el detalle deja de mostrar porcentaje y hitos, pero sigue mostrando horas,
   días y rachas.

## 8. Puntos abiertos

No hay puntos abiertos que bloqueen E2. Quedan como deuda o decisiones futuras:

1. **Cumplimiento mensual (3 de 4 semanas):** la métrica se mide con uso, no con una pantalla
   histórica. Si el producto la necesitara, sería otra épica.
2. **Migración de fechas históricas:** si se decide que la partida tenga hora real y no fecha civil,
   habría que migrar datos. Hoy se resuelve con la regla S-01 y no bloquea.
3. **Tests de frontend y CI:** se difieren; el frontend se verifica con build y revisión de diseño.

## 9. Criterios de éxito del producto

- Se puede crear una meta con hitos sin leer documentación.
- El detalle responde de un vistazo: horas, porcentaje, días, racha actual, mejor racha e hitos.
- Registrar, editar o eliminar una partida cambia el progreso visible sin recargar a mano.
- La segunda meta activa se rechaza con un mensaje comprensible.
- Una persona puede explicar por qué su racha sigue viva o por qué se rompió.
- La interfaz mantiene el tono tranquilo de `DESIGN.md`.

# Épicas del Diario de Progreso Gamer

## E1 · Biblioteca, partidas y resumen (Proyecto 3)

**Pregunta que responde:** ¿qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy?

**Objetivo:** que una persona registre sus videojuegos y sus sesiones de juego, y que el backend
calcule un resumen real a partir de las partidas.

**Alcance**

- Ficha de videojuego con plataforma, género, estado y logros embebidos.
- Partidas referenciadas a un videojuego, con fecha, duración, porcentaje de avance y notas.
- Resumen calculado: total de partidas, horas totales, última partida y porcentaje de avance actual.
- CRUD de videojuegos, listado de partidas por juego, creación y eliminación de partidas.
- Borrado en cascada de las partidas al eliminar un videojuego.
- Frontend con biblioteca, detalle, formularios y lista de partidas.
- Arquitectura por capas y manejo centralizado de errores 400/404/500.
- Despliegue en Render y MongoDB Atlas.

**Estado:** implementado en el Proyecto 3. En E2 se conserva su contrato y se paga deuda
(edición de partidas, tests y regla de fecha civil).

**Fuera de alcance de E1:** metas, rachas, hitos, notificaciones, rankings y gráficos.

## E2 · Metas y rachas

**Pregunta que responde:** ¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos
llevo jugando?

**Objetivo:** que la persona fije una meta semanal por videojuego y vea en el detalle si la está
cumpliendo, cuál es su racha actual y qué hitos alcanzó.

**Alcance**

1. Meta activa por videojuego con horas semanales y días por semana.
2. Hitos embebidos con descripción y porcentaje objetivo.
3. Progreso semanal calculado con la semana de lunes a domingo en `America/Guayaquil`.
4. Racha actual y mejor racha sobre todo el historial de partidas.
5. Estado de hitos derivado del porcentaje de avance actual.
6. CRUD de meta (crear, consultar, listar, actualizar y desactivar) y rechazo de una segunda
   meta activa con 409 Conflict.
7. Cascada de metas e hitos al eliminar un videojuego.
8. Sección de progreso, formulario de meta y acción de desactivar en el frontend.
9. Recálculo visible del progreso al registrar, editar o eliminar una partida.
10. Tests de funciones puras de dominio y de validaciones del modelo.
11. Documentación SDD, harness, auditoría y trazabilidad en Git.

**Métrica de éxito:** en un mes, la persona cumple su meta semanal al menos 3 de 4 semanas.
No se construye una pantalla de historial mensual; la métrica se evalúa con el uso (fuera de alcance).

**Dependencias**

- E1 desplegado y funcionando.
- Ficha de hechos de E2 y decisiones de los ocho huecos en `docs/prd/PRD.md`.
- Rama `feature/e2-metas-rachas` y pull request a `main`.

**Fuera de alcance**

- Notificaciones y recordatorios.
- Metas compartidas entre usuarios.
- Rankings y comparaciones.
- Gráficos históricos y reportes mensuales.
- Autenticación y multiusuario.
- Puntos, medallas o niveles.

**Historias y tickets:** `docs/backlog/E2-metas-y-rachas.md`.

**Deuda técnica:** al final del backlog de E2, con el motivo de cada aplazamiento.

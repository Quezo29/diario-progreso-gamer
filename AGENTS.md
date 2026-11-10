# AGENTS.md — Diario de Progreso Gamer

## Proyecto
Diario personal para registrar videojuegos y partidas, calcular un resumen de progreso y,
desde E2, fijar metas semanales con hitos y rachas. Una sola persona, sin login.

## Stack
Backend: Node 20+, Express, TypeScript, Mongoose, MongoDB Atlas, Vitest.
Frontend: React 18, TypeScript, Vite, React Router. Sin librerías de UI.
Despliegue: dos servicios de Render descritos en `render.yaml`.

## Estructura
- `backend/src/modelos` esquemas Mongoose; `backend/src/dominio` funciones puras; `backend/src/services`
  reglas y acceso a datos; `backend/src/controllers` HTTP; `backend/src/routes` rutas; `backend/src/middlewares`.
- `frontend/src/api` servicios de API; `frontend/src/paginas` pantallas; `frontend/src/componentes`;
  `frontend/src/tipos.ts` contrato con la API; `frontend/src/estilos.css` tokens y estilos.
- `docs/prd`, `docs/backlog`, `docs/specs`, `docs/AUDITORIA.md`, `docs/bitacora-agente.md`.
- `.claude/` skills y hooks del agente. `DESIGN.md` es la fuente visual.

## Comandos
```powershell
cd backend; npm install; npm run dev; npm test; npm run build
cd frontend; npm install; npm run dev; npm run build
npm run format   # en la raíz, si está instalado Prettier
```

## Convenciones
- Código, comentarios, commits y documentos en español; identificadores en español.
- Commits: `tipo(E2): T-XX descripción` para implementación; `docs(E2): ...` para documentos.
- Backend por capas: el controlador no calcula reglas ni hace `populate`.
- Las reglas de semana, racha, horas e hitos viven en `backend/src/dominio` y no tocan la base.
- Cada cambio de comportamiento actualiza su spec, su criterio y su evidencia de auditoría.

## Reglas
- **Nunca leer ni modificar `backend/.env` ni `frontend/.env`.** Solo `.env.example` sin secretos.
- **Ninguna funcionalidad sin una spec en `docs/specs/`.** Si no existe, se escribe primero.
- **Ejecutar los tests antes de dar una tarea por terminada.** Backend `npm test`; frontend `npm run build`.
- No agregar una dependencia sin justificarla en la spec o en la bitácora.
- No borrar trabajo ajeno ni reescribir el historial de Git (`push --force` prohibido).
- Los cambios se integran con commits pequeños y un pull request a `main`.

## Frontend y diseño
Antes de tocar estilos, leer `DESIGN.md`. Todo estilo nuevo usa sus tokens CSS; no se copia
`DESIGN.md` en este archivo ni se inventan colores fuera de los tokens. No se usan librerías de UI.

## Flujo SDD
`diagnóstico → harness → PRD → épica → historias → criterios → tickets → specs → tests → código → auditoría`.
La spec se commitea antes que el código que implementa. La evidencia vive en `docs/AUDITORIA.md`.

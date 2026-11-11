---
name: commit
description: Prepara y crea un commit pequeño, trazable a un ticket de E2. Úsala cuando la persona pida guardar cambios en Git.
disable-model-invocation: true
---

# /commit — commit trazable

1. Ejecuta `git status --short` y `git diff --stat`. Nunca incluyas `.env`, `.env.*` (salvo
   `.env.example`), `node_modules`, `dist`, `.vite` ni archivos generados.
2. Identifica el ticket o documento al que pertenece el cambio. Si es implementación de E2,
   el asunto debe ser `tipo(E2): T-XX descripción`; si es documentación, `docs(E2): descripción`.
3. Antes de commitear, ejecuta la verificación que corresponda:
   - Backend: `npm test` y `npm run build` en `backend/`.
   - Frontend: `npm run build` en `frontend/`.
4. Revisa el diff completo. Si hay cambios de más de un ticket, sepáralos en commits distintos.
5. Agrega solo los archivos del cambio, nunca `git add .` a ciegas.
6. Crea el commit con un asunto de máximo 72 caracteres y un cuerpo breve que explique el
   criterio o la spec que cumple.
7. No hagas `push --force` ni reescribas commits ya publicados. Informa el hash y qué quedó fuera.

No commitees si los tests fallan. Si fallan por algo ajeno al cambio, dilo y no lo ocultes.

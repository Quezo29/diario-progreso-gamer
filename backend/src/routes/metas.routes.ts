/**
 * routes/metas.routes.ts
 * ----------------------
 * CRUD de metas. La ruta para listar las metas de un videojuego vive en
 * videojuegos.routes.ts porque cuelga de /api/videojuegos/:id.
 */

import { Router } from "express";
import * as metasController from "../controllers/metas.controller";

export const metasRouter = Router();

metasRouter.post("/", metasController.crear);
metasRouter.get("/:id", metasController.obtenerPorId);
metasRouter.put("/:id", metasController.actualizar);
metasRouter.patch("/:id/desactivar", metasController.desactivar);

/**
 * routes/videojuegos.routes.ts
 * ----------------------------
 * CRUD de la ficha, la ruta anidada de partidas, el resumen calculado
 * y la actualización de un logro embebido.
 */

import { Router } from "express";
import * as videojuegosController from "../controllers/videojuegos.controller";

export const videojuegosRouter = Router();

videojuegosRouter.get("/", videojuegosController.listar);
videojuegosRouter.get("/:id", videojuegosController.obtenerPorId);
videojuegosRouter.get("/:id/partidas", videojuegosController.listarPartidas);
videojuegosRouter.get("/:id/resumen", videojuegosController.resumen);
videojuegosRouter.post("/", videojuegosController.crear);
videojuegosRouter.put("/:id", videojuegosController.actualizar);
videojuegosRouter.patch("/:id/logros/:logroId", videojuegosController.actualizarLogro);
videojuegosRouter.delete("/:id", videojuegosController.eliminar);

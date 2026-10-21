/**
 * routes/partidas.routes.ts
 * -------------------------
 * Listar (con populate en el servicio), crear y eliminar.
 * La ruta anidada vive en videojuegos.routes.ts.
 */

import { Router } from "express";
import * as partidasController from "../controllers/partidas.controller";

export const partidasRouter = Router();

partidasRouter.get("/", partidasController.listar);
partidasRouter.post("/", partidasController.crear);
partidasRouter.delete("/:id", partidasController.eliminar);

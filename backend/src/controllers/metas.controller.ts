/**
 * controllers/metas.controller.ts
 * -------------------------------
 * Traducción HTTP del CRUD de metas. Las reglas y la existencia del
 * videojuego viven en metas.service.ts.
 */

import { Request, Response, NextFunction } from "express";
import * as metasService from "../services/metas.service";

export async function crear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meta = await metasService.crearMeta(req.body);
    res.status(201).json({ meta, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meta = await metasService.obtenerMetaPorId(req.params.id);
    res.json({ meta, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meta = await metasService.actualizarMeta(req.params.id, req.body);
    res.json({ meta, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function desactivar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const meta = await metasService.desactivarMeta(req.params.id);
    res.json({ meta, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

/**
 * controllers/partidas.controller.ts
 * ----------------------------------
 * No sabe de populate ni de comprobar si el videojuego existe.
 */

import { Request, Response, NextFunction } from "express";
import * as partidasService from "../services/partidas.service";

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuegoId = typeof req.query.videojuegoId === "string" ? req.query.videojuegoId : undefined;
    const partidas = await partidasService.listarPartidas(videojuegoId);
    res.json({ total: partidas.length, partidas, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const partida = await partidasService.crearPartida(req.body);
    res.status(201).json({ partida, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await partidasService.eliminarPartida(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * controllers/videojuegos.controller.ts
 * -------------------------------------
 * Traduce HTTP hacia los servicios. No calcula el resumen ni valida
 * la referencia de una partida: eso vive en la capa de servicio.
 */

import { Request, Response, NextFunction } from "express";
import * as videojuegosService from "../services/videojuegos.service";
import * as partidasService from "../services/partidas.service";

function queryTexto(valor: unknown): string | undefined {
  return typeof valor === "string" && valor.length > 0 ? valor : undefined;
}

export async function listar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuegos = await videojuegosService.listarVideojuegos({
      estado: queryTexto(req.query.estado),
      plataforma: queryTexto(req.query.plataforma),
    });
    res.json({ total: videojuegos.length, videojuegos, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuego = await videojuegosService.buscarVideojuegoPorId(req.params.id);
    res.json({ videojuego, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function crear(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuego = await videojuegosService.crearVideojuego(req.body);
    res.status(201).json({ videojuego, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuego = await videojuegosService.actualizarVideojuego(req.params.id, req.body);
    res.json({ videojuego, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await videojuegosService.eliminarVideojuego(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function actualizarLogro(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const videojuego = await videojuegosService.actualizarLogro(
      req.params.id,
      req.params.logroId,
      req.body?.obtenido
    );
    res.json({ videojuego, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function resumen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const calculado = await videojuegosService.calcularResumen(req.params.id);
    res.json({ ...calculado, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

export async function listarPartidas(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const partidas = await partidasService.listarPartidasDeVideojuego(req.params.id);
    res.json({ total: partidas.length, partidas, requestId: req.id });
  } catch (error) {
    next(error);
  }
}

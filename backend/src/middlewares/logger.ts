/**
 * middlewares/logger.ts
 * ---------------------
 * Registra método, ruta, id y duración cuando la respuesta termina.
 */

import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction): void {
  const inicio = Date.now();

  res.on("finish", () => {
    const duracionMs = Date.now() - inicio;
    console.log(
      `[${new Date().toISOString()}] id=${req.id} ${req.method} ${req.originalUrl} ` +
        `-> ${res.statusCode} (${duracionMs}ms)`
    );
  });

  next();
}

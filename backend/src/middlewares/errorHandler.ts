/**
 * middlewares/errorHandler.ts
 * ---------------------------
 * Distingue los 4 tipos de error y responde con el status que corresponde:
 *   1. ApiError              → el status que traiga (404 referencia, 400 regla)
 *   2. ValidationError       → 400  (required, enum, min, max)
 *   3. CastError             → 400  (id mal formado)
 *   4. cualquier otro        → 500  (no se filtra el detalle interno)
 */

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ApiError } from "../apiError";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message, requestId: req.id });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: err.message, requestId: req.id });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      error: `"${String(err.value)}" no es un id válido para el campo "${err.path}"`,
      requestId: req.id,
    });
    return;
  }

  if (err instanceof SyntaxError && "status" in err && (err as { status?: number }).status === 400) {
    res.status(400).json({ error: "El cuerpo de la petición no es JSON válido", requestId: req.id });
    return;
  }

  console.error(`[${new Date().toISOString()}] id=${req.id} ERROR:`, err);
  res.status(500).json({ error: "Error interno del servidor", requestId: req.id });
}

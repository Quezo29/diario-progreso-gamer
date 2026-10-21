/**
 * middlewares/requestId.ts
 * ------------------------
 * Asigna un id a cada petición para poder seguirla en el log y en el
 * cuerpo de error.
 */

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

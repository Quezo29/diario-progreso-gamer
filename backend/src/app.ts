/**
 * app.ts
 * ------
 * Ensambla Express: CORS para el frontend desplegado aparte, middlewares,
 * rutas y el manejador de errores al final.
 */

import cors from "cors";
import express, { Express, Request, Response } from "express";
import { env } from "./config/env";
import { requestId } from "./middlewares/requestId";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { videojuegosRouter } from "./routes/videojuegos.routes";
import { partidasRouter } from "./routes/partidas.routes";
import { ApiError } from "./apiError";

const ORIGENES_LOCALES = ["http://localhost:5173", "http://127.0.0.1:5173"];

function corsMiddleware() {
  if (env.corsOrigin.trim() === "*") {
    return cors({ origin: true });
  }

  const permitidos = new Set(
    [...ORIGENES_LOCALES, ...env.corsOrigin.split(",")]
      .map((origen) => origen.trim().replace(/\/$/, ""))
      .filter((origen) => origen.length > 0)
  );

  return cors({
    origin(origin, callback) {
      if (!origin || permitidos.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  });
}

export function crearApp(): Express {
  const app = express();

  app.use(corsMiddleware());
  app.use(express.json());
  app.use(requestId);
  app.use(logger);

  app.get("/api/salud", (req: Request, res: Response) => {
    res.json({ estado: "ok", requestId: req.id });
  });

  app.use("/api/videojuegos", videojuegosRouter);
  app.use("/api/partidas", partidasRouter);

  app.use("/api", (req: Request, _res: Response, next) => {
    next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
  });

  app.use(errorHandler);

  return app;
}

/**
 * config/env.ts
 * -------------
 * Único archivo que lee variables de entorno. La conexión y el resto de
 * la API importan `env` desde aquí; la cadena de MongoDB no aparece en
 * ningún otro archivo.
 */

import "dotenv/config";

interface Env {
  mongodbUri: string;
  mongodbDb: string;
  puerto: number;
  corsOrigin: string;
}

function leerEnv(): Env {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error(
      "Falta MONGODB_URI en tu .env. Copia .env.example a .env y completa la URI de Atlas."
    );
  }

  const puerto = process.env.PORT ? Number(process.env.PORT) : 3000;
  if (Number.isNaN(puerto)) {
    throw new Error("PORT debe ser un número.");
  }

  return {
    mongodbUri,
    mongodbDb: process.env.MONGODB_DB ?? "diario_gamer",
    puerto,
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  };
}

export const env = leerEnv();

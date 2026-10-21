/**
 * index.ts
 * --------
 * Conecta a MongoDB, crea la app y escucha. En local: npm run dev
 */

import { conectarDB } from "./conexionDB";
import { crearApp } from "./app";
import { env } from "./config/env";

async function main(): Promise<void> {
  await conectarDB();

  const app = crearApp();

  app.listen(env.puerto, "0.0.0.0", () => {
    console.log(`API del Diario de Progreso Gamer escuchando en http://localhost:${env.puerto}`);
    console.log(`Prueba: curl http://localhost:${env.puerto}/api/videojuegos`);
  });
}

main();

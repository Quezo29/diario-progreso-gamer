/**
 * conexionDB.ts
 * -------------
 * Solo abre y cierra la conexión, con los datos que config/env.ts ya
 * validó. Si Atlas no responde, el proceso termina: no tiene sentido
 * servir una API sin base de datos.
 */

import mongoose from "mongoose";
import { env } from "./config/env";

export async function conectarDB(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri, { dbName: env.mongodbDb });
    console.log(`Conectado a MongoDB Atlas (base: ${env.mongodbDb})`);
  } catch (error) {
    console.error("No se pudo conectar a MongoDB:", (error as Error).message);
    process.exit(1);
  }
}

export async function cerrarConexionDB(): Promise<void> {
  await mongoose.connection.close();
  console.log("Conexión a MongoDB cerrada");
}

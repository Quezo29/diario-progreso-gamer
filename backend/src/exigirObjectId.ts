/**
 * exigirObjectId.ts
 * -----------------
 * Mongoose trata como válido cualquier string de 12 bytes, no solo un
 * ObjectId hexadecimal de 24 caracteres. Aquí exigimos el formato real
 * de los ids que genera Atlas para responder 400 (CastError) cuando el
 * id viene mal formado, y no un 404 confuso.
 */

import mongoose from "mongoose";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

export function exigirObjectId(valor: unknown, campo: string): string {
  if (typeof valor !== "string" || !OBJECT_ID.test(valor)) {
    throw new mongoose.Error.CastError("ObjectId", valor, campo);
  }
  return valor;
}

/**
 * modelos/Partida.model.ts
 * ------------------------
 * Cada sesión de juego es un documento propio que REFERENCIA al
 * videojuego. No va embebida: las partidas crecen sin límite y también
 * se listan aparte de la ficha (por ejemplo, todas las de esta semana).
 * Es el mismo criterio que Avistamiento respecto de Criatura.
 */

import { Schema, model, Document, Types } from "mongoose";

export interface IPartida extends Document {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartidaSchema = new Schema<IPartida>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "La partida debe estar vinculada a un videojuego"],
    },
    fecha: {
      type: Date,
      required: [true, "La fecha de la partida es obligatoria"],
    },
    duracionMinutos: {
      type: Number,
      required: [true, "La duración en minutos es obligatoria"],
      min: [1, "La duración mínima es 1 minuto"],
      max: [10080, "La duración máxima es 10080 minutos (7 días)"],
    },
    porcentajeAvance: {
      type: Number,
      required: [true, "El porcentaje de avance es obligatorio"],
      min: [0, "El porcentaje de avance mínimo es 0"],
      max: [100, "El porcentaje de avance máximo es 100"],
    },
    notas: {
      type: String,
      required: false,
      trim: true,
      maxlength: [500, "Las notas no pueden superar 500 caracteres"],
    },
  },
  { timestamps: true }
);

PartidaSchema.index({ videojuego: 1, fecha: -1 });

export const Partida = model<IPartida>("Partida", PartidaSchema);

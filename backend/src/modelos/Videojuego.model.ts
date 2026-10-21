/**
 * modelos/Videojuego.model.ts
 * ---------------------------
 * Ficha del juego. Los logros van EMBEBIDOS: son pocos, no se consultan
 * solos y siempre se leen junto con el juego (el mismo criterio que
 * habilidades en Criatura, pero como subdocumentos y no como strings,
 * porque cada logro tiene nombre y un estado obtenido).
 */

import { Schema, model, Document, Types } from "mongoose";

export const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export const GENEROS = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export const ESTADOS_VIDEOJUEGO = ["jugando", "pausado", "completado", "abandonado"] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type EstadoVideojuego = (typeof ESTADOS_VIDEOJUEGO)[number];

export interface ILogro {
  _id: Types.ObjectId;
  nombre: string;
  obtenido: boolean;
}

export interface IVideojuego extends Document {
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros: ILogro[];
  createdAt: Date;
  updatedAt: Date;
}

const LogroSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del logro es obligatorio"],
      trim: true,
      maxlength: [80, "El nombre del logro no puede superar 80 caracteres"],
    },
    obtenido: { type: Boolean, default: false },
  },
  { _id: true }
);

const VideojuegoSchema = new Schema<IVideojuego>(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del videojuego es obligatorio"],
      trim: true,
      maxlength: [120, "El nombre del videojuego no puede superar 120 caracteres"],
    },
    plataforma: {
      type: String,
      enum: {
        values: [...PLATAFORMAS],
        message: "{VALUE} no es una plataforma válida",
      },
      required: [true, "La plataforma es obligatoria"],
    },
    genero: {
      type: String,
      enum: {
        values: [...GENEROS],
        message: "{VALUE} no es un género válido",
      },
      required: [true, "El género es obligatorio"],
    },
    estado: {
      type: String,
      enum: {
        values: [...ESTADOS_VIDEOJUEGO],
        message: "{VALUE} no es un estado válido",
      },
      default: "jugando",
    },
    logros: { type: [LogroSchema], default: [] },
  },
  { timestamps: true }
);

export const Videojuego = model<IVideojuego>("Videojuego", VideojuegoSchema);

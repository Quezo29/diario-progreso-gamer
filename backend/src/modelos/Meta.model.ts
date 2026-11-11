/**
 * modelos/Meta.model.ts
 * ---------------------
 * Meta semanal de un videojuego. Se REFERENCIA al juego porque tiene su
 * propio ciclo de vida (crear, reemplazar, desactivar) y conserva el
 * historial de metas anteriores. Los hitos se EMBEBEN: son una lista
 * corta y acotada que solo tiene sentido dentro de su meta.
 *
 * El estado "alcanzado" de un hito no se guarda: se calcula con el
 * porcentaje de avance actual del juego (ver dominio/progreso.ts).
 */

import { Schema, model, Document, Types } from "mongoose";

export interface IHitoMeta {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface IMeta extends Document {
  videojuego: Types.ObjectId;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: IHitoMeta[];
  createdAt: Date;
  updatedAt: Date;
}

const HitoMetaSchema = new Schema<IHitoMeta>(
  {
    descripcion: {
      type: String,
      required: [true, "La descripción del hito es obligatoria"],
      trim: true,
    },
    porcentajeObjetivo: {
      type: Number,
      required: [true, "El porcentaje objetivo del hito es obligatorio"],
      min: [1, "El porcentaje objetivo mínimo es 1"],
      max: [100, "El porcentaje objetivo máximo es 100"],
    },
  },
  { _id: false }
);

const MetaSchema = new Schema<IMeta>(
  {
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "La meta debe estar vinculada a un videojuego"],
    },
    horasSemanales: {
      type: Number,
      required: [true, "Las horas semanales son obligatorias"],
      validate: {
        validator: (valor: number) => typeof valor === "number" && valor > 0,
        message: "Las horas semanales deben ser mayores que 0",
      },
      max: [100, "Las horas semanales no pueden superar 100"],
    },
    diasPorSemana: {
      type: Number,
      required: [true, "Los días por semana son obligatorios"],
      min: [1, "Los días por semana mínimos son 1"],
      max: [7, "Los días por semana máximos son 7"],
      validate: {
        validator: (valor: number) => Number.isInteger(valor),
        message: "Los días por semana deben ser un número entero",
      },
    },
    activa: {
      type: Boolean,
      default: true,
    },
    hitos: {
      type: [HitoMetaSchema],
      default: [],
      validate: {
        validator: (hitos: IHitoMeta[]) => hitos.length <= 5,
        message: "Una meta puede tener como máximo 5 hitos",
      },
    },
  },
  { timestamps: true }
);

// Una sola meta activa por videojuego. El servicio da el mensaje claro;
// este índice protege ante dos peticiones simultáneas.
MetaSchema.index(
  { videojuego: 1 },
  {
    unique: true,
    partialFilterExpression: { activa: true },
    name: "una_meta_activa_por_videojuego",
  }
);

export const Meta = model<IMeta>("Meta", MetaSchema);

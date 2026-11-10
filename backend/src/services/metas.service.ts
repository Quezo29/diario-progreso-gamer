/**
 * services/metas.service.ts
 * -------------------------
 * Reglas de Meta: el videojuego debe existir, solo puede haber una meta
 * activa por juego y desactivar conserva el historial. El controlador solo
 * traduce HTTP; las validaciones de forma viven en el modelo.
 */

import { Meta, IMeta, IHitoMeta } from "../modelos/Meta.model";
import { Videojuego } from "../modelos/Videojuego.model";
import { ApiError } from "../apiError";
import { exigirObjectId } from "../exigirObjectId";

export interface DatosMeta {
  videojuego?: string;
  horasSemanales?: number;
  diasPorSemana?: number;
  activa?: boolean;
  hitos?: IHitoMeta[];
}

const MENSAJE_META_ACTIVA =
  "El videojuego ya tiene una meta activa. Desactívala antes de crear o activar otra.";

function esDuplicado(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

async function exigirVideojuego(videojuegoId: string): Promise<void> {
  exigirObjectId(videojuegoId, "videojuego");
  const existe = await Videojuego.exists({ _id: videojuegoId });
  if (!existe) {
    throw new ApiError(404, `No existe un videojuego con id ${videojuegoId}`);
  }
}

async function exigirMetaActivaLibre(videojuegoId: string, metaId?: string): Promise<void> {
  const filtro: Record<string, unknown> = { videojuego: videojuegoId, activa: true };
  if (metaId) filtro._id = { $ne: metaId };

  const existente = await Meta.findOne(filtro).select("_id");
  if (existente) {
    throw new ApiError(409, MENSAJE_META_ACTIVA);
  }
}

export async function crearMeta(datos: DatosMeta): Promise<IMeta> {
  if (!datos.videojuego) {
    throw new ApiError(400, "El videojuego es obligatorio para crear una meta");
  }

  await exigirVideojuego(datos.videojuego);

  const activa = datos.activa ?? true;
  if (activa) {
    await exigirMetaActivaLibre(datos.videojuego);
  }

  try {
    return await Meta.create({ ...datos, activa });
  } catch (error) {
    if (esDuplicado(error)) {
      throw new ApiError(409, MENSAJE_META_ACTIVA);
    }
    throw error;
  }
}

export async function obtenerMetaPorId(id: string): Promise<IMeta> {
  exigirObjectId(id, "_id");
  const meta = await Meta.findById(id);
  if (!meta) {
    throw new ApiError(404, `No existe una meta con id ${id}`);
  }
  return meta;
}

export async function listarMetasDeVideojuego(videojuegoId: string): Promise<IMeta[]> {
  await exigirVideojuego(videojuegoId);
  return Meta.find({ videojuego: videojuegoId }).sort({ activa: -1, createdAt: -1 });
}

export async function actualizarMeta(id: string, datos: DatosMeta): Promise<IMeta> {
  exigirObjectId(id, "_id");
  const meta = await Meta.findById(id);
  if (!meta) {
    throw new ApiError(404, `No existe una meta con id ${id}`);
  }

  if (datos.videojuego !== undefined && String(datos.videojuego) !== String(meta.videojuego)) {
    throw new ApiError(400, "El videojuego de una meta no se puede cambiar");
  }

  if (datos.activa === true) {
    await exigirMetaActivaLibre(meta.videojuego.toString(), meta._id.toString());
  }

  if (datos.horasSemanales !== undefined) meta.horasSemanales = datos.horasSemanales;
  if (datos.diasPorSemana !== undefined) meta.diasPorSemana = datos.diasPorSemana;
  if (datos.hitos !== undefined) meta.hitos = datos.hitos;
  if (datos.activa !== undefined) meta.activa = datos.activa;

  try {
    await meta.save();
  } catch (error) {
    if (esDuplicado(error)) {
      throw new ApiError(409, MENSAJE_META_ACTIVA);
    }
    throw error;
  }

  return meta;
}

export async function desactivarMeta(id: string): Promise<IMeta> {
  const meta = await obtenerMetaPorId(id);
  if (meta.activa) {
    meta.activa = false;
    await meta.save();
  }
  return meta;
}

/**
 * Cascada de borrado. Se usa cuando se elimina un videojuego para no
 * dejar metas ni hitos huérfanos.
 */
export async function eliminarMetasDeVideojuego(videojuegoId: string): Promise<void> {
  await Meta.deleteMany({ videojuego: videojuegoId });
}

export async function buscarMetaActiva(videojuegoId: string): Promise<IMeta | null> {
  return Meta.findOne({ videojuego: videojuegoId, activa: true });
}

/**
 * services/partidas.service.ts
 * ----------------------------
 * Cada partida referencia un videojuego. Antes de crearla o cambiarla se
 * comprueba que esa ficha exista: si no, 404. Al listar, consultar o
 * editar se usa populate para devolver el juego y no solo su id.
 */

import { Partida, IPartida } from "../modelos/Partida.model";
import { Videojuego } from "../modelos/Videojuego.model";
import { ApiError } from "../apiError";
import { exigirObjectId } from "../exigirObjectId";

export interface DatosPartida {
  videojuego?: string;
  fecha?: Date | string;
  duracionMinutos?: number;
  porcentajeAvance?: number;
  notas?: string;
}

/**
 * PE-03: en una edición solo se aceptan los campos del formulario; _id,
 * createdAt y updatedAt nunca se copian del cuerpo.
 */
function camposEditables(datos: DatosPartida): DatosPartida {
  const limpio: DatosPartida = {};
  if (datos.videojuego !== undefined) limpio.videojuego = datos.videojuego;
  if (datos.fecha !== undefined) limpio.fecha = datos.fecha;
  if (datos.duracionMinutos !== undefined) limpio.duracionMinutos = datos.duracionMinutos;
  if (datos.porcentajeAvance !== undefined) limpio.porcentajeAvance = datos.porcentajeAvance;
  if (datos.notas !== undefined) limpio.notas = datos.notas;
  return limpio;
}

async function exigirVideojuego(videojuegoId: string): Promise<void> {
  exigirObjectId(videojuegoId, "videojuego");
  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${videojuegoId}`);
  }
}

export async function listarPartidas(videojuegoId?: string): Promise<IPartida[]> {
  if (videojuegoId) {
    exigirObjectId(videojuegoId, "videojuego");
  }
  const filtro = videojuegoId ? { videojuego: videojuegoId } : {};
  return Partida.find(filtro).populate("videojuego").sort({ fecha: -1, createdAt: -1 });
}

export async function listarPartidasDeVideojuego(videojuegoId: string): Promise<IPartida[]> {
  exigirObjectId(videojuegoId, "_id");
  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${videojuegoId}`);
  }
  return Partida.find({ videojuego: videojuegoId }).sort({ fecha: -1, createdAt: -1 });
}

export async function crearPartida(datos: DatosPartida): Promise<IPartida> {
  if (datos.videojuego) {
    await exigirVideojuego(datos.videojuego);
  }

  const partida = await Partida.create(camposEditables(datos));
  return partida.populate("videojuego");
}

export async function obtenerPartidaPorId(id: string): Promise<IPartida> {
  exigirObjectId(id, "_id");
  const partida = await Partida.findById(id).populate("videojuego");
  if (!partida) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }
  return partida;
}

export async function actualizarPartida(id: string, datos: DatosPartida): Promise<IPartida> {
  exigirObjectId(id, "_id");
  const partida = await Partida.findById(id);
  if (!partida) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }

  const cambios = camposEditables(datos);
  if (cambios.videojuego !== undefined) {
    await exigirVideojuego(cambios.videojuego);
  }

  if (cambios.videojuego !== undefined) partida.set("videojuego", cambios.videojuego);
  if (cambios.fecha !== undefined) partida.fecha = new Date(cambios.fecha);
  if (cambios.duracionMinutos !== undefined) partida.duracionMinutos = cambios.duracionMinutos;
  if (cambios.porcentajeAvance !== undefined) partida.porcentajeAvance = cambios.porcentajeAvance;
  if (cambios.notas !== undefined) partida.notas = cambios.notas;

  await partida.save();
  return partida.populate("videojuego");
}

export async function eliminarPartida(id: string): Promise<void> {
  exigirObjectId(id, "_id");
  const resultado = await Partida.findByIdAndDelete(id);
  if (!resultado) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }
}

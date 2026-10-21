/**
 * services/partidas.service.ts
 * ----------------------------
 * Cada partida referencia un videojuego. Antes de crearla se comprueba
 * que esa ficha exista: si no, 404. Al listar todas se usa populate
 * para devolver el juego y no solo su id.
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
    exigirObjectId(datos.videojuego, "videojuego");
    const videojuego = await Videojuego.findById(datos.videojuego);
    if (!videojuego) {
      throw new ApiError(404, `No existe un videojuego con id ${datos.videojuego}`);
    }
  }

  const partida = await Partida.create(datos);
  return partida.populate("videojuego");
}

export async function eliminarPartida(id: string): Promise<void> {
  exigirObjectId(id, "_id");
  const resultado = await Partida.findByIdAndDelete(id);
  if (!resultado) {
    throw new ApiError(404, `No existe una partida con id ${id}`);
  }
}

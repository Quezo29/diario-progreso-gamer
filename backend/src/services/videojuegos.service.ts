/**
 * services/videojuegos.service.ts
 * -------------------------------
 * Reglas de la ficha: CRUD, marcar un logro embebido y el resumen
 * calculado a partir de las partidas. El controlador solo traduce HTTP.
 */

import {
  ESTADOS_VIDEOJUEGO,
  EstadoVideojuego,
  PLATAFORMAS,
  Plataforma,
  Videojuego,
  IVideojuego,
} from "../modelos/Videojuego.model";
import { Partida } from "../modelos/Partida.model";
import { ApiError } from "../apiError";
import { exigirObjectId } from "../exigirObjectId";

export interface FiltroVideojuegos {
  estado?: string;
  plataforma?: string;
}

export interface ResumenVideojuego {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

function afirmarValor<T extends string>(valor: string | undefined, permitidos: readonly T[], campo: string): T | undefined {
  if (!valor) return undefined;
  if (!(permitidos as readonly string[]).includes(valor)) {
    throw new ApiError(400, `"${valor}" no es un valor válido para ${campo}`);
  }
  return valor as T;
}

export async function listarVideojuegos(filtro: FiltroVideojuegos = {}): Promise<IVideojuego[]> {
  const consulta: { estado?: EstadoVideojuego; plataforma?: Plataforma } = {};
  const estado = afirmarValor(filtro.estado, ESTADOS_VIDEOJUEGO, "estado");
  const plataforma = afirmarValor(filtro.plataforma, PLATAFORMAS, "plataforma");

  if (estado) consulta.estado = estado;
  if (plataforma) consulta.plataforma = plataforma;

  return Videojuego.find(consulta).sort({ nombre: 1 });
}

export async function buscarVideojuegoPorId(id: string): Promise<IVideojuego> {
  exigirObjectId(id, "_id");
  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${id}`);
  }
  return videojuego;
}

export async function crearVideojuego(datos: Partial<IVideojuego>): Promise<IVideojuego> {
  return Videojuego.create(datos);
}

export async function actualizarVideojuego(id: string, cambios: Partial<IVideojuego>): Promise<IVideojuego> {
  exigirObjectId(id, "_id");
  const actualizado = await Videojuego.findByIdAndUpdate(id, cambios, {
    new: true,
    runValidators: true,
  });
  if (!actualizado) {
    throw new ApiError(404, `No existe un videojuego con id ${id}`);
  }
  return actualizado;
}

export async function eliminarVideojuego(id: string): Promise<void> {
  exigirObjectId(id, "_id");
  const videojuego = await Videojuego.findById(id);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${id}`);
  }

  await Partida.deleteMany({ videojuego: id });
  await videojuego.deleteOne();
}

/**
 * Marca o desmarca un logro embebido. Los dos ids se validan antes de
 * tocar la base: si no son ObjectId, exigirObjectId lanza CastError (400).
 */
export async function actualizarLogro(
  videojuegoId: string,
  logroId: string,
  obtenido: unknown
): Promise<IVideojuego> {
  if (typeof obtenido !== "boolean") {
    throw new ApiError(400, "El campo obtenido debe ser true o false");
  }

  exigirObjectId(videojuegoId, "_id");
  exigirObjectId(logroId, "logroId");

  const videojuego = await Videojuego.findById(videojuegoId);
  if (!videojuego) {
    throw new ApiError(404, `No existe un videojuego con id ${videojuegoId}`);
  }

  const logro = videojuego.logros.find((item) => item._id.toString() === logroId);
  if (!logro) {
    throw new ApiError(404, `No existe un logro con id ${logroId} en este videojuego`);
  }

  logro.obtenido = obtenido;
  await videojuego.save();
  return videojuego;
}

/**
 * Fórmula del resumen (sobre las partidas de un solo videojuego):
 *   totalPartidas          = cantidad de documentos
 *   horasTotales           = redondear( suma(duracionMinutos) / 60 , 1 decimal )
 *   ultimaPartida          = fecha máxima; si empatan, gana el createdAt más nuevo
 *   porcentajeAvanceActual = porcentajeAvance de esa misma partida
 * Sin partidas: ceros y ultimaPartida en null. El videojuego sí debe existir.
 */
export async function calcularResumen(videojuegoId: string): Promise<ResumenVideojuego> {
  await buscarVideojuegoPorId(videojuegoId);

  const partidas = await Partida.find({ videojuego: videojuegoId });

  if (partidas.length === 0) {
    return {
      totalPartidas: 0,
      horasTotales: 0,
      ultimaPartida: null,
      porcentajeAvanceActual: 0,
    };
  }

  const minutosTotales = partidas.reduce((suma, partida) => suma + partida.duracionMinutos, 0);
  const horasTotales = Math.round((minutosTotales / 60) * 10) / 10;

  const masReciente = partidas.reduce((actual, candidata) => {
    const diferenciaFecha = candidata.fecha.getTime() - actual.fecha.getTime();
    if (diferenciaFecha > 0) return candidata;
    if (diferenciaFecha < 0) return actual;
    return candidata.createdAt.getTime() > actual.createdAt.getTime() ? candidata : actual;
  });

  return {
    totalPartidas: partidas.length,
    horasTotales,
    ultimaPartida: masReciente.fecha.toISOString(),
    porcentajeAvanceActual: masReciente.porcentajeAvance,
  };
}

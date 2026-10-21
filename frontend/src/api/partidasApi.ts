/**
 * api/partidasApi.ts
 * ------------------
 * Único archivo que habla con /api/partidas y con la ruta anidada
 * /api/videojuegos/:id/partidas.
 */

import { manejarRespuesta, urlApi } from "./http";
import { Partida, PartidaFormulario } from "../tipos";

const BASE_PARTIDAS = urlApi("/api/partidas");
const BASE_VIDEOJUEGOS = urlApi("/api/videojuegos");

export async function obtenerPartidas(): Promise<Partida[]> {
  const respuesta = await fetch(BASE_PARTIDAS);
  const datos = await manejarRespuesta<{ partidas: Partida[] }>(respuesta);
  return datos.partidas;
}

export async function obtenerPartidasDeVideojuego(videojuegoId: string): Promise<Partida[]> {
  const respuesta = await fetch(`${BASE_VIDEOJUEGOS}/${videojuegoId}/partidas`);
  const datos = await manejarRespuesta<{ partidas: Partida[] }>(respuesta);
  return datos.partidas;
}

export async function crearPartida(datos: PartidaFormulario): Promise<Partida> {
  const respuesta = await fetch(BASE_PARTIDAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...datos,
      fecha: `${datos.fecha}T00:00:00.000Z`,
      notas: datos.notas?.trim() ? datos.notas.trim() : undefined,
    }),
  });
  const resultado = await manejarRespuesta<{ partida: Partida }>(respuesta);
  return resultado.partida;
}

export async function eliminarPartida(id: string): Promise<void> {
  const respuesta = await fetch(`${BASE_PARTIDAS}/${id}`, { method: "DELETE" });
  await manejarRespuesta<void>(respuesta);
}

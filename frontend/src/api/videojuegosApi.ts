/**
 * api/videojuegosApi.ts
 * ---------------------
 * Único archivo que habla con /api/videojuegos, incluido el resumen
 * calculado y la actualización de un logro embebido.
 */

import { manejarRespuesta, urlApi } from "./http";
import {
  EstadoVideojuego,
  Plataforma,
  ResumenVideojuego,
  Videojuego,
  VideojuegoFormulario,
} from "../tipos";

const BASE = urlApi("/api/videojuegos");

export interface FiltroVideojuegos {
  estado?: EstadoVideojuego;
  plataforma?: Plataforma;
}

export async function obtenerVideojuegos(filtro: FiltroVideojuegos = {}): Promise<Videojuego[]> {
  const parametros = new URLSearchParams();
  if (filtro.estado) parametros.set("estado", filtro.estado);
  if (filtro.plataforma) parametros.set("plataforma", filtro.plataforma);
  const consulta = parametros.toString();
  const respuesta = await fetch(consulta ? `${BASE}?${consulta}` : BASE);
  const datos = await manejarRespuesta<{ videojuegos: Videojuego[] }>(respuesta);
  return datos.videojuegos;
}

export async function obtenerVideojuegoPorId(id: string): Promise<Videojuego> {
  const respuesta = await fetch(`${BASE}/${id}`);
  const datos = await manejarRespuesta<{ videojuego: Videojuego }>(respuesta);
  return datos.videojuego;
}

export async function obtenerResumen(id: string): Promise<ResumenVideojuego> {
  const respuesta = await fetch(`${BASE}/${id}/resumen`);
  return manejarRespuesta<ResumenVideojuego>(respuesta);
}

export async function crearVideojuego(datos: VideojuegoFormulario): Promise<Videojuego> {
  const respuesta = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const resultado = await manejarRespuesta<{ videojuego: Videojuego }>(respuesta);
  return resultado.videojuego;
}

export async function actualizarVideojuego(id: string, datos: VideojuegoFormulario): Promise<Videojuego> {
  const respuesta = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const resultado = await manejarRespuesta<{ videojuego: Videojuego }>(respuesta);
  return resultado.videojuego;
}

export async function eliminarVideojuego(id: string): Promise<void> {
  const respuesta = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  await manejarRespuesta<void>(respuesta);
}

export async function actualizarLogro(id: string, logroId: string, obtenido: boolean): Promise<Videojuego> {
  const respuesta = await fetch(`${BASE}/${id}/logros/${logroId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ obtenido }),
  });
  const resultado = await manejarRespuesta<{ videojuego: Videojuego }>(respuesta);
  return resultado.videojuego;
}

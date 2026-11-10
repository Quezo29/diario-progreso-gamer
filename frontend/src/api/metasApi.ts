/**
 * api/metasApi.ts
 * ---------------
 * Único archivo que habla con /api/metas y con las rutas de progreso y
 * metas que cuelgan de /api/videojuegos/:id. Ninguna página llama a fetch.
 */

import { manejarRespuesta, urlApi } from "./http";
import { Meta, MetaFormulario, ProgresoSemanal } from "../tipos";

const BASE_METAS = urlApi("/api/metas");
const BASE_VIDEOJUEGOS = urlApi("/api/videojuegos");

export async function obtenerProgresoSemanal(videojuegoId: string): Promise<ProgresoSemanal> {
  const respuesta = await fetch(`${BASE_VIDEOJUEGOS}/${videojuegoId}/progreso-semanal`);
  return manejarRespuesta<ProgresoSemanal>(respuesta);
}

export async function listarMetasDeVideojuego(videojuegoId: string): Promise<Meta[]> {
  const respuesta = await fetch(`${BASE_VIDEOJUEGOS}/${videojuegoId}/metas`);
  const datos = await manejarRespuesta<{ metas: Meta[] }>(respuesta);
  return datos.metas;
}

export async function obtenerMetaPorId(id: string): Promise<Meta> {
  const respuesta = await fetch(`${BASE_METAS}/${id}`);
  const datos = await manejarRespuesta<{ meta: Meta }>(respuesta);
  return datos.meta;
}

export async function crearMeta(videojuegoId: string, datos: MetaFormulario): Promise<Meta> {
  const respuesta = await fetch(BASE_METAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...datos, videojuego: videojuegoId }),
  });
  const resultado = await manejarRespuesta<{ meta: Meta }>(respuesta);
  return resultado.meta;
}

export async function actualizarMeta(id: string, datos: MetaFormulario): Promise<Meta> {
  const respuesta = await fetch(`${BASE_METAS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  const resultado = await manejarRespuesta<{ meta: Meta }>(respuesta);
  return resultado.meta;
}

export async function desactivarMeta(id: string): Promise<Meta> {
  const respuesta = await fetch(`${BASE_METAS}/${id}/desactivar`, { method: "PATCH" });
  const resultado = await manejarRespuesta<{ meta: Meta }>(respuesta);
  return resultado.meta;
}

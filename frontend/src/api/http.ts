/**
 * api/http.ts
 * -----------
 * El fetch vive aquí y en los dos servicios de API. Ninguna página lo llama.
 */

const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function urlApi(ruta: string): string {
  return `${API_URL}${ruta}`;
}

export async function manejarRespuesta<T>(respuesta: Response): Promise<T> {
  if (!respuesta.ok) {
    const cuerpo = (await respuesta.json().catch(() => ({}))) as { error?: unknown };
    const mensaje = typeof cuerpo.error === "string" ? cuerpo.error : `Error HTTP ${respuesta.status}`;
    throw new Error(mensaje);
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  return respuesta.json() as Promise<T>;
}

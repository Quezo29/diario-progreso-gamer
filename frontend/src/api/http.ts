/**
 * api/http.ts
 * -----------
 * El fetch vive aquí y en los dos servicios de API. Ninguna página lo llama.
 */

// En desarrollo, si no hay VITE_API_URL, se llama directo al Express.
// Una ruta relativa /api se queda en Vite y este responde el index.html,
// que no es JSON.
const configurada = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_URL = configurada || (import.meta.env.DEV ? "http://localhost:3000" : "");

export function urlApi(ruta: string): string {
  return `${API_URL}${ruta}`;
}

export async function manejarRespuesta<T>(respuesta: Response): Promise<T> {
  if (respuesta.status === 204) {
    return undefined as T;
  }

  const tipo = respuesta.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) {
    throw new Error(
      "La API no respondió JSON. Comprueba que el backend siga en http://localhost:3000."
    );
  }

  const cuerpo = (await respuesta.json()) as T & { error?: unknown };
  if (!respuesta.ok) {
    const mensaje = typeof cuerpo.error === "string" ? cuerpo.error : `Error HTTP ${respuesta.status}`;
    throw new Error(mensaje);
  }

  return cuerpo;
}

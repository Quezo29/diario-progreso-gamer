/**
 * formato.ts
 * ----------
 * Textos de fecha y duración para las pantallas. Las fechas de partida
 * se guardan como medianoche UTC (el día que eligió la persona), así que
 * se muestran en UTC para no correrlas un día en Colombia.
 */

import { Partida } from "./tipos";

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  if (resto === 0) return `${horas} h`;
  return `${horas} h ${resto} min`;
}

export function formatearHoras(horas: number): string {
  return `${horas} h`;
}

export function hoyISO(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

export function nombreDePartida(partida: Partida): string {
  if (partida.videojuego && typeof partida.videojuego === "object") {
    return partida.videojuego.nombre;
  }
  return "Videojuego no disponible";
}

export function idDePartida(partida: Partida): string | null {
  if (partida.videojuego && typeof partida.videojuego === "object") {
    return partida.videojuego._id;
  }
  if (typeof partida.videojuego === "string") return partida.videojuego;
  return null;
}

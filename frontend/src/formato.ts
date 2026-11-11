/**
 * formato.ts
 * ----------
 * Textos de fecha y duración para las pantallas. Una partida se guarda
 * como fecha civil: medianoche UTC para los datos del Proyecto 3 y
 * mediodía UTC para los formularios de E2. Un instante con hora real se
 * lee en America/Guayaquil, igual que en el dominio del backend.
 */

import { Partida } from "./tipos";

const FORMATO_DIA_EC = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Guayaquil",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function fechaCivilDePartida(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso.slice(0, 10);

  const esMedianocheUTC =
    fecha.getUTCHours() === 0 &&
    fecha.getUTCMinutes() === 0 &&
    fecha.getUTCSeconds() === 0 &&
    fecha.getUTCMilliseconds() === 0;

  if (esMedianocheUTC) return fecha.toISOString().slice(0, 10);

  const partes = FORMATO_DIA_EC.formatToParts(fecha);
  const valor = (tipo: Intl.DateTimeFormatPartTypes): string =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = fechaCivilDePartida(iso).split("-").map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia)).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatearDiaCorto(dia: string): string {
  return new Date(`${dia}T12:00:00.000Z`).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatearRangoSemana(inicio: string, fin: string): string {
  return `${formatearDiaCorto(inicio)} – ${formatearDiaCorto(fin)}`;
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

/**
 * dominio/progreso.ts
 * -------------------
 * Reglas puras de E2: semana de lunes a domingo en America/Guayaquil,
 * horas y días de la semana, rachas y estado de hitos. Este archivo no
 * importa Mongoose ni toca la base: el servicio le pasa los datos ya
 * consultados y aquí solo se calcula.
 */

export const ZONA_HORARIA = "America/Guayaquil";

export interface PartidaProgreso {
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  createdAt?: Date;
}

export interface HitoMetaProgreso {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface MetaProgreso {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: HitoMetaProgreso[];
}

export interface HitoProgreso extends HitoMetaProgreso {
  alcanzado: boolean;
}

export interface RangoSemana {
  inicio: string;
  fin: string;
}

export interface Rachas {
  rachaActual: number;
  mejorRacha: number;
}

export interface ProgresoSemanalCalculado {
  semana: RangoSemana;
  meta: { horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoProgreso[];
}

const FORMATO_DIA = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA_HORARIA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function partesDeFecha(fecha: Date): string {
  const partes = FORMATO_DIA.formatToParts(fecha);
  const valor = (tipo: Intl.DateTimeFormatPartTypes): string =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

/**
 * Convierte un instante a la fecha civil de Ecuador. Ejemplo:
 * 2026-11-03T02:00:00Z = 21:00 del 2 de noviembre en Guayaquil.
 */
export function diaEnGuayaquil(fecha: Date): string {
  return partesDeFecha(fecha);
}

function esMedianocheUTC(fecha: Date): boolean {
  return (
    fecha.getUTCHours() === 0 &&
    fecha.getUTCMinutes() === 0 &&
    fecha.getUTCSeconds() === 0 &&
    fecha.getUTCMilliseconds() === 0
  );
}

/**
 * Fecha civil de una partida. El Proyecto 3 guarda las fechas sin hora a
 * medianoche UTC; esas se leen como la fecha elegida (2026-11-02 sigue
 * siendo 2 de noviembre). Un instante con hora real se convierte a la
 * fecha de Ecuador, así una sesión que cruza la medianoche pertenece al
 * día en que empezó.
 */
export function diaDePartida(fecha: Date): string {
  if (esMedianocheUTC(fecha)) {
    const anio = fecha.getUTCFullYear();
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getUTCDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
  }

  return diaEnGuayaquil(fecha);
}

function partesDia(dia: string): { anio: number; mes: number; dia: number } {
  const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dia);
  if (!coincidencia) {
    throw new Error(`La fecha "${dia}" no tiene el formato YYYY-MM-DD`);
  }

  return {
    anio: Number(coincidencia[1]),
    mes: Number(coincidencia[2]),
    dia: Number(coincidencia[3]),
  };
}

export function sumarDias(dia: string, cantidad: number): string {
  const { anio, mes, dia: numeroDia } = partesDia(dia);
  const fecha = new Date(Date.UTC(anio, mes - 1, numeroDia + cantidad, 12, 0, 0));
  const nuevoAnio = fecha.getUTCFullYear();
  const nuevoMes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const nuevoDia = String(fecha.getUTCDate()).padStart(2, "0");
  return `${nuevoAnio}-${nuevoMes}-${nuevoDia}`;
}

export function diaDeLaSemana(dia: string): number {
  const { anio, mes, dia: numeroDia } = partesDia(dia);
  return new Date(Date.UTC(anio, mes - 1, numeroDia, 12, 0, 0)).getUTCDay();
}

/** La semana de una fecha civil, de lunes a domingo. */
export function rangoSemana(dia: string): RangoSemana {
  const diaSemana = diaDeLaSemana(dia); // 0 = domingo, 1 = lunes, ...
  const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const inicio = sumarDias(dia, -diasDesdeLunes);
  return { inicio, fin: sumarDias(inicio, 6) };
}

export function rangoSemanaActual(ahora: Date): RangoSemana {
  return rangoSemana(diaEnGuayaquil(ahora));
}

/**
 * Racha actual y mejor racha sobre días distintos. Hoy tiene una gracia:
 * si todavía no hay partida pero ayer sí, la racha sigue viva. Las fechas
 * futuras no cuentan.
 */
export function calcularRachas(partidas: readonly PartidaProgreso[], ahora: Date): Rachas {
  const hoy = diaEnGuayaquil(ahora);
  const dias = new Set(
    partidas
      .map((partida) => diaDePartida(partida.fecha))
      .filter((dia) => dia <= hoy)
  );

  const ordenados = [...dias].sort();
  let mejorRacha = 0;
  let corrida = 0;
  let anterior: string | null = null;

  for (const dia of ordenados) {
    corrida = anterior && sumarDias(anterior, 1) === dia ? corrida + 1 : 1;
    mejorRacha = Math.max(mejorRacha, corrida);
    anterior = dia;
  }

  const ayer = sumarDias(hoy, -1);
  let cursor: string | null = dias.has(hoy) ? hoy : dias.has(ayer) ? ayer : null;
  let rachaActual = 0;

  while (cursor && dias.has(cursor)) {
    rachaActual += 1;
    cursor = sumarDias(cursor, -1);
  }

  return { rachaActual, mejorRacha };
}

/**
 * Partida que manda el porcentaje de avance actual: fecha máxima y, si
 * empatan, createdAt más nuevo. Es la misma regla del resumen del Proyecto 3.
 */
export function partidaMasReciente<T extends { fecha: Date; createdAt?: Date }>(
  partidas: readonly T[]
): T | undefined {
  return partidas.reduce<T | undefined>((actual, candidata) => {
    if (!actual) return candidata;

    const diferenciaFecha = candidata.fecha.getTime() - actual.fecha.getTime();
    if (diferenciaFecha > 0) return candidata;
    if (diferenciaFecha < 0) return actual;

    const creadaActual = actual.createdAt?.getTime() ?? 0;
    const creadaCandidata = candidata.createdAt?.getTime() ?? 0;
    return creadaCandidata > creadaActual ? candidata : actual;
  }, undefined);
}

export function calcularPorcentajeAvanceActual(partidas: readonly PartidaProgreso[]): number {
  return partidaMasReciente(partidas)?.porcentajeAvance ?? 0;
}

function redondearHoras(minutos: number): number {
  return Math.round((minutos / 60) * 10) / 10;
}

function calcularHitos(meta: MetaProgreso | null, porcentajeAvanceActual: number): HitoProgreso[] {
  if (!meta) return [];

  return meta.hitos.map((hito) => ({
    descripcion: hito.descripcion,
    porcentajeObjetivo: hito.porcentajeObjetivo,
    alcanzado: porcentajeAvanceActual >= hito.porcentajeObjetivo,
  }));
}

export function calcularProgresoSemanal(
  partidas: readonly PartidaProgreso[],
  meta: MetaProgreso | null,
  ahora: Date = new Date()
): ProgresoSemanalCalculado {
  const hoy = diaEnGuayaquil(ahora);
  const semana = rangoSemana(hoy);

  const partidasDeLaSemana = partidas.filter((partida) => {
    const dia = diaDePartida(partida.fecha);
    return dia >= semana.inicio && dia <= semana.fin && dia <= hoy;
  });

  const minutosSemana = partidasDeLaSemana.reduce((total, partida) => total + partida.duracionMinutos, 0);
  const horasSemana = redondearHoras(minutosSemana);
  const diasJugadosSemana = new Set(partidasDeLaSemana.map((partida) => diaDePartida(partida.fecha))).size;
  const rachas = calcularRachas(partidas, ahora);
  const porcentajeAvanceActual = calcularPorcentajeAvanceActual(partidas);
  const porcentajeHoras =
    meta && meta.horasSemanales > 0
      ? Math.min(100, Math.max(0, Math.round((horasSemana / meta.horasSemanales) * 100)))
      : meta
        ? 0
        : null;

  return {
    semana,
    meta: meta ? { horasSemanales: meta.horasSemanales, diasPorSemana: meta.diasPorSemana } : null,
    horasSemana,
    porcentajeHoras,
    diasJugadosSemana,
    rachaActual: rachas.rachaActual,
    mejorRacha: rachas.mejorRacha,
    hitos: calcularHitos(meta, porcentajeAvanceActual),
  };
}

/**
 * services/progreso.service.ts
 * ----------------------------
 * Solo consulta el videojuego, su meta activa y sus partidas. Todo el
 * cálculo (semana, horas, días, rachas e hitos) vive en dominio/progreso.ts.
 */

import { Partida } from "../modelos/Partida.model";
import { buscarMetaActiva } from "./metas.service";
import { buscarVideojuegoPorId } from "./videojuegos.service";
import {
  calcularProgresoSemanal,
  type MetaProgreso,
  type PartidaProgreso,
  type ProgresoSemanalCalculado,
} from "../dominio/progreso";

export async function obtenerProgresoSemanal(
  videojuegoId: string,
  ahora: Date = new Date()
): Promise<ProgresoSemanalCalculado> {
  // Valida formato (400) y existencia (404) del videojuego.
  await buscarVideojuegoPorId(videojuegoId);

  const [meta, partidas] = await Promise.all([
    buscarMetaActiva(videojuegoId),
    Partida.find({ videojuego: videojuegoId }).select(
      "fecha duracionMinutos porcentajeAvance createdAt"
    ),
  ]);

  const partidasProgreso: PartidaProgreso[] = partidas.map((partida) => ({
    fecha: partida.fecha,
    duracionMinutos: partida.duracionMinutos,
    porcentajeAvance: partida.porcentajeAvance,
    createdAt: partida.createdAt,
  }));

  const metaProgreso: MetaProgreso | null = meta
    ? {
        horasSemanales: meta.horasSemanales,
        diasPorSemana: meta.diasPorSemana,
        hitos: meta.hitos.map((hito) => ({
          descripcion: hito.descripcion,
          porcentajeObjetivo: hito.porcentajeObjetivo,
        })),
      }
    : null;

  return calcularProgresoSemanal(partidasProgreso, metaProgreso, ahora);
}

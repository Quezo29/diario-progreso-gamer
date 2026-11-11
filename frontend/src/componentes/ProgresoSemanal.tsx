/**
 * componentes/ProgresoSemanal.tsx
 * -------------------------------
 * Sección del detalle con la semana actual, la meta activa, la racha y
 * los hitos. Consulta su propio progreso para que un error de esta
 * sección no oculte la ficha ni las partidas.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { desactivarMeta, listarMetasDeVideojuego, obtenerProgresoSemanal } from "../api/metasApi";
import { formatearHoras, formatearRangoSemana } from "../formato";
import { Meta, ProgresoSemanal as ProgresoSemanalTipo } from "../tipos";

interface Props {
  videojuegoId: string;
  recarga: number;
  hayPartidas: boolean;
  hayPartidaHoy: boolean;
}

function fraseRacha(progreso: ProgresoSemanalTipo, hayPartidas: boolean, hayPartidaHoy: boolean): string {
  if (progreso.rachaActual > 0) {
    return hayPartidaHoy ? "Racha viva" : "Racha viva hasta ayer";
  }
  return hayPartidas ? "Sin racha activa" : "Sin partidas";
}

export function ProgresoSemanal({ videojuegoId, recarga, hayPartidas, hayPartidaHoy }: Props) {
  const [progreso, setProgreso] = useState<ProgresoSemanalTipo | null>(null);
  const [metaActiva, setMetaActiva] = useState<Meta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);
  const [desactivando, setDesactivando] = useState(false);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    Promise.all([obtenerProgresoSemanal(videojuegoId), listarMetasDeVideojuego(videojuegoId)])
      .then(([progresoCargado, metas]) => {
        if (!vigente) return;
        setProgreso(progresoCargado);
        setMetaActiva(metas.find((meta) => meta.activa) ?? null);
      })
      .catch((err: unknown) => {
        if (vigente) setError(err instanceof Error ? err.message : "No se pudo calcular el progreso.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [videojuegoId, recarga, intento]);

  async function manejarDesactivar() {
    if (!metaActiva) return;
    const confirmado = window.confirm(
      "¿Desactivar esta meta? Dejarás de ver el porcentaje y los hitos; las horas, los días y la racha se siguen calculando."
    );
    if (!confirmado) return;

    setDesactivando(true);
    setError(null);
    try {
      await desactivarMeta(metaActiva._id);
      setMensaje("Meta desactivada. Las horas, los días y la racha se siguen calculando.");
      setIntento((valor) => valor + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar la meta.");
    } finally {
      setDesactivando(false);
    }
  }

  const porcentaje = progreso?.porcentajeHoras ?? 0;

  return (
    <section className="panel progreso" aria-labelledby="titulo-progreso">
      <h2 id="titulo-progreso">Progreso de esta semana</h2>

      {cargando && <p className="estado-pantalla">Calculando tu semana...</p>}

      {!cargando && error && (
        <div>
          <p className="aviso" role="alert">
            No se pudo cargar el progreso: {error}
          </p>
          <button type="button" onClick={() => setIntento((valor) => valor + 1)}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && progreso && (
        <>
          <p className="progreso-rango">{formatearRangoSemana(progreso.semana.inicio, progreso.semana.fin)}</p>
          {mensaje && (
            <p className="nota" role="status">
              {mensaje}
            </p>
          )}

          {progreso.meta && (
            <p className="meta-activa">
              {progreso.meta.horasSemanales} h por semana · {progreso.meta.diasPorSemana} días
            </p>
          )}

          <dl className="progreso-metricas">
            <div>
              <dt>Horas</dt>
              <dd>{formatearHoras(progreso.horasSemana)}</dd>
              {progreso.meta && <span className="dato-apoyo">de {formatearHoras(progreso.meta.horasSemanales)}</span>}
            </div>
            <div>
              <dt>Días jugados</dt>
              <dd>
                {progreso.diasJugadosSemana}
                {progreso.meta ? ` / ${progreso.meta.diasPorSemana}` : ""}
              </dd>
              <span className="dato-apoyo">días esta semana</span>
            </div>
            <div>
              <dt>Racha actual</dt>
              <dd>{progreso.rachaActual}</dd>
              <span className="dato-apoyo">
                {progreso.rachaActual === 1 ? "día seguido" : "días seguidos"}
              </span>
            </div>
            <div>
              <dt>Mejor racha</dt>
              <dd>{progreso.mejorRacha}</dd>
              <span className="dato-apoyo">{progreso.mejorRacha === 1 ? "día" : "días"}</span>
            </div>
          </dl>

          <p className="progreso-racha">{fraseRacha(progreso, hayPartidas, hayPartidaHoy)}</p>

          {progreso.diasJugadosSemana === 0 && (
            <p className="nota">Todavía no hay partidas esta semana; la racha empieza cuando juegues.</p>
          )}

          {progreso.meta ? (
            <>
              <div
                className="barra-progreso"
                role="progressbar"
                aria-label="Horas jugadas frente a la meta semanal"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={porcentaje}
                aria-valuetext={`${progreso.horasSemana} de ${progreso.meta.horasSemanales} horas`}
              >
                <span style={{ width: `${porcentaje}%` }} />
              </div>
              <p className="progreso-porcentaje">{porcentaje}% de la meta de horas</p>

              <div className="hitos-meta">
                <h3>Hitos</h3>
                {progreso.hitos.length === 0 ? (
                  <p className="nota">Esta meta no tiene hitos.</p>
                ) : (
                  <ul className="lista-hitos">
                    {progreso.hitos.map((hito, indice) => (
                      <li
                        key={`${hito.descripcion}-${hito.porcentajeObjetivo}-${indice}`}
                        className={hito.alcanzado ? "hito-alcanzado" : undefined}
                      >
                        <span>
                          {hito.descripcion} ({hito.porcentajeObjetivo}%)
                        </span>
                        <span className="estado-hito">{hito.alcanzado ? "Alcanzado" : "Pendiente"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <p className="acciones">
                <Link className="enlace-boton" to={`/videojuegos/${videojuegoId}/meta/editar`}>
                  Editar meta
                </Link>
                <button type="button" className="peligro" onClick={manejarDesactivar} disabled={desactivando}>
                  {desactivando ? "Desactivando..." : "Desactivar meta"}
                </button>
              </p>
            </>
          ) : (
            <>
              <p className="nota">Todavía no tienes una meta activa. Define una para esta semana.</p>
              <p className="acciones">
                <Link className="enlace-boton" to={`/videojuegos/${videojuegoId}/meta/nueva`}>
                  Crear meta
                </Link>
              </p>
            </>
          )}
        </>
      )}
    </section>
  );
}

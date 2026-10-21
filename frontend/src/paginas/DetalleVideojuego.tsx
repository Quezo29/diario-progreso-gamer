/**
 * paginas/DetalleVideojuego.tsx
 * -----------------------------
 * Ficha, logros embebidos, resumen calculado por el backend y partidas
 * de este juego. Marcar un logro actualiza solo ese subdocumento.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  actualizarLogro,
  eliminarVideojuego,
  obtenerResumen,
  obtenerVideojuegoPorId,
} from "../api/videojuegosApi";
import { eliminarPartida, obtenerPartidasDeVideojuego } from "../api/partidasApi";
import { formatearDuracion, formatearFecha, formatearHoras } from "../formato";
import { ETIQUETA_ESTADO, ETIQUETA_GENERO, ETIQUETA_PLATAFORMA, Partida, ResumenVideojuego, Videojuego } from "../tipos";

export function DetalleVideojuego() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [videojuego, setVideojuego] = useState<Videojuego | null>(null);
  const [resumen, setResumen] = useState<ResumenVideojuego | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [logroEnCurso, setLogroEnCurso] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let vigente = true;

    setCargando(true);
    setError(null);

    Promise.all([obtenerVideojuegoPorId(id), obtenerResumen(id), obtenerPartidasDeVideojuego(id)])
      .then(([ficha, resumenCargado, partidasCargadas]) => {
        if (!vigente) return;
        setVideojuego(ficha);
        setResumen(resumenCargado);
        setPartidas(partidasCargadas);
      })
      .catch((err: unknown) => {
        if (vigente) setError(err instanceof Error ? err.message : "No se pudo abrir el videojuego.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [id]);

  async function alternarLogro(logroId: string, obtenido: boolean) {
    if (!id) return;
    setErrorAccion(null);
    setLogroEnCurso(logroId);
    try {
      const actualizado = await actualizarLogro(id, logroId, obtenido);
      setVideojuego(actualizado);
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : "No se pudo actualizar el logro.");
    } finally {
      setLogroEnCurso(null);
    }
  }

  async function manejarEliminarJuego() {
    if (!id) return;
    if (!window.confirm("¿Eliminar este videojuego y todas sus partidas?")) return;
    setErrorAccion(null);
    try {
      await eliminarVideojuego(id);
      navigate("/");
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : "No se pudo eliminar el videojuego.");
    }
  }

  async function manejarEliminarPartida(partidaId: string) {
    if (!id) return;
    if (!window.confirm("¿Eliminar esta partida? El resumen se vuelve a calcular.")) return;
    setErrorAccion(null);
    try {
      await eliminarPartida(partidaId);
      const [partidasNuevas, resumenNuevo] = await Promise.all([
        obtenerPartidasDeVideojuego(id),
        obtenerResumen(id),
      ]);
      setPartidas(partidasNuevas);
      setResumen(resumenNuevo);
    } catch (err) {
      setErrorAccion(err instanceof Error ? err.message : "No se pudo eliminar la partida.");
    }
  }

  if (cargando) return <p className="estado-pantalla">Cargando la ficha...</p>;
  if (error) return <p className="aviso">No se pudo abrir el videojuego: {error}</p>;
  if (!videojuego || !resumen) return <p className="estado-pantalla">No se encontró el videojuego.</p>;

  const avance = Math.min(100, Math.max(0, resumen.porcentajeAvanceActual));

  return (
    <div>
      <p className="volver">
        <Link to="/">Volver a la biblioteca</Link>
      </p>

      <h1>{videojuego.nombre}</h1>
      <p>
        <span className={`marca ${videojuego.estado}`}>{ETIQUETA_ESTADO[videojuego.estado]}</span>
      </p>

      {errorAccion && <p className="aviso">{errorAccion}</p>}

      <ul className="datos">
        <li>
          <span>Plataforma</span>
          {ETIQUETA_PLATAFORMA[videojuego.plataforma]}
        </li>
        <li>
          <span>Género</span>
          {ETIQUETA_GENERO[videojuego.genero]}
        </li>
        <li>
          <span>Estado</span>
          {ETIQUETA_ESTADO[videojuego.estado]}
        </li>
      </ul>

      <p className="acciones">
        <Link className="enlace-boton" to={`/videojuegos/${videojuego._id}/editar`}>
          Editar ficha
        </Link>
        <Link className="enlace-boton" to={`/partidas/nueva?videojuegoId=${videojuego._id}`}>
          Registrar partida
        </Link>
        <button type="button" className="peligro" onClick={manejarEliminarJuego}>
          Eliminar
        </button>
      </p>

      <section className="panel" aria-labelledby="titulo-logros">
        <h2 id="titulo-logros">Logros</h2>
        {videojuego.logros.length === 0 ? (
          <p className="estado-pantalla">Este juego todavía no tiene logros en la ficha.</p>
        ) : (
          <ul className="logros">
            {videojuego.logros.map((logro) => (
              <li key={logro._id} className={logro.obtenido ? "obtenido" : undefined}>
                <span>{logro.nombre}</span>
                <button
                  type="button"
                  onClick={() => alternarLogro(logro._id, !logro.obtenido)}
                  disabled={logroEnCurso === logro._id}
                >
                  {logro.obtenido ? "Obtenido" : "Marcar obtenido"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel resumen-panel" aria-labelledby="titulo-resumen">
        <h2 id="titulo-resumen">Resumen de progreso</h2>
        <p className="nota">Sale de las partidas registradas. La última sesión marca el avance actual.</p>
        <dl className="resumen">
          <div>
            <dt>Partidas</dt>
            <dd>{resumen.totalPartidas}</dd>
          </div>
          <div>
            <dt>Horas totales</dt>
            <dd>{formatearHoras(resumen.horasTotales)}</dd>
          </div>
          <div>
            <dt>Última partida</dt>
            <dd>{resumen.ultimaPartida ? formatearFecha(resumen.ultimaPartida) : "Sin partidas"}</dd>
          </div>
          <div>
            <dt>Avance actual</dt>
            <dd>{resumen.porcentajeAvanceActual}%</dd>
          </div>
        </dl>
        <div
          className="avance"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={avance}
          aria-label="Porcentaje de avance actual"
        >
          <span style={{ width: `${avance}%` }} />
        </div>
      </section>

      <section className="panel" aria-labelledby="titulo-partidas">
        <h2 id="titulo-partidas">Partidas de este juego</h2>
        {partidas.length === 0 ? (
          <p className="estado-pantalla">
            Todavía no hay partidas. El resumen queda en cero hasta la primera sesión.
          </p>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Duración</th>
                  <th>Avance</th>
                  <th>Notas</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {partidas.map((partida) => (
                  <tr key={partida._id}>
                    <td>{formatearFecha(partida.fecha)}</td>
                    <td>{formatearDuracion(partida.duracionMinutos)}</td>
                    <td>{partida.porcentajeAvance}%</td>
                    <td>{partida.notas || "—"}</td>
                    <td>
                      <button type="button" className="peligro" onClick={() => manejarEliminarPartida(partida._id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

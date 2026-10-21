/**
 * paginas/ListaPartidas.tsx
 * -------------------------
 * Todas las partidas, con el videojuego ya populado por el backend.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eliminarPartida, obtenerPartidas } from "../api/partidasApi";
import { formatearDuracion, formatearFecha, idDePartida, nombreDePartida } from "../formato";
import { Partida } from "../tipos";

export function ListaPartidas() {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function cargar() {
    setCargando(true);
    setError(null);
    obtenerPartidas()
      .then(setPartidas)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudieron cargar las partidas."))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function manejarEliminar(id: string) {
    if (!window.confirm("¿Eliminar esta partida?")) return;
    try {
      await eliminarPartida(id);
      cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la partida.");
    }
  }

  return (
    <div>
      <h1>Partidas</h1>
      <p className="nota">Todas las sesiones, también las que no estás mirando dentro de un juego.</p>
      <p className="acciones">
        <Link className="enlace-boton" to="/partidas/nueva">
          Nueva partida
        </Link>
      </p>

      {cargando && <p className="estado-pantalla">Cargando partidas...</p>}
      {!cargando && error && <p className="aviso">No se pudieron cargar las partidas: {error}</p>}
      {!cargando && !error && partidas.length === 0 && (
        <p className="estado-pantalla">Todavía no hay partidas registradas.</p>
      )}

      {!cargando && !error && partidas.length > 0 && (
        <ul className="menu-xmb">
          {partidas.map((partida) => {
            const videojuegoId = idDePartida(partida);
            return (
              <li key={partida._id} className="fila-menu">
                {videojuegoId ? (
                  <Link to={`/videojuegos/${videojuegoId}`}>
                    <span className="titulo-item">{nombreDePartida(partida)}</span>
                    <span className="detalle-item">
                      {formatearFecha(partida.fecha)} · {formatearDuracion(partida.duracionMinutos)} ·{" "}
                      {partida.porcentajeAvance}%{partida.notas ? ` · ${partida.notas}` : ""}
                    </span>
                  </Link>
                ) : (
                  <span className="titulo-item">{nombreDePartida(partida)}</span>
                )}
                <button type="button" className="peligro" onClick={() => manejarEliminar(partida._id)}>
                  Eliminar
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

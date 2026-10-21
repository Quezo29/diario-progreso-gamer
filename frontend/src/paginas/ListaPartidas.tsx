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
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Videojuego</th>
                <th>Duración</th>
                <th>Avance</th>
                <th>Notas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {partidas.map((partida) => {
                const videojuegoId = idDePartida(partida);
                return (
                  <tr key={partida._id}>
                    <td>{formatearFecha(partida.fecha)}</td>
                    <td>
                      {videojuegoId ? (
                        <Link to={`/videojuegos/${videojuegoId}`}>{nombreDePartida(partida)}</Link>
                      ) : (
                        nombreDePartida(partida)
                      )}
                    </td>
                    <td>{formatearDuracion(partida.duracionMinutos)}</td>
                    <td>{partida.porcentajeAvance}%</td>
                    <td>{partida.notas || "—"}</td>
                    <td>
                      <button type="button" className="peligro" onClick={() => manejarEliminar(partida._id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

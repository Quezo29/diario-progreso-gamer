/**
 * paginas/ListaVideojuegos.tsx
 * ----------------------------
 * Biblioteca con filtro opcional por estado y plataforma.
 * Tres estados de pantalla: cargando, error y vacío.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { obtenerVideojuegos } from "../api/videojuegosApi";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_GENERO,
  ETIQUETA_PLATAFORMA,
  ESTADOS,
  EstadoVideojuego,
  PLATAFORMAS,
  Plataforma,
  Videojuego,
} from "../tipos";

export function ListaVideojuegos() {
  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [estado, setEstado] = useState<EstadoVideojuego | "">("");
  const [plataforma, setPlataforma] = useState<Plataforma | "">("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    obtenerVideojuegos({
      estado: estado || undefined,
      plataforma: plataforma || undefined,
    })
      .then((lista) => {
        if (vigente) setVideojuegos(lista);
      })
      .catch((err: unknown) => {
        if (vigente) setError(err instanceof Error ? err.message : "No se pudo cargar la biblioteca.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [estado, plataforma]);

  return (
    <div>
      <h1>Biblioteca</h1>
      <p className="nota">Los juegos que tienes ahora mismo, y en qué quedaron.</p>

      <div className="filtros">
        <label>
          Estado
          <select
            value={estado}
            onChange={(evento) => setEstado(evento.target.value as EstadoVideojuego | "")}
          >
            <option value="">Todos</option>
            {ESTADOS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETA_ESTADO[opcion]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Plataforma
          <select
            value={plataforma}
            onChange={(evento) => setPlataforma(evento.target.value as Plataforma | "")}
          >
            <option value="">Todas</option>
            {PLATAFORMAS.map((opcion) => (
              <option key={opcion} value={opcion}>
                {ETIQUETA_PLATAFORMA[opcion]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cargando && <p className="estado-pantalla">Cargando videojuegos...</p>}
      {!cargando && error && <p className="aviso">No se pudo cargar la biblioteca: {error}</p>}
      {!cargando && !error && videojuegos.length === 0 && !estado && !plataforma && (
        <p className="estado-pantalla">
          Todavía no hay videojuegos. <Link to="/videojuegos/nuevo">Registra el primero</Link>.
        </p>
      )}
      {!cargando && !error && videojuegos.length === 0 && (estado || plataforma) && (
        <p className="estado-pantalla">Ningún videojuego coincide con ese filtro.</p>
      )}

      {!cargando && !error && videojuegos.length > 0 && (
        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Juego</th>
                <th>Plataforma</th>
                <th>Género</th>
                <th>Estado</th>
                <th>Logros</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {videojuegos.map((videojuego) => {
                const obtenidos = videojuego.logros.filter((logro) => logro.obtenido).length;
                return (
                  <tr key={videojuego._id}>
                    <td>{videojuego.nombre}</td>
                    <td>{ETIQUETA_PLATAFORMA[videojuego.plataforma]}</td>
                    <td>{ETIQUETA_GENERO[videojuego.genero]}</td>
                    <td>
                      <span className={`marca ${videojuego.estado}`}>{ETIQUETA_ESTADO[videojuego.estado]}</span>
                    </td>
                    <td>
                      {videojuego.logros.length === 0 ? "—" : `${obtenidos}/${videojuego.logros.length}`}
                    </td>
                    <td>
                      <Link to={`/videojuegos/${videojuego._id}`}>Abrir</Link>
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

/**
 * paginas/FormularioPartida.tsx
 * -----------------------------
 * Anota una sesión. Si se llega desde la ficha (?videojuegoId=...),
 * ese juego queda elegido. Al guardar, el detalle muestra el resumen nuevo.
 */

import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { crearPartida } from "../api/partidasApi";
import { obtenerVideojuegos } from "../api/videojuegosApi";
import { hoyISO } from "../formato";
import { PartidaFormulario, Videojuego } from "../tipos";

export function FormularioPartida() {
  const [parametros] = useSearchParams();
  const navigate = useNavigate();

  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [form, setForm] = useState<PartidaFormulario>({
    videojuego: parametros.get("videojuegoId") ?? "",
    fecha: hoyISO(),
    duracionMinutos: 60,
    porcentajeAvance: 0,
    notas: "",
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    obtenerVideojuegos()
      .then((lista) => {
        setVideojuegos(lista);
        setForm((actual) => {
          if (actual.videojuego || lista.length === 0) return actual;
          return { ...actual, videojuego: lista[0]._id };
        });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudieron cargar los videojuegos."))
      .finally(() => setCargando(false));
  }, []);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!form.videojuego || !form.fecha) {
      setError("El videojuego y la fecha son obligatorios.");
      return;
    }
    if (form.duracionMinutos < 1) {
      setError("La duración mínima es 1 minuto.");
      return;
    }
    if (form.porcentajeAvance < 0 || form.porcentajeAvance > 100) {
      setError("El avance tiene que estar entre 0 y 100.");
      return;
    }

    try {
      setGuardando(true);
      await crearPartida(form);
      navigate(`/videojuegos/${form.videojuego}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar la partida.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="estado-pantalla">Cargando el formulario...</p>;
  if (error && videojuegos.length === 0) {
    return <p className="aviso">No se pudo preparar el formulario: {error}</p>;
  }
  if (videojuegos.length === 0) {
    return (
      <div>
        <h1>Nueva partida</h1>
        <p className="estado-pantalla">
          Todavía no hay videojuegos. <Link to="/videojuegos/nuevo">Crea uno</Link> antes de anotar una sesión.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="volver">
        <Link to="/partidas">Volver a partidas</Link>
      </p>
      <h1>Nueva partida</h1>
      {error && <p className="aviso">{error}</p>}

      <form onSubmit={manejarEnvio}>
        <label htmlFor="videojuego">Videojuego</label>
        <select
          id="videojuego"
          value={form.videojuego}
          onChange={(evento) => setForm({ ...form, videojuego: evento.target.value })}
        >
          {videojuegos.map((videojuego) => (
            <option key={videojuego._id} value={videojuego._id}>
              {videojuego.nombre}
            </option>
          ))}
        </select>

        <label htmlFor="fecha">Fecha</label>
        <input
          id="fecha"
          type="date"
          value={form.fecha}
          onChange={(evento) => setForm({ ...form, fecha: evento.target.value })}
          required
        />

        <label htmlFor="duracionMinutos">Duración (minutos)</label>
        <input
          id="duracionMinutos"
          type="number"
          min={1}
          max={10080}
          value={form.duracionMinutos}
          onChange={(evento) => setForm({ ...form, duracionMinutos: Number(evento.target.value) })}
          required
        />

        <label htmlFor="porcentajeAvance">Porcentaje de avance (0 a 100)</label>
        <input
          id="porcentajeAvance"
          type="number"
          min={0}
          max={100}
          value={form.porcentajeAvance}
          onChange={(evento) => setForm({ ...form, porcentajeAvance: Number(evento.target.value) })}
          required
        />

        <label htmlFor="notas">Notas (opcional)</label>
        <textarea
          id="notas"
          rows={3}
          maxLength={500}
          value={form.notas}
          onChange={(evento) => setForm({ ...form, notas: evento.target.value })}
        />

        <button type="submit" className="primario" disabled={guardando}>
          {guardando ? "Guardando..." : "Registrar partida"}
        </button>
      </form>
    </div>
  );
}

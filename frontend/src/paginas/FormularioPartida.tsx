/**
 * paginas/FormularioPartida.tsx
 * -----------------------------
 * Anota una sesión. Si se llega desde la ficha (?videojuegoId=...),
 * ese juego queda elegido. En modo edición precarga la partida y usa la
 * fecha civil para no correrla un día en America/Guayaquil.
 */

import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { actualizarPartida, crearPartida, obtenerPartidaPorId } from "../api/partidasApi";
import { obtenerVideojuegos } from "../api/videojuegosApi";
import { fechaCivilDePartida, hoyISO } from "../formato";
import { PartidaFormulario, Videojuego } from "../tipos";

export function FormularioPartida() {
  const [parametros] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editando = Boolean(id);

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
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setErrorCarga(null);

    Promise.all([obtenerVideojuegos(), id ? obtenerPartidaPorId(id) : Promise.resolve(null)])
      .then(([lista, partida]) => {
        if (!vigente) return;
        setVideojuegos(lista);

        if (partida) {
          const videojuegoId =
            partida.videojuego && typeof partida.videojuego === "object"
              ? partida.videojuego._id
              : (partida.videojuego ?? "");
          setForm({
            videojuego: videojuegoId,
            fecha: fechaCivilDePartida(partida.fecha),
            duracionMinutos: partida.duracionMinutos,
            porcentajeAvance: partida.porcentajeAvance,
            notas: partida.notas ?? "",
          });
          return;
        }

        setForm((actual) => {
          if (actual.videojuego || lista.length === 0) return actual;
          return { ...actual, videojuego: lista[0]._id };
        });
      })
      .catch((err: unknown) =>
        setErrorCarga(err instanceof Error ? err.message : "No se pudo preparar el formulario.")
      )
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [id]);

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!form.videojuego || !form.fecha) {
      setError("El videojuego y la fecha son obligatorios.");
      return;
    }
    if (!Number.isFinite(form.duracionMinutos) || form.duracionMinutos < 1 || form.duracionMinutos > 10080) {
      setError("La duración tiene que estar entre 1 y 10080 minutos.");
      return;
    }
    if (!Number.isFinite(form.porcentajeAvance) || form.porcentajeAvance < 0 || form.porcentajeAvance > 100) {
      setError("El avance tiene que estar entre 0 y 100.");
      return;
    }

    try {
      setGuardando(true);
      if (id) {
        await actualizarPartida(id, form);
      } else {
        await crearPartida(form);
      }
      navigate(`/videojuegos/${form.videojuego}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la partida.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="estado-pantalla">Cargando el formulario...</p>;
  if (errorCarga) {
    return <p className="aviso">No se pudo preparar el formulario: {errorCarga}</p>;
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
        <Link to={form.videojuego ? `/videojuegos/${form.videojuego}` : "/partidas"}>
          {editando ? "Volver al juego" : "Volver a partidas"}
        </Link>
      </p>
      <h1>{editando ? "Editar partida" : "Nueva partida"}</h1>
      {error && (
        <p className="aviso" role="alert">
          {error}
        </p>
      )}

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
          {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Registrar partida"}
        </button>
      </form>
    </div>
  );
}

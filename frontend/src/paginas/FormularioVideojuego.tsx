/**
 * paginas/FormularioVideojuego.tsx
 * --------------------------------
 * Crea o edita la ficha, incluidos los logros embebidos.
 */

import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { actualizarVideojuego, crearVideojuego, obtenerVideojuegoPorId } from "../api/videojuegosApi";
import {
  ETIQUETA_ESTADO,
  ETIQUETA_GENERO,
  ETIQUETA_PLATAFORMA,
  ESTADOS,
  GENEROS,
  LogroFormulario,
  PLATAFORMAS,
  VideojuegoFormulario,
} from "../tipos";

const FORM_VACIO: VideojuegoFormulario = {
  nombre: "",
  plataforma: "PC",
  genero: "accion",
  estado: "jugando",
  logros: [{ nombre: "", obtenido: false }],
};

export function FormularioVideojuego() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState<VideojuegoFormulario>(FORM_VACIO);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    obtenerVideojuegoPorId(id)
      .then((videojuego) => {
        setForm({
          nombre: videojuego.nombre,
          plataforma: videojuego.plataforma,
          genero: videojuego.genero,
          estado: videojuego.estado,
          logros:
            videojuego.logros.length > 0
              ? videojuego.logros.map((logro) => ({
                  _id: logro._id,
                  nombre: logro.nombre,
                  obtenido: logro.obtenido,
                }))
              : [{ nombre: "", obtenido: false }],
        });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudo cargar el videojuego."))
      .finally(() => setCargando(false));
  }, [id]);

  function cambiarLogro(indice: number, cambios: Partial<LogroFormulario>) {
    setForm((actual) => ({
      ...actual,
      logros: actual.logros.map((logro, i) => (i === indice ? { ...logro, ...cambios } : logro)),
    }));
  }

  function agregarLogro() {
    setForm((actual) => ({ ...actual, logros: [...actual.logros, { nombre: "", obtenido: false }] }));
  }

  function quitarLogro(indice: number) {
    setForm((actual) => ({
      ...actual,
      logros: actual.logros.filter((_, i) => i !== indice),
    }));
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError(null);

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    const datos: VideojuegoFormulario = {
      ...form,
      nombre: form.nombre.trim(),
      logros: form.logros
        .filter((logro) => logro.nombre.trim().length > 0)
        .map((logro) => ({
          ...(logro._id ? { _id: logro._id } : {}),
          nombre: logro.nombre.trim(),
          obtenido: logro.obtenido,
        })),
    };

    try {
      setGuardando(true);
      const guardado =
        esEdicion && id ? await actualizarVideojuego(id, datos) : await crearVideojuego(datos);
      navigate(`/videojuegos/${guardado._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el videojuego.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="estado-pantalla">Cargando la ficha...</p>;
  if (esEdicion && error && form.nombre === "") {
    return <p className="aviso">No se pudo cargar el videojuego: {error}</p>;
  }

  return (
    <div>
      <p className="volver">
        <Link to={esEdicion && id ? `/videojuegos/${id}` : "/"}>Volver</Link>
      </p>
      <h1>{esEdicion ? "Editar videojuego" : "Nuevo videojuego"}</h1>

      {error && <p className="aviso">{error}</p>}

      <form onSubmit={manejarEnvio}>
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          type="text"
          value={form.nombre}
          onChange={(evento) => setForm({ ...form, nombre: evento.target.value })}
          required
        />

        <label htmlFor="plataforma">Plataforma</label>
        <select
          id="plataforma"
          value={form.plataforma}
          onChange={(evento) =>
            setForm({ ...form, plataforma: evento.target.value as VideojuegoFormulario["plataforma"] })
          }
        >
          {PLATAFORMAS.map((plataforma) => (
            <option key={plataforma} value={plataforma}>
              {ETIQUETA_PLATAFORMA[plataforma]}
            </option>
          ))}
        </select>

        <label htmlFor="genero">Género</label>
        <select
          id="genero"
          value={form.genero}
          onChange={(evento) => setForm({ ...form, genero: evento.target.value as VideojuegoFormulario["genero"] })}
        >
          {GENEROS.map((genero) => (
            <option key={genero} value={genero}>
              {ETIQUETA_GENERO[genero]}
            </option>
          ))}
        </select>

        <label htmlFor="estado">Estado</label>
        <select
          id="estado"
          value={form.estado}
          onChange={(evento) => setForm({ ...form, estado: evento.target.value as VideojuegoFormulario["estado"] })}
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {ETIQUETA_ESTADO[estado]}
            </option>
          ))}
        </select>

        <fieldset>
          <legend>Logros</legend>
          {form.logros.length === 0 && <p className="nota">Puedes guardar la ficha sin logros.</p>}
          {form.logros.map((logro, indice) => (
            <div className="fila-logro" key={logro._id ?? `nuevo-${indice}`}>
              <input
                aria-label={`Nombre del logro ${indice + 1}`}
                type="text"
                value={logro.nombre}
                onChange={(evento) => cambiarLogro(indice, { nombre: evento.target.value })}
                placeholder="Nombre del logro"
              />
              <label className="check">
                <input
                  type="checkbox"
                  checked={logro.obtenido}
                  onChange={(evento) => cambiarLogro(indice, { obtenido: evento.target.checked })}
                />
                Obtenido
              </label>
              <button type="button" onClick={() => quitarLogro(indice)}>
                Quitar
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarLogro}>
            Agregar logro
          </button>
        </fieldset>

        <button type="submit" className="primario" disabled={guardando}>
          {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear videojuego"}
        </button>
      </form>
    </div>
  );
}

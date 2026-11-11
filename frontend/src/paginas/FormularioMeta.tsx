/**
 * paginas/FormularioMeta.tsx
 * --------------------------
 * Crea o edita la meta semanal de un videojuego, con hasta cinco hitos.
 * En edición precarga la meta activa y permite desactivarla con
 * confirmación. El backend sigue siendo la autoridad de validación.
 */

import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { actualizarMeta, crearMeta, desactivarMeta, listarMetasDeVideojuego } from "../api/metasApi";
import { HitoMeta, Meta, MetaFormulario } from "../tipos";

const FORM_INICIAL: MetaFormulario = {
  horasSemanales: 5,
  diasPorSemana: 4,
  hitos: [],
};

export function FormularioMeta() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const editando = pathname.endsWith("/editar");

  const [form, setForm] = useState<MetaFormulario>(FORM_INICIAL);
  const [metaActiva, setMetaActiva] = useState<Meta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No se indicó el videojuego de la meta.");
      setCargando(false);
      return;
    }

    let vigente = true;
    setCargando(true);
    setError(null);

    listarMetasDeVideojuego(id)
      .then((metas) => {
        if (!vigente) return;
        const activa = metas.find((meta) => meta.activa) ?? null;
        setMetaActiva(activa);

        if (editando) {
          if (!activa) {
            setError("No hay una meta activa para editar. Puedes crear una nueva.");
            return;
          }
          setForm({
            horasSemanales: activa.horasSemanales,
            diasPorSemana: activa.diasPorSemana,
            hitos: activa.hitos.map((hito) => ({ ...hito })),
          });
        }
      })
      .catch((err: unknown) => {
        if (vigente) setError(err instanceof Error ? err.message : "No se pudieron cargar las metas.");
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [id, editando]);

  function actualizarHito(indice: number, cambios: Partial<HitoMeta>) {
    setForm((actual) => ({
      ...actual,
      hitos: actual.hitos.map((hito, posicion) => (posicion === indice ? { ...hito, ...cambios } : hito)),
    }));
  }

  function agregarHito() {
    setForm((actual) => {
      if (actual.hitos.length >= 5) return actual;
      return { ...actual, hitos: [...actual.hitos, { descripcion: "", porcentajeObjetivo: 50 }] };
    });
  }

  function quitarHito(indice: number) {
    setForm((actual) => ({
      ...actual,
      hitos: actual.hitos.filter((_hito, posicion) => posicion !== indice),
    }));
  }

  function validar(): string | null {
    if (!Number.isFinite(form.horasSemanales) || form.horasSemanales <= 0 || form.horasSemanales > 100) {
      return "Las horas semanales tienen que ser mayores que 0 y como máximo 100.";
    }
    if (!Number.isInteger(form.diasPorSemana) || form.diasPorSemana < 1 || form.diasPorSemana > 7) {
      return "Los días por semana tienen que ser un número entero entre 1 y 7.";
    }
    if (form.hitos.length > 5) {
      return "Una meta puede tener como máximo 5 hitos.";
    }
    for (const hito of form.hitos) {
      if (!hito.descripcion.trim()) {
        return "Cada hito necesita una descripción.";
      }
      if (
        !Number.isFinite(hito.porcentajeObjetivo) ||
        hito.porcentajeObjetivo < 1 ||
        hito.porcentajeObjetivo > 100
      ) {
        return "El objetivo de cada hito tiene que estar entre 1 y 100.";
      }
    }
    return null;
  }

  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!id) return;

    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }

    const datos: MetaFormulario = {
      horasSemanales: Number(form.horasSemanales),
      diasPorSemana: Number(form.diasPorSemana),
      hitos: form.hitos.map((hito) => ({
        descripcion: hito.descripcion.trim(),
        porcentajeObjetivo: Number(hito.porcentajeObjetivo),
      })),
    };

    setError(null);
    setGuardando(true);
    try {
      if (editando) {
        if (!metaActiva) {
          setError("No hay una meta activa para editar.");
          return;
        }
        await actualizarMeta(metaActiva._id, datos);
      } else {
        await crearMeta(id, datos);
      }
      navigate(`/videojuegos/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la meta.");
    } finally {
      setGuardando(false);
    }
  }

  async function manejarDesactivar() {
    if (!metaActiva || !id) return;
    const confirmado = window.confirm(
      "¿Desactivar esta meta? Dejarás de ver el porcentaje y los hitos; las horas, los días y la racha se siguen calculando."
    );
    if (!confirmado) return;

    setError(null);
    setDesactivando(true);
    try {
      await desactivarMeta(metaActiva._id);
      navigate(`/videojuegos/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar la meta.");
    } finally {
      setDesactivando(false);
    }
  }

  if (cargando) return <p className="estado-pantalla">Cargando la meta...</p>;
  if (!id) return <p className="aviso">No se indicó el videojuego de la meta.</p>;

  const sinMetaParaEditar = editando && !metaActiva;

  return (
    <div>
      <p className="volver">
        <Link to={`/videojuegos/${id}`}>Volver al juego</Link>
      </p>
      <h1>{editando ? "Editar meta" : "Nueva meta"}</h1>
      <p className="nota">
        Una meta semanal define cuánto quieres jugar y qué hitos de avance quieres alcanzar.
      </p>

      {error && (
        <p className="aviso" role="alert">
          {error}
        </p>
      )}

      {sinMetaParaEditar ? (
        <p className="acciones">
          <Link className="enlace-boton" to={`/videojuegos/${id}/meta/nueva`}>
            Crear meta
          </Link>
        </p>
      ) : (
        <>
          <form onSubmit={manejarEnvio} noValidate>
            <label htmlFor="horasSemanales">
              Horas por semana
              <input
                id="horasSemanales"
                type="number"
                step={0.5}
                min={0.5}
                max={100}
                value={form.horasSemanales}
                onChange={(evento) => setForm({ ...form, horasSemanales: Number(evento.target.value) })}
                required
              />
            </label>

            <label htmlFor="diasPorSemana">
              Días por semana
              <input
                id="diasPorSemana"
                type="number"
                step={1}
                min={1}
                max={7}
                value={form.diasPorSemana}
                onChange={(evento) => setForm({ ...form, diasPorSemana: Number(evento.target.value) })}
                required
              />
            </label>

            <fieldset className="hitos-editor">
              <legend>Hitos (opcional, máximo 5)</legend>
              <p className="nota">Cada hito se alcanza cuando el avance actual llega a su porcentaje.</p>

              {form.hitos.map((hito, indice) => (
                <div className="fila-hito-meta" key={indice}>
                  <label className="campo-hito">
                    <span>Hito {indice + 1}</span>
                    <input
                      type="text"
                      value={hito.descripcion}
                      maxLength={120}
                      placeholder="Descripción"
                      onChange={(evento) => actualizarHito(indice, { descripcion: evento.target.value })}
                    />
                  </label>
                  <label className="campo-hito">
                    <span>Objetivo (%)</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      step={1}
                      value={hito.porcentajeObjetivo}
                      onChange={(evento) =>
                        actualizarHito(indice, { porcentajeObjetivo: Number(evento.target.value) })
                      }
                    />
                  </label>
                  <button type="button" className="peligro" onClick={() => quitarHito(indice)}>
                    Quitar
                  </button>
                </div>
              ))}

              <button type="button" onClick={agregarHito} disabled={form.hitos.length >= 5}>
                Agregar hito
              </button>
            </fieldset>

            <button type="submit" className="primario" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar meta"}
            </button>
          </form>

          {editando && metaActiva && (
            <p className="acciones acciones-secundarias">
              <button type="button" className="peligro" onClick={manejarDesactivar} disabled={desactivando}>
                {desactivando ? "Desactivando..." : "Desactivar meta"}
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}

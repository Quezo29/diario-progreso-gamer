import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const TONOS = [272, 222, 198, 152, 38, 338];
const CINCO_MINUTOS = 5 * 60 * 1000;

function columnaActiva(pathname: string): number {
  if (pathname.startsWith("/partidas")) return 1;
  if (pathname === "/videojuegos/nuevo" || pathname.endsWith("/editar")) return 2;
  return 0;
}

function Reloj() {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setAhora(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const texto = ahora.toLocaleString("es", {
    weekday: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <p className="reloj">
      <IconoUsuario />
      <span>{texto}</span>
    </p>
  );
}

export function Marco() {
  const { pathname } = useLocation();
  const columna = columnaActiva(pathname);
  const [tono, setTono] = useState(TONOS[0]);

  useEffect(() => {
    let indice = 0;
    const id = window.setInterval(() => {
      indice = (indice + 1) % TONOS.length;
      setTono(TONOS[indice]);
    }, CINCO_MINUTOS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="xmb"
      style={{ ["--col" as string]: columna, ["--tono" as string]: tono }}
    >
      <div className="cielo" aria-hidden="true" />
      <Onda />
      <Reloj />

      <header className="columnas">
        <nav>
          <NavLink to="/" end>
            <IconoMando />
            <span>Biblioteca</span>
          </NavLink>
          <NavLink to="/partidas">
            <IconoReloj />
            <span>Partidas</span>
          </NavLink>
          <NavLink to="/videojuegos/nuevo">
            <IconoMas />
            <span>Nuevo juego</span>
          </NavLink>
        </nav>
      </header>

      <main className="columna">
        <Outlet />
      </main>
    </div>
  );
}

function Onda() {
  return (
    <svg className="onda" viewBox="0 0 1600 220" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="onda-brillo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="7%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="26%" stopColor="#ffe8ff" stopOpacity="0.8" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="onda-blur" x="-10%" y="-90%" width="120%" height="280%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path
        d="M-40,128 C160,132 250,46 530,78 C820,112 1040,158 1660,92"
        stroke="url(#onda-brillo)"
        strokeWidth="18"
        fill="none"
        filter="url(#onda-blur)"
      />
      <path
        d="M-40,128 C160,132 250,46 530,78 C820,112 1040,158 1660,92"
        stroke="#ffffff"
        strokeWidth="1.5"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

function IconoMando() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M8 14h4l2 3h4l2-3h4c2 0 4 2 4 5 0 4-2 8-6 8-2 0-3-1-4-3h-4c-1 2-2 3-4 3-4 0-6-4-6-8 0-3 2-5 4-5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M11 16v4M9 18h4M21 17h3M21 20h3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconoReloj() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 12v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconoMas() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 12v8M12 16h8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconoUsuario() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 18c1.2-2.4 3.2-3.5 6-3.5s4.8 1.1 6 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

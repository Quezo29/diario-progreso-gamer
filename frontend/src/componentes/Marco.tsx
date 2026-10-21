import { NavLink, Outlet } from "react-router-dom";

export function Marco() {
  return (
    <div className="diario">
      <header className="portada">
        <p className="coleccion">Bitácora personal</p>
        <p className="nombre">Diario de progreso</p>
        <p className="pregunta">Qué estoy jugando, cuánto le he dedicado y qué tan avanzado voy.</p>
      </header>

      <nav className="navegacion">
        <NavLink to="/" end>
          Biblioteca
        </NavLink>
        <NavLink to="/partidas">Partidas</NavLink>
        <NavLink to="/videojuegos/nuevo">Nuevo juego</NavLink>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Marco } from "./componentes/Marco";
import { ListaVideojuegos } from "./paginas/ListaVideojuegos";
import { DetalleVideojuego } from "./paginas/DetalleVideojuego";
import { FormularioVideojuego } from "./paginas/FormularioVideojuego";
import { ListaPartidas } from "./paginas/ListaPartidas";
import { FormularioPartida } from "./paginas/FormularioPartida";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Marco />}>
          <Route path="/" element={<ListaVideojuegos />} />
          <Route path="/videojuegos/nuevo" element={<FormularioVideojuego />} />
          <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
          <Route path="/videojuegos/:id/editar" element={<FormularioVideojuego />} />
          <Route path="/partidas" element={<ListaPartidas />} />
          <Route path="/partidas/nueva" element={<FormularioPartida />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

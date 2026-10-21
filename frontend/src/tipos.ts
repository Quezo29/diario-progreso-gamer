/**
 * tipos.ts
 * --------
 * La misma forma que devuelve la API. Los logros viajan dentro del
 * videojuego; la partida, cuando viene de la lista general, trae el
 * videojuego ya populado.
 */

export const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export const GENEROS = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export const ESTADOS = ["jugando", "pausado", "completado", "abandonado"] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type EstadoVideojuego = (typeof ESTADOS)[number];

export const ETIQUETA_PLATAFORMA: Record<Plataforma, string> = {
  PC: "PC",
  PlayStation: "PlayStation",
  Xbox: "Xbox",
  Switch: "Switch",
  Movil: "Móvil",
};

export const ETIQUETA_GENERO: Record<Genero, string> = {
  accion: "Acción",
  rol: "Rol",
  estrategia: "Estrategia",
  puzzle: "Puzzle",
  deportes: "Deportes",
  otro: "Otro",
};

export const ETIQUETA_ESTADO: Record<EstadoVideojuego, string> = {
  jugando: "Jugando",
  pausado: "Pausado",
  completado: "Completado",
  abandonado: "Abandonado",
};

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

export interface LogroFormulario {
  _id?: string;
  nombre: string;
  obtenido: boolean;
}

export interface VideojuegoFormulario {
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: EstadoVideojuego;
  logros: LogroFormulario[];
}

export interface ResumenVideojuego {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

export interface Partida {
  _id: string;
  videojuego: Videojuego | string | null;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartidaFormulario {
  videojuego: string;
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

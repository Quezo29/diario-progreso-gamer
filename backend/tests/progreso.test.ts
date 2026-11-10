import { describe, expect, it } from "vitest";
import {
  calcularProgresoSemanal,
  calcularRachas,
  diaDePartida,
  diaEnGuayaquil,
  partidaMasReciente,
  rangoSemanaActual,
  type MetaProgreso,
  type PartidaProgreso,
} from "../src/dominio/progreso";

const AHORA = new Date("2026-11-10T15:00:00.000Z"); // martes 10 de noviembre, 10:00 en Guayaquil

function partida(
  fecha: string,
  duracionMinutos: number,
  porcentajeAvance = 0,
  createdAt?: string
): PartidaProgreso {
  return {
    fecha: new Date(fecha),
    duracionMinutos,
    porcentajeAvance,
    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
  };
}

function meta(cambios: Partial<MetaProgreso> = {}): MetaProgreso {
  return {
    horasSemanales: 5,
    diasPorSemana: 4,
    hitos: [
      { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
      { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 },
      { descripcion: "Terminar el juego", porcentajeObjetivo: 100 },
    ],
    ...cambios,
  };
}

describe("semana en America/Guayaquil", () => {
  it("BC-07: la semana va de lunes a domingo", () => {
    expect(rangoSemanaActual(AHORA)).toEqual({ inicio: "2026-11-09", fin: "2026-11-15" });
  });

  it("BC-07: un domingo 23:30 de Guayaquil sigue siendo la semana anterior", () => {
    const domingoNoche = new Date("2026-11-08T23:30:00-05:00");
    expect(rangoSemanaActual(domingoNoche)).toEqual({ inicio: "2026-11-02", fin: "2026-11-08" });
  });

  it("BC-07: un lunes 00:30 de Guayaquil empieza la semana nueva", () => {
    const lunesMadrugada = new Date("2026-11-09T00:30:00-05:00");
    expect(rangoSemanaActual(lunesMadrugada)).toEqual({ inicio: "2026-11-09", fin: "2026-11-15" });
  });

  it("BC-17: convierte un instante a la fecha civil de Ecuador", () => {
    expect(diaEnGuayaquil(new Date("2026-11-03T02:00:00.000Z"))).toBe("2026-11-02");
    expect(diaEnGuayaquil(new Date("2026-11-10T15:00:00.000Z"))).toBe("2026-11-10");
  });

  it("BC-17: una fecha a medianoche UTC se interpreta como fecha civil del Proyecto 3", () => {
    expect(diaDePartida(new Date("2026-11-02T00:00:00.000Z"))).toBe("2026-11-02");
  });

  it("BC-17: una partida que cruza medianoche pertenece al día en que empezó", () => {
    expect(diaDePartida(new Date("2026-11-02T23:30:00-05:00"))).toBe("2026-11-02");
    expect(diaDePartida(new Date("2026-11-03T00:30:00-05:00"))).toBe("2026-11-03");
  });
});

describe("horas y días jugados", () => {
  it("BC-08: suma minutos de la semana y redondea las horas a un decimal", () => {
    const partidas = [partida("2026-11-09T00:00:00.000Z", 120), partida("2026-11-10T00:00:00.000Z", 90)];

    const progreso = calcularProgresoSemanal(partidas, meta(), AHORA);

    expect(progreso.horasSemana).toBe(3.5);
    expect(progreso.porcentajeHoras).toBe(70);
    expect(progreso.diasJugadosSemana).toBe(2);
  });

  it("BC-08: no suma partidas de la semana anterior", () => {
    const partidas = [
      partida("2026-11-08T00:00:00.000Z", 600),
      partida("2026-11-09T00:00:00.000Z", 60),
    ];

    const progreso = calcularProgresoSemanal(partidas, meta(), AHORA);

    expect(progreso.horasSemana).toBe(1);
    expect(progreso.diasJugadosSemana).toBe(1);
  });

  it("BC-10: dos partidas el mismo día cuentan como un día", () => {
    const partidas = [
      partida("2026-11-09T00:00:00.000Z", 60),
      partida("2026-11-09T00:00:00.000Z", 30),
      partida("2026-11-10T00:00:00.000Z", 30),
    ];

    const progreso = calcularProgresoSemanal(partidas, meta(), AHORA);

    expect(progreso.diasJugadosSemana).toBe(2);
    expect(progreso.horasSemana).toBe(2);
  });

  it("BC-09: el porcentaje se limita a 100 y conserva las horas reales", () => {
    const partidas = [partida("2026-11-09T00:00:00.000Z", 420)];

    const progreso = calcularProgresoSemanal(partidas, meta({ horasSemanales: 5 }), AHORA);

    expect(progreso.horasSemana).toBe(7);
    expect(progreso.porcentajeHoras).toBe(100);
  });

  it("BC-09: el porcentaje se redondea a entero", () => {
    const partidas = [partida("2026-11-09T00:00:00.000Z", 200)]; // 3.333...

    const progreso = calcularProgresoSemanal(partidas, meta({ horasSemanales: 5 }), AHORA);

    expect(progreso.horasSemana).toBe(3.3);
    expect(progreso.porcentajeHoras).toBe(67);
  });

  it("S-02: una partida futura de la misma semana no cuenta como día jugado", () => {
    const partidas = [
      partida("2026-11-10T00:00:00.000Z", 60),
      partida("2026-11-15T00:00:00.000Z", 120),
    ];

    const progreso = calcularProgresoSemanal(partidas, meta(), AHORA);

    expect(progreso.horasSemana).toBe(1);
    expect(progreso.diasJugadosSemana).toBe(1);
  });
});

describe("rachas", () => {
  it("BC-11: si hoy no hay partida pero ayer sí, la racha sigue viva", () => {
    const partidas = [partida("2026-11-08T00:00:00.000Z", 60), partida("2026-11-09T00:00:00.000Z", 60)];

    const { rachaActual, mejorRacha } = calcularRachas(partidas, AHORA);

    expect(rachaActual).toBe(2);
    expect(mejorRacha).toBe(2);
  });

  it("BC-12: si hoy y ayer no hay partida, la racha actual es 0", () => {
    const partidas = [partida("2026-11-08T00:00:00.000Z", 60)];

    const { rachaActual, mejorRacha } = calcularRachas(partidas, AHORA);

    expect(rachaActual).toBe(0);
    expect(mejorRacha).toBe(1);
  });

  it("BC-13: la mejor racha se calcula sobre todo el historial", () => {
    const partidas = [
      // racha histórica de 9 días: 1 al 9 de septiembre
      ...Array.from({ length: 9 }, (_, i) => partida(`2026-09-0${i + 1}T00:00:00.000Z`, 30)),
      // racha actual de 4 días: 7 al 10 de noviembre
      partida("2026-11-07T00:00:00.000Z", 30),
      partida("2026-11-08T00:00:00.000Z", 30),
      partida("2026-11-09T00:00:00.000Z", 30),
      partida("2026-11-10T00:00:00.000Z", 30),
    ];

    const { rachaActual, mejorRacha } = calcularRachas(partidas, AHORA);

    expect(rachaActual).toBe(4);
    expect(mejorRacha).toBe(9);
  });

  it("BC-13: la racha no se reinicia al cruzar de domingo a lunes", () => {
    const lunes = new Date("2026-11-09T15:00:00.000Z");
    const partidas = [
      partida("2026-11-06T00:00:00.000Z", 30),
      partida("2026-11-07T00:00:00.000Z", 30),
      partida("2026-11-08T00:00:00.000Z", 30),
      partida("2026-11-09T00:00:00.000Z", 30),
    ];

    expect(calcularRachas(partidas, lunes)).toEqual({ rachaActual: 4, mejorRacha: 4 });
  });

  it("BC-13: dos partidas el mismo día no alargan la racha", () => {
    const partidas = [
      partida("2026-11-09T00:00:00.000Z", 30),
      partida("2026-11-09T00:00:00.000Z", 30),
      partida("2026-11-10T00:00:00.000Z", 30),
    ];

    expect(calcularRachas(partidas, AHORA)).toEqual({ rachaActual: 2, mejorRacha: 2 });
  });

  it("BC-13 / S-02: las fechas futuras no inflan la racha", () => {
    const partidas = [
      partida("2026-11-09T00:00:00.000Z", 30),
      partida("2026-11-10T00:00:00.000Z", 30),
      partida("2026-11-11T00:00:00.000Z", 30),
      partida("2026-11-12T00:00:00.000Z", 30),
    ];

    expect(calcularRachas(partidas, AHORA)).toEqual({ rachaActual: 2, mejorRacha: 2 });
  });
});

describe("hitos", () => {
  it("BC-14: un hito está alcanzado cuando el avance actual llega al objetivo", () => {
    const partidas = [partida("2026-11-09T00:00:00.000Z", 120, 60)];

    const progreso = calcularProgresoSemanal(partidas, meta(), AHORA);

    expect(progreso.hitos).toEqual([
      { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25, alcanzado: true },
      { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50, alcanzado: true },
      { descripcion: "Terminar el juego", porcentajeObjetivo: 100, alcanzado: false },
    ]);
  });

  it("BC-14: si el avance baja, el hito vuelve a estar pendiente", () => {
    const partidas = [partida("2026-11-09T00:00:00.000Z", 120, 40)];

    const progreso = calcularProgresoSemanal(partidas, meta(), AHORA);

    expect(progreso.hitos[0].alcanzado).toBe(true);
    expect(progreso.hitos[1].alcanzado).toBe(false);
  });

  it("BC-14: el porcentaje actual sale de la partida más reciente por fecha", () => {
    const partidas = [
      partida("2026-10-01T00:00:00.000Z", 60, 80),
      partida("2026-11-01T00:00:00.000Z", 60, 50),
    ];

    const progreso = calcularProgresoSemanal(partidas, meta(), AHORA);

    expect(progreso.hitos[1].alcanzado).toBe(true);
    expect(progreso.hitos[2].alcanzado).toBe(false);
  });

  it("BC-19: sin partidas, las horas y rachas son 0 y ningún hito está alcanzado", () => {
    const progreso = calcularProgresoSemanal([], meta(), AHORA);

    expect(progreso.horasSemana).toBe(0);
    expect(progreso.porcentajeHoras).toBe(0);
    expect(progreso.diasJugadosSemana).toBe(0);
    expect(progreso.rachaActual).toBe(0);
    expect(progreso.mejorRacha).toBe(0);
    expect(progreso.hitos.every((hito) => hito.alcanzado === false)).toBe(true);
  });
});

describe("sin meta activa", () => {
  it("BC-15 / B-20: devuelve meta y porcentaje null, pero calcula horas, días y rachas", () => {
    const partidas = [
      partida("2026-11-09T00:00:00.000Z", 120, 60),
      partida("2026-11-10T00:00:00.000Z", 90, 70),
    ];

    const progreso = calcularProgresoSemanal(partidas, null, AHORA);

    expect(progreso.meta).toBeNull();
    expect(progreso.porcentajeHoras).toBeNull();
    expect(progreso.horasSemana).toBe(3.5);
    expect(progreso.diasJugadosSemana).toBe(2);
    expect(progreso.rachaActual).toBe(2);
    expect(progreso.hitos).toEqual([]);
  });
});

describe("meta y resumen", () => {
  it("S-05: la semana completa se mide con la meta actual, sin prorratear", () => {
    const partidas = [partida("2026-11-09T00:00:00.000Z", 300)]; // 5 horas

    expect(calcularProgresoSemanal(partidas, meta({ horasSemanales: 3 }), AHORA).porcentajeHoras).toBe(100);
    expect(calcularProgresoSemanal(partidas, meta({ horasSemanales: 10 }), AHORA).porcentajeHoras).toBe(50);
  });

  it("BC-21: el desempate de la partida más reciente usa createdAt", () => {
    const anterior = partida("2026-11-10T00:00:00.000Z", 60, 30, "2026-11-10T10:00:00.000Z");
    const nueva = partida("2026-11-10T00:00:00.000Z", 60, 80, "2026-11-10T11:00:00.000Z");

    expect(partidaMasReciente([anterior, nueva])).toBe(nueva);
    expect(calcularProgresoSemanal([anterior, nueva], meta(), AHORA).hitos[1].alcanzado).toBe(true);
  });

  it("BC-19: sin partidas y sin meta no hay hitos", () => {
    const progreso = calcularProgresoSemanal([], null, AHORA);

    expect(progreso).toMatchObject({
      horasSemana: 0,
      porcentajeHoras: null,
      diasJugadosSemana: 0,
      rachaActual: 0,
      mejorRacha: 0,
      hitos: [],
    });
  });
});

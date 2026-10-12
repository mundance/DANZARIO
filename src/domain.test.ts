import { describe, expect, it } from "vitest";
import {
  attendance,
  deletionReason,
  freeClasses,
  linkClass,
  progress,
  sumMinutes,
  validate,
} from "./domain";
import {
  emptyData,
  newCarpeta,
  newCiclo,
  newClase,
  newService,
} from "./models";
function fixture() {
  const data = emptyData();
  const service = {
    ...newService(),
    nombre: "Heels",
    tipoSeguimiento: "proceso" as const,
  };
  data.servicios.push(service);
  const ciclo = {
    ...newCiclo(service),
    nombre: "Mayo · Diana",
    alumnas: [
      {
        id: "diana",
        nombre: "Diana",
        objetivos: "",
        notas: "",
        criterios: {},
        asistencia: {},
      },
    ],
  };
  data.ciclos.push(ciclo);
  const carpeta = { ...newCarpeta(service.id), nombre: "Coreo" };
  data.carpetas.push(carpeta);
  return { data, service, ciclo, carpeta };
}
describe("planning rules", () => {
  it("calculates progress only from current choreography sections", () => {
    const c = newCarpeta();
    expect(progress(c)).toBe(0);
    c.seccionesCoreo = [
      { id: "a", nombre: "Intro", color: "#FF6B9D" },
      { id: "b", nombre: "Coro", color: "#845EC2" },
    ];
    c.avance = ["a", "removed"];
    expect(progress(c)).toBe(50);
  });
  it("uses cycle attendance only for completed classes containing the student", () => {
    const { data, ciclo } = fixture();
    expect(attendance(ciclo, [], "diana").porcentaje).toBe(0);
    const c = {
      ...newClase(),
      cicloId: ciclo.id,
      realizada: true,
      alumnas: [{ id: "diana", nombre: "Diana", presente: true }],
    };
    data.clases = [
      c,
      {
        ...c,
        id: "absent",
        alumnas: [{ id: "diana", nombre: "Diana", presente: false }],
      },
      { ...c, id: "pending", realizada: false },
      { ...c, id: "not-enrolled", alumnas: [] },
    ];
    expect(attendance(ciclo, data.clases, "diana")).toEqual({
      total: 2,
      presentes: 1,
      porcentaje: 50,
      asistencia: { [c.id]: true, absent: false },
    });
  });
  it("copies cycle templates without sharing references with saved classes", () => {
    const { data, service, ciclo } = fixture();
    service.itinerarioPlantilla.dur = 90;
    ciclo.itinerario.dur = 45;
    const c = linkClass(newClase(), data, service.id, undefined, ciclo.id);
    expect(c.itinerario.dur).toBe(45);
    expect(c.alumnas[0].id).toBe("diana");
    ciclo.itinerario.dur = 120;
    expect(c.itinerario.dur).toBe(45);
    expect(linkClass(newClase(), data, service.id).itinerario.dur).toBe(90);
  });
  it("filters free classes before taking the recent three", () => {
    const { data, service, ciclo } = fixture();
    data.clases = [1, 2, 3, 4].map((day) => ({
      ...newClase(),
      tema: `Clase ${day}`,
      fecha: `2026-05-0${day}`,
      servicioId: service.id,
      realizada: day < 3,
    }));
    data.clases.push({ ...newClase(), fecha: "2026-05-20", cicloId: ciclo.id });
    expect(freeClasses(data, "todas").map((c) => c.tema)).toEqual([
      "Clase 4",
      "Clase 3",
      "Clase 2",
      "Clase 1",
    ]);
    expect(freeClasses(data, "dadas")).toHaveLength(2);
    expect(freeClasses(data, "pendientes")).toHaveLength(2);
  });
  it("blocks dependent deletions", () => {
    const { data, service, ciclo, carpeta } = fixture();
    expect(deletionReason("servicios", service.id, data)).toBeTruthy();
    data.clases.push({
      ...newClase(),
      cicloId: ciclo.id,
      carpetaId: carpeta.id,
      servicioId: service.id,
    });
    expect(deletionReason("ciclos", ciclo.id, data)).toBeTruthy();
    expect(deletionReason("carpetas", carpeta.id, data)).toBeTruthy();
    expect(deletionReason("clases", data.clases[0].id, data)).toBeNull();
  });
  it("rejects cross-service relationships", () => {
    const { data, service, ciclo } = fixture();
    const other = { ...newService(), nombre: "Otro" };
    data.servicios.push(other);
    const c = {
      ...newClase(),
      tema: "Clase",
      servicioId: other.id,
      cicloId: ciclo.id,
    };
    expect(validate("clases", c, data)).toContain("ciclo");
    c.servicioId = service.id;
    expect(validate("clases", c, data)).toBeNull();
  });
  it("rejects invalid durations, capacity, energy and overflowing itineraries", () => {
    const { data, service } = fixture();
    expect(
      validate("servicios", { ...service, capacidad: 0 }, data),
    ).toBeTruthy();
    const c = { ...newClase(), tema: "Clase" };
    c.itinerario.bloques = [
      { id: "b", nombre: "Coreo", minutos: 70, color: "#FF6B9D" },
    ];
    expect(sumMinutes(c.itinerario)).toBe(70);
    expect(validate("clases", c, data)).toBeTruthy();
    c.itinerario.bloques = [];
    c.energia = 6;
    expect(validate("clases", c, data)).toBeTruthy();
  });
  it("does not permit switching a linked process service to no tracking", () => {
    const { data, service } = fixture();
    expect(
      validate("servicios", { ...service, tipoSeguimiento: "ninguno" }, data),
    ).toBeTruthy();
  });
});

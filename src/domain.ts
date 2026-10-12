import type {
  Carpeta,
  Ciclo,
  Clase,
  CollectionName,
  Data,
  Itinerario,
  Records,
} from "./models";
export const sumMinutes = (i: Itinerario) =>
  i.bloques.reduce((sum, b) => sum + b.minutos, 0);
export const progress = (c: Carpeta) =>
  c.seccionesCoreo.length
    ? Math.round(
        (c.seccionesCoreo.filter((s) => c.avance.includes(s.id)).length /
          c.seccionesCoreo.length) *
          100,
      )
    : 0;
export const freeClasses = (data: Data, filter: string) =>
  data.clases
    .filter(
      (c) =>
        !c.carpetaId &&
        !c.cicloId &&
        (filter === "todas" ||
          (filter === "dadas" ? c.realizada : !c.realizada)),
    )
    .sort((a, b) =>
      `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`),
    );
export function attendance(ciclo: Ciclo, clases: Clase[], alumnaId: string) {
  const entries = clases
    .filter((c) => c.cicloId === ciclo.id && c.realizada)
    .flatMap((c) => {
      const a = c.alumnas.find((a) => a.id === alumnaId);
      return a ? [[c.id, a.presente] as const] : [];
    });
  return {
    asistencia: Object.fromEntries(entries),
    total: entries.length,
    presentes: entries.filter(([, presente]) => presente).length,
    porcentaje: entries.length
      ? Math.round((entries.filter(([, p]) => p).length / entries.length) * 100)
      : 0,
  };
}
export function linkClass(
  clase: Clase,
  data: Data,
  servicioId?: string,
  carpetaId?: string,
  cicloId?: string,
): Clase {
  const service = data.servicios.find((s) => s.id === servicioId);
  const ciclo = data.ciclos.find((c) => c.id === cicloId);
  const next = { ...clase, servicioId, carpetaId, cicloId };
  if (service) next.itinerario = structuredClone(service.itinerarioPlantilla);
  if (ciclo) {
    next.itinerario = structuredClone(ciclo.itinerario);
    next.alumnas = ciclo.alumnas.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      presente: false,
    }));
  } else next.alumnas = [];
  next.tag = carpetaId || cicloId ? "regular" : "libre";
  return next;
}
export function deletionReason<K extends CollectionName>(
  kind: K,
  id: string,
  data: Data,
): string | null {
  if (
    kind === "servicios" &&
    (data.carpetas.some((c) => c.servicioId === id) ||
      data.ciclos.some((c) => c.servicioId === id) ||
      data.clases.some((c) => c.servicioId === id))
  )
    return "Este servicio tiene procesos, ciclos o clases. Elimínalos o desvincúlalos primero.";
  if (kind === "carpetas" && data.clases.some((c) => c.carpetaId === id))
    return "Este proceso tiene clases. Elimínalas o desvincúlalas primero.";
  if (kind === "ciclos" && data.clases.some((c) => c.cicloId === id))
    return "Este ciclo tiene clases. Elimínalas o desvincúlalas primero.";
  return null;
}
export function validate<K extends CollectionName>(
  kind: K,
  value: Records[K],
  data: Data,
): string | null {
  const v = value as Records[CollectionName];
  if ("nombre" in v && !v.nombre.trim()) return "Escribe un nombre.";
  const validItinerary = (i: Itinerario) =>
    Number.isFinite(i.dur) &&
    i.dur > 0 &&
    i.bloques.every(
      (b) => b.nombre.trim() && Number.isFinite(b.minutos) && b.minutos > 0,
    ) &&
    sumMinutes(i) <= i.dur;
  if (kind === "servicios") {
    const s = value as Records["servicios"];
    if (!(
      s.duracion > 0 &&
      Number.isInteger(s.capacidad) &&
      s.capacidad > 0 &&
      Number.isFinite(s.precio) &&
      s.precio >= 0
    ))
      return "Revisa duración, capacidad y precio.";
    if (!validItinerary(s.itinerarioPlantilla))
      return "Completa los bloques y ajusta sus minutos a la duración de la clase.";
    if (
      s.tipoSeguimiento !== "proceso" &&
      (data.carpetas.some((c) => c.servicioId === s.id) ||
        data.ciclos.some((c) => c.servicioId === s.id))
    )
      return "Este servicio tiene procesos o ciclos. Desvincúlalos antes de cambiar su seguimiento.";
  }
  if (kind === "carpetas" || kind === "ciclos") {
    const parent = data.servicios.find(
      (s) => s.id === (v as Carpeta | Ciclo).servicioId,
    );
    if (!parent || parent.tipoSeguimiento !== "proceso")
      return "Selecciona un servicio con seguimiento de proceso.";
  }
  if (kind === "carpetas") {
    const c = value as Carpeta;
    if (c.seccionesCoreo.some((s) => !s.nombre.trim()))
      return "Escribe un nombre para cada sección.";
  }
  if (kind === "ciclos") {
    const c = value as Ciclo;
    if (!/^\d{4}-\d{2}$/.test(c.mes) || !validItinerary(c.itinerario))
      return "Revisa el mes y el itinerario del ciclo.";
    if (c.alumnas.some((a) => !a.nombre.trim()))
      return "Escribe el nombre de cada alumna.";
  }
  if (kind === "clases") {
    const c = value as Clase;
    if (
      !c.tema.trim() ||
      !/^\d{4}-\d{2}-\d{2}$/.test(c.fecha) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(c.hora)
    )
      return "Completa tema, fecha y hora.";
    if (!validItinerary(c.itinerario))
      return "Completa los bloques y ajusta sus minutos a la duración de la clase.";
    if (
      c.energia !== null &&
      (!Number.isInteger(c.energia) || c.energia < 1 || c.energia > 5)
    )
      return "La energía debe estar entre 1 y 5.";
    if (c.alumnas.some((a) => !a.nombre.trim()))
      return "Escribe el nombre de cada alumna.";
    if (c.servicioId && !data.servicios.some((s) => s.id === c.servicioId))
      return "El servicio ya no está disponible.";
    if (
      c.carpetaId &&
      !data.carpetas.some(
        (p) => p.id === c.carpetaId && p.servicioId === c.servicioId,
      )
    )
      return "El proceso debe pertenecer al servicio seleccionado.";
    if (
      c.cicloId &&
      !data.ciclos.some(
        (p) => p.id === c.cicloId && p.servicioId === c.servicioId,
      )
    )
      return "El ciclo debe pertenecer al servicio seleccionado.";
  }
  return null;
}
export const money = (n: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 2,
  }).format(n);
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short" }).format(
    new Date(`${date}T12:00:00`),
  );

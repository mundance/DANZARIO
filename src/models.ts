export const COLORS = ["#FF6B9D", "#845EC2", "#4D8FFF", "#00C9B1"] as const;
export type Seguimiento = "ninguno" | "por_clase" | "proceso";
export type Tag = "regular" | "practica" | "grabacion" | "cierre" | "libre";
export interface Entity {
  id: string;
  createdAt: number;
  updatedAt: number;
}
export interface Bloque {
  id: string;
  nombre: string;
  minutos: number;
  color: string;
}
export interface Itinerario {
  dur: number;
  bloques: Bloque[];
}
export interface Service extends Entity {
  nombre: string;
  descripcion: string;
  duracion: number;
  capacidad: number;
  precio: number;
  color: string;
  emoji: string;
  tipoSeguimiento: Seguimiento;
  objetivosTipicos: string;
  itinerarioPlantilla: Itinerario;
  notasInternas: string;
}
export interface Alumna {
  id: string;
  nombre: string;
  objetivos: string;
  notas: string;
  criterios: Record<string, string>;
  asistencia: Record<string, boolean>;
}
export interface Ciclo extends Entity {
  servicioId: string;
  mes: string;
  nombre: string;
  objetivos: string;
  notas: string;
  alumnas: Alumna[];
  itinerario: Itinerario;
}
export interface Seccion {
  id: string;
  nombre: string;
  color: string;
}
export interface Carpeta extends Entity {
  nombre: string;
  estilo: string;
  dias: string[];
  horario: string;
  color: string;
  servicioId: string;
  seccionesCoreo: Seccion[];
  avance: string[];
  coreoTerminada: boolean;
}
export interface Checkin {
  emocion: string;
  nota: string;
}
export interface Clase extends Entity {
  carpetaId?: string;
  cicloId?: string;
  servicioId?: string;
  fecha: string;
  hora: string;
  tema: string;
  cancion: string;
  genero: string;
  profesor: string;
  energia: number | null;
  tag: Tag;
  calentamiento: string[];
  dinamicas: string[];
  notas: string;
  trackerEmocional: { antes: Checkin; despues: Checkin };
  notasProfesor: string;
  itinerario: Itinerario;
  alumnas: { id: string; nombre: string; presente: boolean }[];
  realizada: boolean;
}
export interface Data {
  servicios: Service[];
  ciclos: Ciclo[];
  carpetas: Carpeta[];
  clases: Clase[];
}
export type CollectionName = keyof Data;
export type Records = {
  servicios: Service;
  ciclos: Ciclo;
  carpetas: Carpeta;
  clases: Clase;
};
export const emptyData = (): Data => ({
  servicios: [],
  ciclos: [],
  carpetas: [],
  clases: [],
});
export const entity = (): Entity => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
export const itinerary = (dur = 60): Itinerario => ({ dur, bloques: [] });
export const newService = (): Service => ({
  ...entity(),
  nombre: "",
  descripcion: "",
  duracion: 60,
  capacidad: 10,
  precio: 0,
  color: COLORS[0],
  emoji: "💃",
  tipoSeguimiento: "ninguno",
  objetivosTipicos: "",
  itinerarioPlantilla: itinerary(),
  notasInternas: "",
});
export const newCarpeta = (servicioId = ""): Carpeta => ({
  ...entity(),
  nombre: "",
  estilo: "",
  dias: [],
  horario: "",
  color: COLORS[1],
  servicioId,
  seccionesCoreo: [],
  avance: [],
  coreoTerminada: false,
});
export const newCiclo = (service: Service): Ciclo => ({
  ...entity(),
  servicioId: service.id,
  mes: localDate().slice(0, 7),
  nombre: "",
  objetivos: service.objetivosTipicos,
  notas: "",
  alumnas: [],
  itinerario: structuredClone(service.itinerarioPlantilla),
});
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export const newClase = (): Clase => ({
  ...entity(),
  fecha: localDate(),
  hora: "18:00",
  tema: "",
  cancion: "",
  genero: "",
  profesor: "",
  energia: null,
  tag: "libre",
  calentamiento: [],
  dinamicas: [],
  notas: "",
  trackerEmocional: {
    antes: { emocion: "", nota: "" },
    despues: { emocion: "", nota: "" },
  },
  notasProfesor: "",
  itinerario: itinerary(),
  alumnas: [],
  realizada: false,
});

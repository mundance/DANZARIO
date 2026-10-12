import { ArrowUpRight, CalendarDays, Clock3, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Carpeta, Clase, Service } from "../models";
import { dateLabel, money, progress } from "../domain";
import { Badge } from "./ui";
const types = {
  ninguno: "Sin seguimiento",
  por_clase: "Por clase",
  proceso: "Proceso",
};
export function ServiceCard({ value }: { value: Service }) {
  return (
    <Link
      to={`/servicios/${value.id}`}
      className="service-card group"
      style={{ "--accent": value.color } as React.CSSProperties}
    >
      <div className="flex justify-between items-start">
        <span className="service-emoji">{value.emoji}</span>
        <ArrowUpRight size={19} className="text-muted group-hover:text-white" />
      </div>
      <h3 className="mt-5">{value.nombre}</h3>
      <p className="card-description">
        {value.descripcion || "Un espacio para conectar con la danza."}
      </p>
      <div className="flex justify-between items-center mt-5 gap-2">
        <Badge color={value.color}>{types[value.tipoSeguimiento]}</Badge>
        <span className="font-bold text-sm">{money(value.precio)}</span>
      </div>
      <div className="card-footer">
        <span>
          <Clock3 size={13} />
          {value.duracion} min
        </span>
        <span>{value.capacidad} alumnas</span>
      </div>
    </Link>
  );
}
export function CarpetaCard({ value }: { value: Carpeta }) {
  const percent = progress(value);
  return (
    <Link className="process-card group" to={`/carpetas/${value.id}`}>
      <div className="flex items-start justify-between">
        <span
          className="process-icon"
          style={{ color: value.color, background: `${value.color}18` }}
        >
          <Music2 size={21} />
        </span>
        <Badge color={value.coreoTerminada ? "#00C9B1" : value.color}>
          {value.coreoTerminada ? "Terminada" : "En proceso"}
        </Badge>
      </div>
      <h3 className="mt-4">{value.nombre}</h3>
      <p className="text-muted text-sm mt-1">
        {value.estilo || "Tu próximo movimiento"}
        {value.dias.length ? ` · ${value.dias.join(", ")}` : ""}
      </p>
      <div className="flex justify-between text-xs mt-6 mb-2">
        <span className="text-muted">Avance de coreografía</span>
        <span className="font-bold" style={{ color: value.color }}>
          {percent}%
        </span>
      </div>
      <div className="progress">
        <span style={{ width: `${percent}%`, background: value.color }} />
      </div>
    </Link>
  );
}
export function ClaseCard({ value }: { value: Clase }) {
  return (
    <Link to={`/clases/${value.id}`} className="class-row">
      <div className="class-date">
        <CalendarDays size={17} />
        <span>{dateLabel(value.fecha)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate">{value.tema}</h3>
        <p className="text-muted text-sm truncate">
          {value.hora} · {value.itinerario.dur} min
          {value.genero ? ` · ${value.genero}` : ""}
        </p>
      </div>
      <Badge color={value.realizada ? "#00C9B1" : "#FF6B9D"}>
        {value.realizada ? "Dada" : "Pendiente"}
      </Badge>
      <ArrowUpRight size={17} className="hidden sm:block text-muted" />
    </Link>
  );
}

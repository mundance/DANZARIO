import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../data";
import { CarpetaCard, ClaseCard, ServiceCard } from "../components/cards";
import { Empty, PageTitle } from "../components/ui";
export function Lists({ kind }: { kind: "servicios" | "carpetas" | "clases" }) {
  const { data } = useData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todas");
  const content = {
    servicios: {
      title: "Mis servicios",
      description: "Experiencias que llevan tu sello.",
      create: "Nuevo servicio",
      route: "/servicios/nuevo",
    },
    carpetas: {
      title: "Mis procesos",
      description: "Una intención. Muchos pasos. Tu coreografía.",
      create: "Nuevo proceso",
      route: "/carpetas/nueva",
    },
    clases: {
      title: "Mis clases",
      description: "Cada encuentro, pensado con cuidado.",
      create: "Nueva clase",
      route: "/clases/nueva",
    },
  }[kind];
  const services = data.servicios.filter((s) =>
    s.nombre.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const folders = data.carpetas.filter((c) =>
    c.nombre.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const classes = [...data.clases]
    .filter(
      (c) =>
        c.tema.toLocaleLowerCase().includes(query.toLocaleLowerCase()) &&
        (filter === "todas" ||
          (filter === "dadas" ? c.realizada : !c.realizada)),
    )
    .sort((a, b) =>
      `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`),
    );
  const count =
    kind === "servicios"
      ? services.length
      : kind === "carpetas"
        ? folders.length
        : classes.length;
  const canCreate =
    kind !== "carpetas" ||
    data.servicios.some((s) => s.tipoSeguimiento === "proceso");
  return (
    <>
      <PageTitle
        eyebrow="ORGANIZA TU DANZA"
        title={content.title}
        description={content.description}
        action={
          canCreate && (
            <Link className="btn btn-primary" to={content.route}>
              <Plus size={18} />
              {content.create}
            </Link>
          )
        }
      />
      <div className="list-tools">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Buscar por nombre"
            placeholder="Buscar por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        {kind === "clases" && (
          <div className="filter-tabs mb-0">
            {["todas", "pendientes", "dadas"].map((f) => (
              <button
                key={f}
                aria-pressed={filter === f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
      {count ? (
        kind === "clases" ? (
          <div className="class-list">
            {classes.map((c) => (
              <ClaseCard key={c.id} value={c} />
            ))}
          </div>
        ) : (
          <div className="card-grid">
            {kind === "servicios"
              ? services.map((s) => <ServiceCard key={s.id} value={s} />)
              : folders.map((c) => <CarpetaCard key={c.id} value={c} />)}
          </div>
        )
      ) : (
        <Empty
          title={
            query || filter !== "todas"
              ? "No encontramos coincidencias"
              : "Un nuevo comienzo"
          }
          text={
            !canCreate
              ? "Primero crea un servicio con seguimiento de proceso."
              : "Todo empieza con tu primera idea. Aquí podrás organizarla."
          }
          to={
            canCreate ? content.route : "/servicios/nuevo?seguimiento=proceso"
          }
          action={canCreate ? content.create : "Crear servicio"}
        />
      )}
    </>
  );
}

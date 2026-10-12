import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Layers3,
  Plus,
  Sparkles,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../data";
import { freeClasses } from "../domain";
import { CarpetaCard, ClaseCard, ServiceCard } from "../components/cards";
import { Empty, PageTitle, Section } from "../components/ui";
import { useAuth } from "../auth";
export function Home() {
  const { data } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState("todas");
  const clases = freeClasses(data, filter).slice(0, 3);
  return (
    <>
      <PageTitle
        eyebrow="TU ESPACIO CREATIVO"
        title={`Hola, ${user?.displayName?.split(" ")[0] || "profe"}`}
        description="Cada gran clase empieza con una intención."
        action={
          <Link className="btn btn-primary" to="/clases/nueva">
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva clase</span>
            <span className="sm:hidden">Clase</span>
          </Link>
        }
      />
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">
            <span className="live-dot" />
            PLANEA. CONECTA. BAILA.
          </div>
          <h2>
            TU DANZA,
            <br />
            <span>CON INTENCIÓN.</span>
          </h2>
          <p>
            Menos improvisar la agenda.
            <br />
            Más espacio para crear y acompañar.
          </p>
          <Link to="/clases/nueva" className="hero-link">
            Planea tu próxima clase <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="hero-star">
            <Sparkles size={35} />
          </span>
          <span className="art-label">
            ENCUENTRA
            <br />
            TU RITMO
          </span>
        </div>
      </section>
      <div className="stats-row">
        {[
          {
            icon: Layers3,
            value: data.carpetas.filter((c) => !c.coreoTerminada).length,
            label: "Procesos activos",
            color: "#845EC2",
          },
          {
            icon: CalendarDays,
            value: data.clases.length,
            label: "Clases planificadas",
            color: "#4D8FFF",
          },
          {
            icon: Waves,
            value: data.servicios.length,
            label: "Mis servicios",
            color: "#00C9B1",
          },
        ].map(({ icon: Icon, value, label, color }) => (
          <div className="stat" key={label}>
            <span
              className="stat-icon"
              style={{ color, background: `${color}18` }}
            >
              <Icon size={20} />
            </span>
            <div>
              <strong>{String(value).padStart(2, "0")}</strong>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>
      <Section
        title="Mis servicios"
        subtitle="Tu forma de enseñar, en cada experiencia."
        to="/servicios"
      >
        {data.servicios.length ? (
          <div className="card-grid">
            {data.servicios.slice(0, 3).map((s) => (
              <ServiceCard key={s.id} value={s} />
            ))}
          </div>
        ) : (
          <Empty
            title="Diseña tu primera experiencia"
            text="Crea un servicio para tus clases privadas, programas o talleres."
            to="/servicios/nuevo"
            action="Crear servicio"
          />
        )}
      </Section>
      <Section
        title="Mis procesos"
        subtitle="Paso a paso, una coreografía toma forma."
        to="/carpetas"
      >
        {data.carpetas.length ? (
          <div className="card-grid">
            {data.carpetas.slice(0, 3).map((c) => (
              <CarpetaCard key={c.id} value={c} />
            ))}
          </div>
        ) : (
          <Empty
            title="Dale forma a una coreografía"
            text="Agrupa tus clases y sigue el avance de cada sección."
            to={
              data.servicios.some((s) => s.tipoSeguimiento === "proceso")
                ? "/carpetas/nueva"
                : "/servicios/nuevo?seguimiento=proceso"
            }
            action={
              data.servicios.some((s) => s.tipoSeguimiento === "proceso")
                ? "Crear proceso"
                : "Crear servicio de proceso"
            }
          />
        )}
      </Section>
      <Section
        title="Clases libres"
        subtitle="Un encuentro también puede hacer la diferencia."
        to="/clases"
      >
        <div
          className="filter-tabs"
          role="group"
          aria-label="Filtrar clases libres"
        >
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
        {clases.length ? (
          <div className="class-list">
            {clases.map((c) => (
              <ClaseCard key={c.id} value={c} />
            ))}
          </div>
        ) : (
          <Empty
            title="Aquí empieza tu próxima clase"
            text="Crea una clase libre o cambia el filtro para ver tus encuentros."
            to="/clases/nueva"
            action="Planear una clase"
          />
        )}
      </Section>
      <div className="bottom-note">
        <Sparkles size={14} /> Enseñar también es una forma de bailar.
      </div>
    </>
  );
}

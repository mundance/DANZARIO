import { useState, type ReactNode } from "react";
import { Check, Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useData } from "../data";
import type { CollectionName, Itinerario, Records } from "../models";
import {
  attendance,
  dateLabel,
  deletionReason,
  money,
  progress,
  sumMinutes,
} from "../domain";
import {
  Badge,
  Empty,
  ErrorMessage,
  Modal,
  PageTitle,
  Panel,
  Section,
} from "../components/ui";
import { CarpetaCard, ClaseCard } from "../components/cards";
export function Missing() {
  return (
    <Empty
      title="No encontramos este espacio"
      text="Puede que se haya eliminado o que pertenezca a otra cuenta."
      to="/"
      action="Volver al inicio"
    />
  );
}
function Notes({ label, text }: { label: string; text: string }) {
  return text ? (
    <div className="mb-5">
      <h3 className="text-sm text-muted mb-2">{label}</h3>
      <p className="whitespace-pre-wrap">{text}</p>
    </div>
  ) : null;
}
function ItineraryView({ value }: { value: Itinerario }) {
  return (
    <Panel title="Itinerario">
      <div className="flex gap-3 mb-5">
        <Badge color="#4D8FFF">
          <Clock3 size={13} />
          {value.dur} min
        </Badge>
        <span className="text-muted text-sm">
          {sumMinutes(value)} min planificados
        </span>
      </div>
      {value.bloques.length ? (
        value.bloques.map((b, i) => (
          <div className="itinerary-item" key={b.id}>
            <span style={{ color: b.color }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <strong>{b.nombre}</strong>
            <Badge color={b.color}>{b.minutos} min</Badge>
          </div>
        ))
      ) : (
        <p className="text-muted">
          Todavía no hay bloques. Puedes agregarlos al editar.
        </p>
      )}
    </Panel>
  );
}
function DeleteButton({
  kind,
  id,
  destination,
}: {
  kind: CollectionName;
  id: string;
  destination: string;
}) {
  const { data, remove, notify } = useData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reason = deletionReason(kind, id, data);
  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await remove(kind, id);
      notify("Registro eliminado");
      navigate(destination);
    } catch (e) {
      setError(
        e instanceof Error && !e.message.startsWith("Firebase:")
          ? e.message
          : "No pudimos eliminar. Intenta de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="btn btn-danger mt-8" onClick={() => setOpen(true)}>
        <Trash2 size={16} />
        Eliminar
      </button>
      {open && (
        <Modal
          title={
            reason ? "Hay registros vinculados" : "¿Eliminar este registro?"
          }
          onClose={() => {
            if (!busy) setOpen(false);
          }}
        >
          <p className="text-muted my-4">
            {reason ||
              "Esta acción elimina el registro de tu cuenta. No se puede deshacer."}
          </p>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <div className="flex gap-3 mt-5">
            <button
              className="btn btn-secondary"
              disabled={busy}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
            {!reason && (
              <button
                className="btn btn-danger"
                disabled={busy}
                onClick={confirm}
              >
                {busy ? "Eliminando…" : "Confirmar eliminación"}
              </button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
function Edit({ to }: { to: string }) {
  return (
    <Link className="btn btn-secondary" to={to}>
      <Pencil size={16} />
      Editar
    </Link>
  );
}
function Mutation<K extends CollectionName>({
  kind,
  value,
  children,
}: {
  kind: K;
  value: Records[K];
  children: (
    mutate: (patch: Partial<Records[K]>) => void,
    busy: boolean,
  ) => ReactNode;
}) {
  const { save, notify } = useData();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function mutate(patch: Partial<Records[K]>) {
    setBusy(true);
    setError("");
    try {
      await save(kind, { ...value, ...patch });
      notify("Cambios guardados");
    } catch (e) {
      setError(
        e instanceof Error && !e.message.startsWith("Firebase:")
          ? e.message
          : "No pudimos guardar. Intenta de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {children(mutate, busy)}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  );
}
export function ServiceDetail() {
  const { id } = useParams();
  const { data } = useData();
  const service = data.servicios.find((s) => s.id === id);
  if (!service) return <Missing />;
  const ciclos = data.ciclos
    .filter((c) => c.servicioId === id)
    .sort((a, b) => b.mes.localeCompare(a.mes));
  const folders = data.carpetas.filter((c) => c.servicioId === id);
  const classes = data.clases.filter((c) => c.servicioId === id);
  return (
    <>
      <PageTitle
        eyebrow="MIS SERVICIOS"
        title={`${service.emoji} ${service.nombre}`}
        description={service.descripcion}
        back="/servicios"
        action={<Edit to={`/servicios/${id}/editar`} />}
      />
      <div className="detail-meta">
        <Badge color={service.color}>
          {service.tipoSeguimiento === "proceso"
            ? "Proceso"
            : service.tipoSeguimiento === "por_clase"
              ? "Por clase"
              : "Sin seguimiento"}
        </Badge>
        <span>{service.duracion} min</span>
        <span>{service.capacidad} alumnas</span>
        <strong>{money(service.precio)}</strong>
      </div>
      {(service.objetivosTipicos || service.notasInternas) && (
        <Panel title="Tu intención">
          <Notes label="Objetivos típicos" text={service.objetivosTipicos} />
          <Notes label="Notas internas" text={service.notasInternas} />
        </Panel>
      )}
      <ItineraryView value={service.itinerarioPlantilla} />
      {service.tipoSeguimiento === "proceso" && (
        <>
          <Section
            title="Ciclos mensuales"
            subtitle="Un espacio para acompañar a cada alumna."
            to={`/servicios/${id}/ciclos/nuevo`}
            action="Nuevo ciclo"
          >
            {ciclos.length ? (
              <div className="card-grid">
                {ciclos.map((c) => (
                  <Link
                    className="process-card"
                    key={c.id}
                    to={`/servicios/${id}/ciclos/${c.id}`}
                  >
                    <Badge color={service.color}>{c.mes}</Badge>
                    <h3 className="mt-4">{c.nombre}</h3>
                    <p className="text-muted text-sm mt-2">
                      {c.alumnas.length} alumnas ·{" "}
                      {data.clases.filter((cl) => cl.cicloId === c.id).length}{" "}
                      clases
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty
                title="Un mes para crecer"
                text="Crea el primer ciclo y define los objetivos de tus alumnas."
                to={`/servicios/${id}/ciclos/nuevo`}
                action="Crear ciclo"
              />
            )}
          </Section>
          <Section
            title="Procesos de coreografía"
            to={`/carpetas/nueva?servicio=${id}`}
            action="Nuevo proceso"
          >
            {folders.length ? (
              <div className="card-grid">
                {folders.map((c) => (
                  <CarpetaCard key={c.id} value={c} />
                ))}
              </div>
            ) : (
              <Empty
                title="Construye tu próxima coreografía"
                text="Organiza sus secciones y registra el avance."
                to={`/carpetas/nueva?servicio=${id}`}
                action="Crear proceso"
              />
            )}
          </Section>
        </>
      )}
      <Section
        title="Clases del servicio"
        to={`/clases/nueva?servicio=${id}`}
        action="Nueva clase"
      >
        {classes.length ? (
          <div className="class-list">
            {classes.map((c) => (
              <ClaseCard key={c.id} value={c} />
            ))}
          </div>
        ) : (
          <Empty
            title="Tu servicio está listo para bailar"
            text="Planea su primera clase."
            to={`/clases/nueva?servicio=${id}`}
            action="Crear clase"
          />
        )}
      </Section>
      <DeleteButton kind="servicios" id={service.id} destination="/servicios" />
    </>
  );
}
export function CarpetaDetail() {
  const { id } = useParams();
  const { data } = useData();
  const value = data.carpetas.find((c) => c.id === id);
  if (!value) return <Missing />;
  const service = data.servicios.find((s) => s.id === value.servicioId);
  const classes = data.clases.filter((c) => c.carpetaId === id);
  return (
    <>
      <PageTitle
        eyebrow="MIS PROCESOS"
        title={value.nombre}
        description={`${value.estilo}${value.dias.length ? ` · ${value.dias.join(", ")} ${value.horario}` : ""}`}
        back="/carpetas"
        action={<Edit to={`/carpetas/${id}/editar`} />}
      />
      {service && (
        <Link className="section-link mb-6" to={`/servicios/${service.id}`}>
          {service.emoji} {service.nombre}
        </Link>
      )}
      <Panel title="Avance de coreografía">
        <div className="flex justify-between mb-3">
          <span className="text-muted">Cada paso cuenta</span>
          <strong style={{ color: value.color }}>{progress(value)}%</strong>
        </div>
        <div className="progress mb-6">
          <span
            style={{ width: `${progress(value)}%`, background: value.color }}
          />
        </div>
        <Mutation kind="carpetas" value={value}>
          {(mutate, busy) => (
            <>
              <div className="space-y-3">
                {value.seccionesCoreo.map((s) => (
                  <label
                    key={s.id}
                    className="check-row section-check"
                    style={{ borderColor: `${s.color}45` }}
                  >
                    <input
                      type="checkbox"
                      disabled={busy}
                      checked={value.avance.includes(s.id)}
                      onChange={(e) =>
                        mutate({
                          avance: e.target.checked
                            ? [...value.avance, s.id]
                            : value.avance.filter((id) => id !== s.id),
                        })
                      }
                    />
                    <span>{s.nombre}</span>
                    <span
                      className="color-dot"
                      style={{ background: s.color }}
                    />
                  </label>
                ))}
              </div>
              {!value.seccionesCoreo.length && (
                <p className="text-muted mb-4">
                  Agrega las secciones al editar este proceso.
                </p>
              )}
              <label className="check-row mt-6">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={value.coreoTerminada}
                  onChange={(e) => mutate({ coreoTerminada: e.target.checked })}
                />
                Coreografía terminada
              </label>
            </>
          )}
        </Mutation>
      </Panel>
      <Section
        title="Clases del proceso"
        to={`/clases/nueva?carpeta=${id}`}
        action="Nueva clase"
      >
        {classes.length ? (
          <div className="class-list">
            {classes.map((c) => (
              <ClaseCard key={c.id} value={c} />
            ))}
          </div>
        ) : (
          <Empty
            title="El primer paso"
            text="Crea una clase vinculada a esta coreografía."
            to={`/clases/nueva?carpeta=${id}`}
            action="Crear clase"
          />
        )}
      </Section>
      <DeleteButton kind="carpetas" id={value.id} destination="/carpetas" />
    </>
  );
}
export function CicloDetail() {
  const { id, servicioId } = useParams();
  const { data } = useData();
  const value = data.ciclos.find(
    (c) => c.id === id && c.servicioId === servicioId,
  );
  if (!value) return <Missing />;
  const classes = data.clases.filter((c) => c.cicloId === id);
  return (
    <>
      <PageTitle
        eyebrow={`CICLO MENSUAL · ${value.mes}`}
        title={value.nombre}
        back={`/servicios/${servicioId}`}
        action={<Edit to={`/servicios/${servicioId}/ciclos/${id}/editar`} />}
      />
      <Panel title="La intención del mes">
        <Notes
          label="Objetivos"
          text={value.objetivos || "Todavía no hay objetivos."}
        />
        <Notes label="Notas" text={value.notas} />
      </Panel>
      <Section
        title="Tus alumnas"
        subtitle="El avance también se ve en los pequeños cambios."
      >
        {value.alumnas.length ? (
          <div className="card-grid">
            {value.alumnas.map((a) => {
              const stats = attendance(value, data.clases, a.id);
              return (
                <Panel key={a.id}>
                  <div className="flex justify-between gap-3 mb-4">
                    <h3>{a.nombre}</h3>
                    <Badge color="#00C9B1">
                      {stats.total
                        ? `${stats.porcentaje}% asistencia`
                        : "Sin clases dadas"}
                    </Badge>
                  </div>
                  <p className="text-muted text-sm mb-4">
                    {stats.presentes} de {stats.total} clases dadas
                  </p>
                  <Notes label="Objetivos" text={a.objetivos} />
                  {Object.values(a.criterios).filter(Boolean).length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-muted text-sm mb-2">Criterios</h4>
                      <ul className="list-disc pl-5">
                        {Object.entries(a.criterios)
                          .filter(([, v]) => v)
                          .map(([key, text]) => (
                            <li key={key}>{text}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                  <Notes label="Notas y feedback" text={a.notas} />
                </Panel>
              );
            })}
          </div>
        ) : (
          <Empty
            title="Acompaña su crecimiento"
            text="Agrega alumnas y objetivos al editar este ciclo."
            to={`/servicios/${servicioId}/ciclos/${id}/editar`}
            action="Agregar alumnas"
          />
        )}
      </Section>
      <ItineraryView value={value.itinerario} />
      <Section
        title="Clases del ciclo"
        to={`/clases/nueva?ciclo=${id}`}
        action="Nueva clase"
      >
        {classes.length ? (
          <div className="class-list">
            {classes.map((c) => (
              <ClaseCard key={c.id} value={c} />
            ))}
          </div>
        ) : (
          <Empty
            title="Del objetivo al movimiento"
            text="Planea la primera clase de este ciclo."
            to={`/clases/nueva?ciclo=${id}`}
            action="Crear clase"
          />
        )}
      </Section>
      <DeleteButton
        kind="ciclos"
        id={value.id}
        destination={`/servicios/${servicioId}`}
      />
    </>
  );
}
export function ClaseDetail() {
  const { id } = useParams();
  const { data } = useData();
  const value = data.clases.find((c) => c.id === id);
  if (!value) return <Missing />;
  const service = data.servicios.find((s) => s.id === value.servicioId);
  const carpeta = data.carpetas.find((c) => c.id === value.carpetaId);
  const ciclo = data.ciclos.find((c) => c.id === value.cicloId);
  return (
    <>
      <PageTitle
        eyebrow="MIS CLASES"
        title={value.tema}
        back="/clases"
        action={<Edit to={`/clases/${id}/editar`} />}
      />
      <div className="detail-meta">
        <Badge color={value.realizada ? "#00C9B1" : "#FF6B9D"}>
          {value.realizada ? "Dada" : "Pendiente"}
        </Badge>
        <span>
          {dateLabel(value.fecha)} · {value.hora}
        </span>
        <span>{value.tag}</span>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        {service && (
          <Link className="section-link" to={`/servicios/${service.id}`}>
            {service.emoji} {service.nombre}
          </Link>
        )}
        {carpeta && (
          <Link className="section-link" to={`/carpetas/${carpeta.id}`}>
            {carpeta.nombre}
          </Link>
        )}
        {ciclo && (
          <Link
            className="section-link"
            to={`/servicios/${ciclo.servicioId}/ciclos/${ciclo.id}`}
          >
            {ciclo.nombre}
          </Link>
        )}
      </div>
      <Mutation kind="clases" value={value}>
        {(mutate, busy) => (
          <button
            className={`btn ${value.realizada ? "btn-secondary" : "btn-primary"} mb-6`}
            disabled={busy}
            onClick={() => mutate({ realizada: !value.realizada })}
          >
            <Check size={17} />
            {busy
              ? "Guardando…"
              : value.realizada
                ? "Marcar como pendiente"
                : "Marcar como dada"}
          </button>
        )}
      </Mutation>
      <Panel title="El plan">
        <Notes label="Canción" text={value.cancion} />
        <Notes label="Género / estilo" text={value.genero} />
        <Notes label="Profesor" text={value.profesor} />
        <Notes
          label="Calentamiento"
          text={value.calentamiento.filter(Boolean).join("\n")}
        />
        <Notes
          label="Dinámicas"
          text={value.dinamicas.filter(Boolean).join("\n")}
        />
        <Notes
          label="Notas"
          text={value.notas || "Un espacio para tu intención."}
        />
      </Panel>
      <ItineraryView value={value.itinerario} />
      <Panel title="Asistencia">
        <Mutation kind="clases" value={value}>
          {(mutate, busy) => (
            <div className="space-y-3">
              {value.alumnas.map((a) => (
                <label className="check-row section-check" key={a.id}>
                  <input
                    type="checkbox"
                    disabled={busy}
                    checked={a.presente}
                    onChange={(e) =>
                      mutate({
                        alumnas: value.alumnas.map((student) =>
                          student.id === a.id
                            ? { ...student, presente: e.target.checked }
                            : student,
                        ),
                      })
                    }
                  />
                  {a.nombre}
                </label>
              ))}
              {!value.alumnas.length && (
                <p className="text-muted">
                  Agrega alumnas al editar esta clase.
                </p>
              )}
            </div>
          )}
        </Mutation>
      </Panel>
      <Panel title="Tu espacio emocional">
        <Notes
          label="Tu energía"
          text={value.energia ? `${value.energia} de 5` : "Sin registrar"}
        />
        <Notes
          label="Cómo llegaste"
          text={[
            value.trackerEmocional.antes.emocion,
            value.trackerEmocional.antes.nota,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <Notes
          label="Cómo te fuiste"
          text={[
            value.trackerEmocional.despues.emocion,
            value.trackerEmocional.despues.nota,
          ]
            .filter(Boolean)
            .join(" · ")}
        />
        <Notes label="Notas del profesor" text={value.notasProfesor} />
      </Panel>
      <Link className="btn btn-secondary mt-5" to="/clases/nueva">
        <Plus size={16} />
        Planear otra clase
      </Link>
      <div>
        <DeleteButton kind="clases" id={value.id} destination="/clases" />
      </div>
    </>
  );
}

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useData } from "../data";
import { COLORS, newCarpeta, newCiclo, type Alumna } from "../models";
import { Form } from "../components/Form";
import { ItineraryEditor } from "../components/editors";
import {
  ColorPicker,
  Empty,
  Input,
  PageTitle,
  Panel,
  Select,
  Textarea,
} from "../components/ui";
import { Missing } from "./details";
const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
export function CarpetaEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data } = useData();
  const services = data.servicios.filter(
    (s) => s.tipoSeguimiento === "proceso",
  );
  const [initial] = useState(() =>
    id
      ? data.carpetas.find((c) => c.id === id)
      : newCarpeta(params.get("servicio") || services[0]?.id),
  );
  const [value, setValue] = useState(initial);
  if (!initial || !value) return <Missing />;
  if (!services.length)
    return (
      <Empty
        title="Primero crea un servicio"
        text="Las carpetas pertenecen a servicios con seguimiento de proceso."
        to="/servicios/nuevo?seguimiento=proceso"
      />
    );
  const update = (patch: Partial<typeof value>) =>
    setValue({ ...value, ...patch });
  return (
    <>
      <PageTitle
        eyebrow="PASO A PASO"
        title={id ? "Editar proceso" : "Nuevo proceso"}
        back={id ? `/carpetas/${id}` : "/carpetas"}
      />
      <Form
        kind="carpetas"
        value={value}
        initial={initial}
        destination={id ? `/carpetas/${id}` : "/carpetas"}
      >
        <Panel title="Tu proceso">
          <Input
            label="Nombre del proceso"
            required
            autoFocus
            value={value.nombre}
            onChange={(e) => update({ nombre: e.target.value })}
          />
          <Select
            label="Servicio"
            value={value.servicioId}
            onChange={(e) => update({ servicioId: e.target.value })}
            disabled={!!id && data.clases.some((c) => c.carpetaId === id)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
          <Input
            label="Estilo"
            placeholder="Ej. Heels, urbano, contemporáneo"
            value={value.estilo}
            onChange={(e) => update({ estilo: e.target.value })}
          />
          <div className="field">
            <span className="field-label">Días de clase</span>
            <div className="flex flex-wrap gap-2">
              {days.map((day) => (
                <button
                  type="button"
                  key={day}
                  className={`day ${value.dias.includes(day) ? "selected" : ""}`}
                  aria-pressed={value.dias.includes(day)}
                  onClick={() =>
                    update({
                      dias: value.dias.includes(day)
                        ? value.dias.filter((d) => d !== day)
                        : [...value.dias, day],
                    })
                  }
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Horario"
            type="time"
            value={value.horario}
            onChange={(e) => update({ horario: e.target.value })}
          />
          <ColorPicker
            value={value.color}
            onChange={(color) => update({ color })}
          />
        </Panel>
        <Panel title="Secciones de coreografía">
          <p className="text-muted text-sm mb-4">
            Divide la coreografía en partes. Marca el avance desde el detalle
            del proceso.
          </p>
          {value.seccionesCoreo.map((s, i) => (
            <div className="block-editor" key={s.id}>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    label={`Sección ${i + 1}`}
                    required
                    value={s.nombre}
                    onChange={(e) =>
                      update({
                        seccionesCoreo: value.seccionesCoreo.map((section) =>
                          section.id === s.id
                            ? { ...section, nombre: e.target.value }
                            : section,
                        ),
                      })
                    }
                  />
                </div>
                <button
                  type="button"
                  className="icon-btn mb-3"
                  aria-label={`Eliminar sección ${i + 1}`}
                  onClick={() =>
                    update({
                      seccionesCoreo: value.seccionesCoreo.filter(
                        (section) => section.id !== s.id,
                      ),
                      avance: value.avance.filter(
                        (section) => section !== s.id,
                      ),
                    })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <ColorPicker
                label={`Color de sección ${i + 1}`}
                value={s.color}
                onChange={(color) =>
                  update({
                    seccionesCoreo: value.seccionesCoreo.map((section) =>
                      section.id === s.id ? { ...section, color } : section,
                    ),
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              update({
                seccionesCoreo: [
                  ...value.seccionesCoreo,
                  {
                    id: crypto.randomUUID(),
                    nombre: "",
                    color: COLORS[value.seccionesCoreo.length % COLORS.length],
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Agregar sección
          </button>
          <label className="check-row mt-6">
            <input
              type="checkbox"
              checked={value.coreoTerminada}
              onChange={(e) => update({ coreoTerminada: e.target.checked })}
            />
            Coreografía terminada
          </label>
        </Panel>
      </Form>
    </>
  );
}
export function CicloEditor() {
  const { id, servicioId } = useParams();
  const { data } = useData();
  const service = data.servicios.find((s) => s.id === servicioId);
  const [initial] = useState(() =>
    id
      ? data.ciclos.find((c) => c.id === id && c.servicioId === servicioId)
      : service
        ? newCiclo(service)
        : undefined,
  );
  const [value, setValue] = useState(initial);
  if (!service || service.tipoSeguimiento !== "proceso" || !initial || !value)
    return <Missing />;
  const update = (patch: Partial<typeof value>) =>
    setValue({ ...value, ...patch });
  const updateStudent = (id: string, patch: Partial<Alumna>) =>
    update({
      alumnas: value.alumnas.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  return (
    <>
      <PageTitle
        eyebrow={service.nombre}
        title={id ? "Editar ciclo" : "Nuevo ciclo mensual"}
        back={`/servicios/${servicioId}`}
      />
      <Form
        kind="ciclos"
        value={value}
        initial={initial}
        destination={
          id
            ? `/servicios/${servicioId}/ciclos/${id}`
            : `/servicios/${servicioId}`
        }
      >
        <Panel title="Un mes, una intención">
          <Input
            label="Mes del ciclo"
            type="month"
            required
            value={value.mes}
            onChange={(e) => update({ mes: e.target.value })}
          />
          <Input
            label="Nombre del ciclo"
            required
            autoFocus
            placeholder="Ej. Mayo 2025 · Diana"
            value={value.nombre}
            onChange={(e) => update({ nombre: e.target.value })}
          />
          <Textarea
            label="Objetivos del ciclo"
            value={value.objetivos}
            onChange={(e) => update({ objetivos: e.target.value })}
          />
          <Textarea
            label="Notas del ciclo"
            value={value.notas}
            onChange={(e) => update({ notas: e.target.value })}
          />
        </Panel>
        <Panel title="Tus alumnas">
          {value.alumnas.map((a, index) => (
            <div key={a.id} className="student-editor">
              <div className="flex justify-between items-center mb-3">
                <h3>Alumna {index + 1}</h3>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Eliminar alumna ${index + 1}`}
                  onClick={() =>
                    update({
                      alumnas: value.alumnas.filter(
                        (student) => student.id !== a.id,
                      ),
                    })
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
              <Input
                label="Nombre de alumna"
                required
                value={a.nombre}
                onChange={(e) =>
                  updateStudent(a.id, { nombre: e.target.value })
                }
              />
              <Textarea
                label="Objetivos de alumna"
                value={a.objetivos}
                onChange={(e) =>
                  updateStudent(a.id, { objetivos: e.target.value })
                }
              />
              <Textarea
                label="Criterios de seguimiento (uno por línea)"
                placeholder="Musicalidad, confianza, técnica…"
                value={Object.values(a.criterios).join("\n")}
                onChange={(e) =>
                  updateStudent(a.id, {
                    criterios: Object.fromEntries(
                      e.target.value
                        .split("\n")
                        .map((line, i) => [String(i), line]),
                    ),
                  })
                }
              />
              <Textarea
                label="Notas y feedback de alumna"
                value={a.notas}
                onChange={(e) => updateStudent(a.id, { notas: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              update({
                alumnas: [
                  ...value.alumnas,
                  {
                    id: crypto.randomUUID(),
                    nombre: "",
                    objetivos: "",
                    notas: "",
                    criterios: {},
                    asistencia: {},
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Agregar alumna
          </button>
          <p className="text-muted text-sm mt-4">
            La asistencia se registra en cada clase. Los cambios en la lista se
            aplican a las clases nuevas.
          </p>
        </Panel>
        <ItineraryEditor
          value={value.itinerario}
          onChange={(itinerario) => update({ itinerario })}
        />
      </Form>
    </>
  );
}

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { useData } from "../data";
import { newClase, type Clase, type Tag } from "../models";
import { linkClass } from "../domain";
import { Form } from "../components/Form";
import { ItineraryEditor, ListEditor } from "../components/editors";
import { Input, PageTitle, Panel, Select, Textarea } from "../components/ui";
import { Missing } from "./details";
const moods = [
  "Con energía",
  "En calma",
  "Inspirada",
  "Cansada",
  "Con nervios",
];
export function ClassEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data } = useData();
  const [initial] = useState(() => {
    if (id) return data.clases.find((c) => c.id === id);
    const carpeta = data.carpetas.find((c) => c.id === params.get("carpeta"));
    const ciclo = data.ciclos.find((c) => c.id === params.get("ciclo"));
    const service =
      params.get("servicio") || carpeta?.servicioId || ciclo?.servicioId;
    return service
      ? linkClass(newClase(), data, service, carpeta?.id, ciclo?.id)
      : newClase();
  });
  const [value, setValue] = useState(initial);
  if (!initial || !value) return <Missing />;
  const update = (patch: Partial<Clase>) => setValue({ ...value, ...patch });
  function selectLinks(service?: string, carpeta?: string, ciclo?: string) {
    // Editing existing classes changes relationships without replacing their saved plan.
    if (id) update({ servicioId: service, carpetaId: carpeta, cicloId: ciclo });
    else setValue(linkClass(value!, data, service, carpeta, ciclo));
  }
  return (
    <>
      <PageTitle
        eyebrow="CREA UN ENCUENTRO CON SENTIDO"
        title={id ? "Editar clase" : "Nueva clase"}
        back={id ? `/clases/${id}` : "/clases"}
      />
      <Form
        kind="clases"
        initial={initial}
        value={value}
        destination={id ? `/clases/${id}` : "/clases"}
      >
        <Panel title="El encuentro">
          <Input
            label="Tema de la clase"
            required
            autoFocus
            placeholder="Ej. Confianza en movimiento"
            value={value.tema}
            onChange={(e) => update({ tema: e.target.value })}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Fecha"
              type="date"
              required
              value={value.fecha}
              onChange={(e) => update({ fecha: e.target.value })}
            />
            <Input
              label="Hora"
              type="time"
              required
              value={value.hora}
              onChange={(e) => update({ hora: e.target.value })}
            />
          </div>
          <Select
            label="Servicio de la clase"
            value={value.servicioId || ""}
            onChange={(e) => selectLinks(e.target.value || undefined)}
          >
            <option value="">Clase independiente</option>
            {data.servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </Select>
          {value.servicioId && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Proceso de coreografía"
                value={value.carpetaId || ""}
                onChange={(e) =>
                  selectLinks(
                    value.servicioId,
                    e.target.value || undefined,
                    value.cicloId,
                  )
                }
              >
                <option value="">Sin proceso</option>
                {data.carpetas
                  .filter((c) => c.servicioId === value.servicioId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </Select>
              <Select
                label="Ciclo mensual"
                value={value.cicloId || ""}
                onChange={(e) =>
                  selectLinks(
                    value.servicioId,
                    value.carpetaId,
                    e.target.value || undefined,
                  )
                }
              >
                <option value="">Sin ciclo</option>
                {data.ciclos
                  .filter((c) => c.servicioId === value.servicioId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </Select>
            </div>
          )}
          <p className="text-muted text-sm mb-4">
            Una clase sin proceso ni ciclo aparece en Clases libres.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Canción"
              value={value.cancion}
              onChange={(e) => update({ cancion: e.target.value })}
            />
            <Input
              label="Género / estilo"
              value={value.genero}
              onChange={(e) => update({ genero: e.target.value })}
            />
            <Input
              label="Profesor"
              value={value.profesor}
              onChange={(e) => update({ profesor: e.target.value })}
            />
            <Select
              label="Tipo de clase"
              value={value.tag}
              onChange={(e) => update({ tag: e.target.value as Tag })}
            >
              {["regular", "practica", "grabacion", "cierre", "libre"].map(
                (tag) => (
                  <option key={tag} value={tag}>
                    {
                      {
                        regular: "Regular",
                        practica: "Práctica",
                        grabacion: "Grabación",
                        cierre: "Cierre",
                        libre: "Libre",
                      }[tag]
                    }
                  </option>
                ),
              )}
            </Select>
          </div>
        </Panel>
        <Panel title="La preparación">
          <ListEditor
            label="Calentamiento (uno por línea)"
            value={value.calentamiento}
            onChange={(calentamiento) => update({ calentamiento })}
            placeholder="Movilidad articular\nActivación corporal"
          />
          <ListEditor
            label="Dinámicas (una por línea)"
            value={value.dinamicas}
            onChange={(dinamicas) => update({ dinamicas })}
          />
          <Textarea
            label="Notas de clase"
            value={value.notas}
            onChange={(e) => update({ notas: e.target.value })}
          />
        </Panel>
        <ItineraryEditor
          value={value.itinerario}
          onChange={(itinerario) => update({ itinerario })}
        />
        <Panel title="Asistencia">
          <p className="text-muted text-sm mb-4">
            Marca quién estuvo presente. El resumen del ciclo cuenta solo las
            clases dadas.
          </p>
          {value.alumnas.map((a, i) => (
            <div className="attendance-edit" key={a.id}>
              <input
                type="checkbox"
                aria-label={`Presente ${a.nombre || `alumna ${i + 1}`}`}
                checked={a.presente}
                onChange={(e) =>
                  update({
                    alumnas: value.alumnas.map((student) =>
                      student.id === a.id
                        ? { ...student, presente: e.target.checked }
                        : student,
                    ),
                  })
                }
              />
              <div className="flex-1">
                <Input
                  label={`Alumna de clase ${i + 1}`}
                  required
                  value={a.nombre}
                  onChange={(e) =>
                    update({
                      alumnas: value.alumnas.map((student) =>
                        student.id === a.id
                          ? { ...student, nombre: e.target.value }
                          : student,
                      ),
                    })
                  }
                />
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Quitar alumna ${i + 1}`}
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
          ))}
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() =>
              update({
                alumnas: [
                  ...value.alumnas,
                  { id: crypto.randomUUID(), nombre: "", presente: false },
                ],
              })
            }
          >
            <Plus size={16} />
            Agregar alumna a esta clase
          </button>
        </Panel>
        <Panel title="También cuida de ti">
          <Select
            label="Tu energía (1–5)"
            value={value.energia ?? ""}
            onChange={(e) =>
              update({
                energia: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Sin registrar</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} · {["Muy baja", "Baja", "Media", "Alta", "Muy alta"][n - 1]}
              </option>
            ))}
          </Select>
          <div className="grid sm:grid-cols-2 gap-4">
            {(["antes", "despues"] as const).map((when) => (
              <div key={when}>
                <Select
                  label={when === "antes" ? "Cómo llegas" : "Cómo te vas"}
                  value={value.trackerEmocional[when].emocion}
                  onChange={(e) =>
                    update({
                      trackerEmocional: {
                        ...value.trackerEmocional,
                        [when]: {
                          ...value.trackerEmocional[when],
                          emocion: e.target.value,
                        },
                      },
                    })
                  }
                >
                  <option value="">Sin registrar</option>
                  {moods.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
                <Textarea
                  label={
                    when === "antes"
                      ? "Nota antes de clase"
                      : "Nota después de clase"
                  }
                  value={value.trackerEmocional[when].nota}
                  onChange={(e) =>
                    update({
                      trackerEmocional: {
                        ...value.trackerEmocional,
                        [when]: {
                          ...value.trackerEmocional[when],
                          nota: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            ))}
          </div>
          <Textarea
            label="Notas del profesor"
            value={value.notasProfesor}
            onChange={(e) => update({ notasProfesor: e.target.value })}
          />
          <label className="check-row">
            <input
              type="checkbox"
              checked={value.realizada}
              onChange={(e) => update({ realizada: e.target.checked })}
            />
            Clase realizada
          </label>
        </Panel>
      </Form>
    </>
  );
}

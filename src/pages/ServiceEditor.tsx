import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useData } from "../data";
import { newService, type Seguimiento } from "../models";
import { Form } from "../components/Form";
import { ItineraryEditor } from "../components/editors";
import {
  ColorPicker,
  Input,
  PageTitle,
  Panel,
  Select,
  Textarea,
} from "../components/ui";
import { Missing } from "./details";
export function ServiceEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { data } = useData();
  const [initial] = useState(() =>
    id
      ? data.servicios.find((s) => s.id === id)
      : {
          ...newService(),
          tipoSeguimiento:
            params.get("seguimiento") === "proceso"
              ? ("proceso" as const)
              : ("ninguno" as const),
        },
  );
  const [value, setValue] = useState(initial);
  if (!value || !initial) return <Missing />;
  const update = (patch: Partial<typeof value>) =>
    setValue({ ...value, ...patch });
  return (
    <>
      <PageTitle
        eyebrow="EXPERIENCIAS CON TU SELLO"
        title={id ? "Editar servicio" : "Nuevo servicio"}
        back={id ? `/servicios/${id}` : "/servicios"}
      />
      <Form
        kind="servicios"
        value={value}
        initial={initial}
        destination={id ? `/servicios/${id}` : "/servicios"}
      >
        <Panel title="La experiencia">
          <Input
            label="Nombre del servicio"
            required
            autoFocus
            maxLength={120}
            placeholder="Ej. Heels · Programa mensual"
            value={value.nombre}
            onChange={(e) => update({ nombre: e.target.value })}
          />
          <Textarea
            label="Descripción"
            placeholder="¿Qué hace especial esta experiencia?"
            value={value.descripcion}
            onChange={(e) => update({ descripcion: e.target.value })}
          />
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Duración (min)"
              type="number"
              min={1}
              required
              value={value.duracion}
              onChange={(e) =>
                update({
                  duracion: Number(e.target.value),
                  itinerarioPlantilla: {
                    ...value.itinerarioPlantilla,
                    dur: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Capacidad"
              type="number"
              min={1}
              step={1}
              required
              value={value.capacidad}
              onChange={(e) => update({ capacidad: Number(e.target.value) })}
            />
            <Input
              label="Precio (S/)"
              type="number"
              min={0}
              step="0.01"
              required
              value={value.precio}
              onChange={(e) => update({ precio: Number(e.target.value) })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Emoji"
              maxLength={12}
              value={value.emoji}
              onChange={(e) => update({ emoji: e.target.value })}
            />
            <ColorPicker
              value={value.color}
              onChange={(color) => update({ color })}
            />
          </div>
          <Select
            label="Tipo de seguimiento"
            value={value.tipoSeguimiento}
            onChange={(e) =>
              update({ tipoSeguimiento: e.target.value as Seguimiento })
            }
          >
            <option value="ninguno">Ninguno</option>
            <option value="por_clase">Por clase</option>
            <option value="proceso">Proceso</option>
          </Select>
          <p className="text-muted text-sm">
            El seguimiento de proceso permite crear carpetas de coreografía y
            ciclos mensuales.
          </p>
        </Panel>
        <Panel title="Tu intención">
          <Textarea
            label="Objetivos típicos"
            value={value.objetivosTipicos}
            onChange={(e) => update({ objetivosTipicos: e.target.value })}
          />
          <Textarea
            label="Notas internas"
            value={value.notasInternas}
            onChange={(e) => update({ notasInternas: e.target.value })}
          />
        </Panel>
        <ItineraryEditor
          value={value.itinerarioPlantilla}
          onChange={(itinerarioPlantilla) =>
            update({ itinerarioPlantilla, duracion: itinerarioPlantilla.dur })
          }
        />
      </Form>
    </>
  );
}

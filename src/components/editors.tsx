import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { COLORS, type Itinerario } from "../models";
import { sumMinutes } from "../domain";
import { ColorPicker, Input, Panel, Textarea } from "./ui";
export function ItineraryEditor({
  value,
  onChange,
}: {
  value: Itinerario;
  onChange: (value: Itinerario) => void;
}) {
  const total = sumMinutes(value);
  function update(
    index: number,
    patch: Partial<Itinerario["bloques"][number]>,
  ) {
    onChange({
      ...value,
      bloques: value.bloques.map((b, i) =>
        i === index ? { ...b, ...patch } : b,
      ),
    });
  }
  function move(index: number, direction: number) {
    const blocks = [...value.bloques];
    [blocks[index], blocks[index + direction]] = [
      blocks[index + direction],
      blocks[index],
    ];
    onChange({ ...value, bloques: blocks });
  }
  return (
    <Panel title="Itinerario de clase">
      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Input
          label="Duración total (min)"
          type="number"
          min={1}
          required
          value={value.dur}
          onChange={(e) => onChange({ ...value, dur: Number(e.target.value) })}
        />
        <p
          className={`text-sm mb-3 ${total > value.dur ? "text-pink" : "text-muted"}`}
        >
          {total} de {value.dur} min planificados ·{" "}
          {Math.max(0, value.dur - total)} min libres
        </p>
      </div>
      <div className="itinerary-bar mt-4 mb-5" aria-hidden="true">
        {value.bloques.map((b) => (
          <span
            key={b.id}
            style={{
              width: `${Math.min(100, (b.minutos / value.dur) * 100)}%`,
              background: b.color,
            }}
          />
        ))}
      </div>
      {value.bloques.map((b, index) => (
        <div key={b.id} className="block-editor">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted text-xs uppercase tracking-widest">
              Bloque {index + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                className="icon-btn"
                aria-label={`Subir bloque ${index + 1}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Bajar bloque ${index + 1}`}
                disabled={index === value.bloques.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Eliminar bloque ${index + 1}`}
                onClick={() =>
                  onChange({
                    ...value,
                    bloques: value.bloques.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <Input
              label={`Nombre del bloque ${index + 1}`}
              required
              value={b.nombre}
              onChange={(e) => update(index, { nombre: e.target.value })}
            />
            <Input
              label="Minutos"
              type="number"
              min={1}
              required
              value={b.minutos}
              onChange={(e) =>
                update(index, { minutos: Number(e.target.value) })
              }
            />
          </div>
          <ColorPicker
            label={`Color del bloque ${index + 1}`}
            value={b.color}
            onChange={(color) => update(index, { color })}
          />
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary mt-2"
        onClick={() =>
          onChange({
            ...value,
            bloques: [
              ...value.bloques,
              {
                id: crypto.randomUUID(),
                nombre: "",
                minutos: 10,
                color: COLORS[value.bloques.length % COLORS.length],
              },
            ],
          })
        }
      >
        <Plus size={16} />
        Agregar bloque
      </button>
    </Panel>
  );
}
export function ListEditor({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  return (
    <Textarea
      label={label}
      placeholder={placeholder}
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
    />
  );
}

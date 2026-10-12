import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { Check, LoaderCircle } from "lucide-react";
import { useData } from "../data";
import type { CollectionName, Records } from "../models";
import { ErrorMessage, Modal } from "./ui";
export function Form<K extends CollectionName>({
  kind,
  value,
  initial,
  destination,
  children,
}: {
  kind: K;
  value: Records[K];
  initial: Records[K];
  destination: string;
  children: ReactNode;
}) {
  const store = useData();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const committed = useRef(false);
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !committed.current &&
      dirty &&
      currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (!committed.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const signout = (event: Event) => {
      if (
        !committed.current &&
        !window.confirm(
          "Tienes cambios sin guardar. ¿Cerrar sesión y descartarlos?",
        )
      )
        event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    window.addEventListener("danzario:before-signout", signout);
    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("danzario:before-signout", signout);
    };
  }, [dirty]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await store.save(kind, value);
      committed.current = true;
      store.notify("Cambios guardados");
      navigate(destination);
    } catch (e) {
      setError(
        e instanceof Error && !e.message.startsWith("Firebase:")
          ? e.message
          : "No pudimos guardar. Revisa tu conexión y vuelve a intentarlo. Tus cambios siguen aquí.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <form onSubmit={submit} className="form-layout">
        <fieldset disabled={saving} className="contents">
          {children}
          <div className="save-bar">
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(destination)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Check size={17} />
                )}{" "}
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </fieldset>
      </form>
      {blocker.state === "blocked" && (
        <Modal
          title="Tienes cambios sin guardar"
          onClose={() => blocker.reset()}
        >
          <p className="text-muted my-4">
            Puedes seguir editando o salir y descartar estos cambios.
          </p>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={() => blocker.reset()}>
              Seguir editando
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => blocker.proceed()}
            >
              Descartar y salir
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

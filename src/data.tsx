import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  emptyData,
  type CollectionName,
  type Data,
  type Records,
} from "./models";
import { names, remove, save, subscribe } from "./repository";
interface Store {
  data: Data;
  loading: boolean;
  error: string;
  retry: () => void;
  save: <K extends CollectionName>(kind: K, value: Records[K]) => Promise<void>;
  remove: (kind: CollectionName, id: string) => Promise<void>;
  notice: string;
  notify: (message: string) => void;
}
const Context = createContext<Store | null>(null);
export function DataProvider({
  uid,
  children,
}: {
  uid: string;
  children: ReactNode;
}) {
  const [data, setData] = useState<Data>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const pending = new Set(names);
    const unsubscribers = names.map((kind) =>
      subscribe(
        uid,
        kind,
        (items) => {
          setData((prev) => ({ ...prev, [kind]: items }));
          pending.delete(kind);
          if (!pending.size) setLoading(false);
        },
        () => {
          setError(
            "No pudimos cargar tus datos. Revisa tu conexión y los permisos de Firebase.",
          );
          setLoading(false);
        },
      ),
    );
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [uid, attempt]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  return (
    <Context.Provider
      value={{
        data,
        loading,
        error,
        retry: () => {
          setLoading(true);
          setError("");
          setAttempt((a) => a + 1);
        },
        save: (kind, value) => save(uid, kind, value, data),
        remove: (kind, id) => remove(uid, kind, id),
        notice,
        notify: setNotice,
      }}
    >
      {children}
    </Context.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const store = useContext(Context);
  if (!store) throw new Error("DataProvider required");
  return store;
}

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  emptyData,
  type CollectionName,
  type Data,
  type Records,
} from "./models";
import { deletionReason, validate } from "./domain";
export const names: CollectionName[] = [
  "servicios",
  "carpetas",
  "ciclos",
  "clases",
];
function database() {
  if (!db) throw new Error("Firebase no está configurado.");
  return db;
}
function ref(uid: string, kind: CollectionName) {
  return collection(database(), "users", uid, kind);
}
export function subscribe<K extends CollectionName>(
  uid: string,
  kind: K,
  update: (items: Records[K][]) => void,
  error: (e: Error) => void,
) {
  return onSnapshot(
    ref(uid, kind),
    (snapshot) =>
      update(
        snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Records[K]),
      ),
    error,
  );
}
export async function save<K extends CollectionName>(
  uid: string,
  kind: K,
  value: Records[K],
  data: Data,
) {
  if (!navigator.onLine)
    throw new Error(
      "Necesitas conexión para guardar. Tus cambios siguen en el formulario.",
    );
  const message = validate(kind, value, data);
  if (message) throw new Error(message);
  const clean = JSON.parse(JSON.stringify({ ...value, updatedAt: Date.now() }));
  // Attendance summaries are computed from classes, never persisted on the cycle.
  if (kind === "ciclos")
    clean.alumnas = (value as Records["ciclos"]).alumnas.map((student) => ({
      ...student,
      asistencia: {},
    }));
  await setDoc(doc(ref(uid, kind), value.id), clean);
}
export async function remove(uid: string, kind: CollectionName, id: string) {
  if (!navigator.onLine) throw new Error("Necesitas conexión para eliminar.");
  const latest = emptyData();
  await Promise.all(
    names.map(async (name) => {
      const snapshot = await getDocs(ref(uid, name));
      (latest[name] as Records[CollectionName][]) = snapshot.docs.map(
        (d) => ({ ...d.data(), id: d.id }) as Records[CollectionName],
      );
    }),
  );
  const reason = deletionReason(kind, id, latest);
  if (reason) throw new Error(reason);
  await deleteDoc(doc(ref(uid, kind), id));
}

import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { newCarpeta, newCiclo, newClase, newService } from "../src/models";
let env: RulesTestEnvironment;
const service = {
  ...newService(),
  id: "service",
  nombre: "Heels",
  tipoSeguimiento: "proceso" as const,
};
beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-danzario",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
});
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(
      doc(ctx.firestore(), "users/alice/servicios/service"),
      service,
    );
  });
});
afterAll(async () => {
  await env?.cleanup();
});
describe("teacher ownership and schema rules", () => {
  it("allows an owner to create, read, edit and delete a service", async () => {
    const db = env.authenticatedContext("alice").firestore();
    const ref = doc(db, "users/alice/servicios/service");
    await assertSucceeds(getDoc(ref));
    await assertSucceeds(setDoc(ref, { ...service, nombre: "Heels avanzado" }));
    await assertSucceeds(getDocs(collection(db, "users/alice/servicios")));
    await assertSucceeds(deleteDoc(ref));
  });
  it("denies anonymous reads and writes", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "users/alice/servicios/service")));
    await assertFails(
      setDoc(doc(db, "users/alice/servicios/service"), service),
    );
  });
  it("denies another teacher read, list, update and delete", async () => {
    const db = env.authenticatedContext("bob").firestore();
    const ref = doc(db, "users/alice/servicios/service");
    await assertFails(getDoc(ref));
    await assertFails(getDocs(collection(db, "users/alice/servicios")));
    await assertFails(setDoc(ref, service));
    await assertFails(deleteDoc(ref));
  });
  it("denies unsupported collections", async () => {
    const db = env.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(db, "users/alice/admin/root"), { role: "admin" }),
    );
  });
  it("rejects invalid scalar types and changing createdAt", async () => {
    const db = env.authenticatedContext("alice").firestore();
    const ref = doc(db, "users/alice/servicios/service");
    await assertFails(setDoc(ref, { ...service, precio: "free" }));
    await assertFails(setDoc(ref, { ...service, capacidad: -1 }));
    await assertFails(setDoc(ref, { ...service, tipoSeguimiento: "invalid" }));
    await assertFails(setDoc(ref, { ...service, createdAt: 5 }));
    await assertFails(setDoc(ref, { ...service, id: "wrong-id" }));
  });
  it("allows valid cycles and folders linked to an owned process service", async () => {
    const db = env.authenticatedContext("alice").firestore();
    const ciclo = { ...newCiclo(service), nombre: "Mayo" };
    const carpeta = { ...newCarpeta(service.id), nombre: "Intro" };
    await assertSucceeds(
      setDoc(doc(db, `users/alice/ciclos/${ciclo.id}`), ciclo),
    );
    await assertSucceeds(
      setDoc(doc(db, `users/alice/carpetas/${carpeta.id}`), carpeta),
    );
  });
  it("rejects nonexistent and foreign parent services", async () => {
    const db = env.authenticatedContext("bob").firestore();
    const ciclo = { ...newCiclo(service), nombre: "Mayo" };
    await assertFails(setDoc(doc(db, `users/bob/ciclos/${ciclo.id}`), ciclo));
  });
  it("rejects folders under a service without process tracking", async () => {
    const db = env.authenticatedContext("alice").firestore();
    await setDoc(doc(db, "users/alice/servicios/service"), {
      ...service,
      tipoSeguimiento: "ninguno",
    });
    const carpeta = { ...newCarpeta(service.id), nombre: "Intro" };
    await assertFails(
      setDoc(doc(db, `users/alice/carpetas/${carpeta.id}`), carpeta),
    );
  });
  it("accepts free classes and rejects cross-service cycle links", async () => {
    const db = env.authenticatedContext("alice").firestore();
    const ciclo = { ...newCiclo(service), nombre: "Mayo" };
    await setDoc(doc(db, `users/alice/ciclos/${ciclo.id}`), ciclo);
    const other = { ...service, id: "other" };
    await setDoc(doc(db, "users/alice/servicios/other"), other);
    const c = { ...newClase(), tema: "Clase" };
    const ref = doc(db, `users/alice/clases/${c.id}`);
    await assertSucceeds(setDoc(ref, c));
    await assertFails(
      setDoc(ref, { ...c, servicioId: "other", cicloId: ciclo.id }),
    );
    await assertSucceeds(
      setDoc(ref, { ...c, servicioId: service.id, cicloId: ciclo.id }),
    );
  });
  it("rejects malformed completion and energy", async () => {
    const db = env.authenticatedContext("alice").firestore();
    const c = { ...newClase(), tema: "Clase" };
    const ref = doc(db, `users/alice/clases/${c.id}`);
    await assertFails(setDoc(ref, { ...c, realizada: "yes" }));
    await assertFails(setDoc(ref, { ...c, energia: 6 }));
    await assertFails(setDoc(ref, { ...c, hora: "26:00" }));
  });
});

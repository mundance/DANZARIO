import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, emulator } from "./firebase";
interface Session {
  user: User | null;
  loading: boolean;
  error: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}
const Context = createContext<Session | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!auth);
  const [error, setError] = useState("");
  useEffect(
    () =>
      auth
        ? onAuthStateChanged(
            auth,
            (user) => {
              setUser(user);
              setLoading(false);
            },
            () => {
              setLoading(false);
              setError("No pudimos recuperar tu sesión. Intenta de nuevo.");
            },
          )
        : undefined,
    [],
  );
  async function login() {
    if (!auth) return;
    setError("");
    try {
      if (emulator) await signInAnonymously(auth);
      else await signInWithPopup(auth, new GoogleAuthProvider());
    } catch {
      setError(
        "No pudimos iniciar sesión. Permite la ventana de Google e intenta de nuevo.",
      );
    }
  }
  async function logout() {
    if (
      !window.dispatchEvent(
        new Event("danzario:before-signout", { cancelable: true }),
      )
    )
      return;
    if (auth) {
      setError("");
      try {
        await signOut(auth);
      } catch {
        setError("No pudimos cerrar la sesión. Intenta de nuevo.");
      }
    }
  }
  return (
    <Context.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </Context.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const session = useContext(Context);
  if (!session) throw new Error("AuthProvider required");
  return session;
}

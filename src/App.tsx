import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Home as HomeIcon,
  Layers3,
  LogOut,
  Menu,
  Music2,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import {
  createBrowserRouter,
  Link,
  NavLink,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./auth";
import { DataProvider, useData } from "./data";
import { emulator, missingConfig } from "./firebase";
import { Home } from "./pages/Home";
import { Lists } from "./pages/Lists";
import { ServiceEditor } from "./pages/ServiceEditor";
import { CarpetaEditor, CicloEditor } from "./pages/ProcessEditor";
import { ClassEditor } from "./pages/ClassEditor";
import {
  CarpetaDetail,
  CicloDetail,
  ClaseDetail,
  Missing,
  ServiceDetail,
} from "./pages/details";
import { ErrorMessage } from "./components/ui";
const nav = [
  { to: "/", name: "Inicio", icon: HomeIcon },
  { to: "/servicios", name: "Servicios", icon: Waves },
  { to: "/carpetas", name: "Procesos", icon: Layers3 },
  { to: "/clases", name: "Clases", icon: CalendarDays },
];
function Brand() {
  return (
    <Link to="/" className="brand" aria-label="Danzario inicio">
      <span className="brand-symbol">
        d<span>✦</span>
      </span>
      <span>
        DANZARIO<span className="brand-sub">TU DANZA, CON INTENCIÓN</span>
      </span>
    </Link>
  );
}
function Login() {
  const { login, error } = useAuth();
  const [busy, setBusy] = useState(false);
  return (
    <div className="login-page">
      <div className="login-orb" />
      <div className="login-card">
        <Brand />
        <p className="eyebrow mt-12">
          PARA QUIENES ENSEÑAN CON EL CUERPO Y EL CORAZÓN
        </p>
        <h1 className="login-title">
          TU PRÓXIMA
          <br />
          GRAN CLASE
          <br />
          <span>EMPIEZA AQUÍ.</span>
        </h1>
        <p className="text-muted text-lg my-6">
          Planea tus encuentros, acompaña a tus alumnas y deja espacio para ti.
        </p>
        <div className="flex gap-3 flex-wrap mb-8">
          <span className="badge">
            <Music2 size={14} />
            Coreografías
          </span>
          <span className="badge">
            <CalendarDays size={14} />
            Clases
          </span>
          <span className="badge">
            <Sparkles size={14} />
            Intención
          </span>
        </div>
        {missingConfig.length ? (
          <div className="setup-notice">
            <h2>Tu espacio está casi listo</h2>
            <p className="my-3 text-muted">
              Falta conectar Firebase para activar el inicio de sesión y guardar
              tus clases.
            </p>
            <details>
              <summary>Configuración pendiente</summary>
              <p className="text-sm mt-3">
                Agrega estas variables en el entorno de la aplicación:
              </p>
              <ul className="text-xs mt-2 space-y-1">
                {missingConfig.map((key) => (
                  <li key={key}>{key}</li>
                ))}
              </ul>
              <p className="text-sm mt-3">
                Consulta los pasos de Firebase y Vercel en el README del
                proyecto.
              </p>
            </details>
          </div>
        ) : (
          <button
            className="btn btn-primary w-full"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await login();
              setBusy(false);
            }}
          >
            {busy
              ? "Conectando…"
              : emulator
                ? "Entrar al entorno de prueba"
                : "Continuar con Google"}
            <ChevronRight size={18} />
          </button>
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <p className="text-muted text-xs mt-6 text-center">
          Un espacio privado. Una intención a la vez.
        </p>
      </div>
      <div className="login-decoration" aria-hidden="true">
        <span>
          MOVE
          <br />
          WITH
          <br />
          <i>MEANING.</i>
        </span>
        <div className="login-rings" />
      </div>
    </div>
  );
}
function Shell() {
  const { user, logout, error: authError } = useAuth();
  const { loading, error, retry, notice } = useData();
  const [menuPath, setMenuPath] = useState("");
  const [offline, setOffline] = useState(!navigator.onLine);
  const location = useLocation();
  const menu = menuPath === location.pathname;
  const setMenu = (open: boolean) => setMenuPath(open ? location.pathname : "");
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const handler = () => setOffline(!navigator.onLine);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    return () => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    };
  }, []);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir al contenido
      </a>
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="flex justify-between items-center">
          <Brand />
          <button
            className="icon-btn lg:hidden"
            aria-label="Cerrar menú"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <p className="nav-label">MI ESPACIO</p>
        <nav aria-label="Navegación principal">
          {nav.map(({ to, name, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              {name}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-quote">
          <Sparkles size={22} />
          <p>
            El movimiento
            <br />
            empieza en ti.
          </p>
          <span>DA ESPACIO A TU INTENCIÓN</span>
        </div>
        <div className="sidebar-account">
          <div className="avatar">{(user?.displayName || "P")[0]}</div>
          <div className="min-w-0 flex-1">
            <strong className="block text-sm truncate">
              {user?.displayName || "Profe"}
            </strong>
            <span className="text-muted text-xs">Tu espacio personal</span>
          </div>
          <button
            className="icon-btn"
            aria-label="Cerrar sesión"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      {menu && (
        <button
          className="sidebar-overlay"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="main-area">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="icon-btn lg:hidden"
              aria-label="Abrir menú"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <span className="topbar-breadcrumb">
              Mi espacio <ChevronRight size={13} />{" "}
              <strong>
                {nav.find(
                  (n) => n.to !== "/" && location.pathname.startsWith(n.to),
                )?.name || "Inicio"}
              </strong>
            </span>
          </div>
          <span className="topbar-right">
            <span className="live-dot" />
            {emulator ? "Entorno de prueba" : "Hecho para tu ritmo"}
          </span>
        </header>
        <main id="main" className="main-content">
          {offline && (
            <p className="offline" role="status">
              Sin conexión. Tus cambios necesitan conexión para guardarse.
            </p>
          )}
          {authError && <ErrorMessage>{authError}</ErrorMessage>}
          {error ? (
            <div className="panel">
              <ErrorMessage>{error}</ErrorMessage>
              <button className="btn btn-secondary mt-4" onClick={retry}>
                Reintentar
              </button>
            </div>
          ) : loading ? (
            <div className="loading" role="status">
              <span className="animate-pulse">✦</span>Cargando tu espacio…
            </div>
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="footer">
          <span>DANZARIO</span>
          <p>Tu danza, con intención.</p>
          <span className="text-muted text-xs">CREADO PARA CREAR</span>
        </footer>
      </div>
      <nav className="mobile-nav" aria-label="Navegación móvil">
        {nav.map(({ to, name, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icon size={20} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
      {notice && (
        <div role="status" className="toast">
          ✓ {notice}
        </div>
      )}
    </div>
  );
}
function Gate() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading" role="status">
        Recuperando tu sesión…
      </div>
    );
  if (!user) return <Login />;
  return (
    <DataProvider key={user.uid} uid={user.uid}>
      <Shell />
    </DataProvider>
  );
}
const router = createBrowserRouter([
  {
    element: <Gate />,
    errorElement: (
      <div className="main-content">
        <Missing />
      </div>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/servicios", element: <Lists kind="servicios" /> },
      { path: "/servicios/nuevo", element: <ServiceEditor /> },
      { path: "/servicios/:id", element: <ServiceDetail /> },
      { path: "/servicios/:id/editar", element: <ServiceEditor /> },
      { path: "/servicios/:servicioId/ciclos/nuevo", element: <CicloEditor /> },
      { path: "/servicios/:servicioId/ciclos/:id", element: <CicloDetail /> },
      {
        path: "/servicios/:servicioId/ciclos/:id/editar",
        element: <CicloEditor />,
      },
      { path: "/carpetas", element: <Lists kind="carpetas" /> },
      { path: "/carpetas/nueva", element: <CarpetaEditor /> },
      { path: "/carpetas/:id", element: <CarpetaDetail /> },
      { path: "/carpetas/:id/editar", element: <CarpetaEditor /> },
      { path: "/clases", element: <Lists kind="clases" /> },
      { path: "/clases/nueva", element: <ClassEditor /> },
      { path: "/clases/:id", element: <ClaseDetail /> },
      { path: "/clases/:id/editar", element: <ClassEditor /> },
      { path: "*", element: <Missing /> },
    ],
  },
]);
export default function App() {
  return <RouterProvider router={router} />;
}

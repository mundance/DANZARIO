import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ArrowLeft, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { COLORS } from "../models";
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
  back,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  back?: string;
}) {
  return (
    <div className="page-title">
      {back && (
        <Link className="back" to={back}>
          <ArrowLeft size={16} /> Volver
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && (
            <p className="text-muted mt-2 max-w-xl">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <small className="text-muted">{hint}</small>}
    </div>
  );
}
export function Input({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
      {hint && <small className="text-muted">{hint}</small>}
    </div>
  );
}
export function Textarea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={3} {...props} />
    </div>
  );
}
export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        {children}
      </select>
    </div>
  );
}
export function ColorPicker({
  value,
  onChange,
  label = "Color",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-3">
        {COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`swatch ${value === color ? "selected" : ""}`}
            aria-label={`${label} ${color}`}
            aria-pressed={value === color}
            style={{ background: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </Field>
  );
}
export function Empty({
  title,
  text,
  to,
  action,
}: {
  title: string;
  text: string;
  to?: string;
  action?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Sparkles size={24} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {to && (
        <Link className="btn btn-primary mt-5" to={to}>
          <Plus size={17} />
          {action || "Crear ahora"}
        </Link>
      )}
    </div>
  );
}
export function Badge({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      className="badge"
      style={color ? { color, background: `${color}18` } : undefined}
    >
      {children}
    </span>
  );
}
export function Section({
  title,
  subtitle,
  to,
  action = "Ver todos",
  children,
}: {
  title: string;
  subtitle?: string;
  to?: string;
  action?: string;
  children: ReactNode;
}) {
  return (
    <section className="home-section">
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
        </div>
        {to && (
          <Link className="section-link" to={to}>
            {action}
            <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && <h2 className="mb-5">{title}</h2>}
      {children}
    </section>
  );
}
export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p className="error" role="alert">
      {children}
    </p>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const id = useId();
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = ref.current;
    if (!root) return;
    const targets = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ),
      );
    (targets()[0] || root).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close.current();
      }
      if (event.key !== "Tab") return;
      const nodes = targets();
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first) {
        event.preventDefault();
        root.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", keydown);
    const scroll = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      root.removeEventListener("keydown", keydown);
      document.body.style.overflow = scroll;
      previous?.focus();
    };
  }, []);
  return (
    <div className="modal-backdrop">
      <section
        ref={ref}
        className="modal"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
      >
        <h2 id={id}>{title}</h2>
        {children}
      </section>
    </div>
  );
}

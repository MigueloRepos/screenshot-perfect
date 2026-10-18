import { useState } from "react";
import { LogIn, UserPlus, X, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "usuario">("admin");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              role: role,
            },
          },
        });

        if (error) {
          toast.error("Error al registrarse", { description: error.message });
          return;
        }

        if (data.session) {
          toast.success("¡Cuenta creada e inicio de sesión exitoso!");
          onSuccess();
          onClose();
        } else {
          toast.success("Cuenta creada", {
            description: "Revisa tu correo para confirmar la cuenta o inicia sesión.",
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          toast.error("Error al iniciar sesión", { description: error.message });
          return;
        }

        toast.success("¡Bienvenido al panel!");
        onSuccess();
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocurrió un error inesperado";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={isSignUp ? "Crear cuenta" : "Iniciar sesión"}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm p-4 md:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-rise relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {isSignUp ? <UserPlus className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isSignUp ? "Crear cuenta en Supabase" : "Iniciar sesión"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Accede al dashboard de administración de Caram & Maranatha
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@carammara.com"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" /> Rol asignado
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "usuario")}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="admin">Administrador (rol admin)</option>
                <option value="usuario">Usuario estándar</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSignUp ? "Registrarse" : "Entrar al Dashboard"}
          </button>
        </form>

        <div className="mt-5 border-t border-border pt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-primary hover:underline"
          >
            {isSignUp
              ? "¿Ya tienes cuenta? Inicia sesión aquí"
              : "¿No tienes cuenta? Regístrate como administrador"}
          </button>
        </div>
      </div>
    </div>
  );
}

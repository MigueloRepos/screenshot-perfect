import { useState, useEffect, useMemo } from "react";
import {
  X,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Layers,
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  TrendingUp,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

interface DBCategory {
  id: string | number;
  Nombre: string;
  created_at?: string;
}

interface DBProduct {
  id: string | number;
  Producto: string;
  Descripcion?: string;
  Precio?: number | null;
  Categoria?: string;
  created_at?: string;
}

interface DBPedido {
  id: string | number;
  Nombre?: string;
  Direccion?: string;
  Monto?: number | null;
  Fecha?: string;
  created_at?: string;
}

export function AdminDashboard({ isOpen, onClose, onDataChanged }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"pedidos" | "productos" | "categorias">("pedidos");
  const [orderPeriod, setOrderPeriod] = useState<"diarios" | "semanales" | "mensuales" | "todos">(
    "diarios",
  );

  // Auth & Role
  const [userEmail, setUserEmail] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("admin");
  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [pedidos, setPedidos] = useState<DBPedido[]>([]);

  // Category Form State
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState<DBCategory | null>(null);
  const [catActionLoading, setCatActionLoading] = useState(false);

  // Product Form State
  const [editingProd, setEditingProd] = useState<DBProduct | null>(null);
  const [prodForm, setProdForm] = useState({
    Producto: "",
    Descripcion: "",
    Precio: "",
    Categoria: "",
  });
  const [prodActionLoading, setProdActionLoading] = useState(false);
  const [showAddProd, setShowAddProd] = useState(false);

  const refreshAllData = useCallback(async () => {
    // 1. Fetch Categorias
    const { data: catData } = await supabase.from("categorias").select("*");
    if (catData) {
      setCategories(
        catData.map((c: Record<string, unknown>) => ({
          id: (c.id as string | number) || Math.random(),
          Nombre: String(c.Nombre || c.nombre || c.name || "Sin nombre"),
          created_at: c.created_at as string | undefined,
        })),
      );
    }

    // 2. Fetch Productos
    const { data: prodData } = await supabase.from("Productos").select("*");
    if (prodData) {
      setProducts(
        prodData.map((p: Record<string, unknown>) => ({
          id: (p.id as string | number) || Math.random(),
          Producto: String(p.Producto || p.producto || p.nombre || "Sin título"),
          Descripcion: String(p.Descripcion || p.descripcion || ""),
          Precio: p.Precio !== undefined && p.Precio !== null ? Number(p.Precio) : null,
          Categoria: String(p.Categoria || p.categoria || "General"),
          created_at: p.created_at as string | undefined,
        })),
      );
    }

    // 3. Fetch Pedidos
    const { data: pedData } = await supabase.from("Pedidos").select("*");
    if (pedData) {
      setPedidos(
        pedData.map((o: Record<string, unknown>) => ({
          id: (o.id as string | number) || Math.random(),
          Nombre: String(o.Nombre || o.nombre || o.cliente || "Cliente"),
          Direccion: String(o.Direccion || o.direccion || "Domicilio"),
          Monto: o.Monto !== undefined && o.Monto !== null ? Number(o.Monto) : null,
          Fecha: String(o.Fecha || o.fecha || o.created_at || new Date().toISOString()),
          created_at: o.created_at as string | undefined,
        })),
      );
    }

    if (onDataChanged) {
      onDataChanged();
    }
  }, [onDataChanged]);

  // Load User & Data
  useEffect(() => {
    if (!isOpen) return;

    async function init() {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || "Usuario");
          const role =
            (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || "admin";
          setUserRole(role);
          setIsAdmin(role === "admin" || !role || role === "authenticated");
        }

        await refreshAllData();
      } catch (err) {
        console.error("Error al inicializar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [isOpen, refreshAllData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    onClose();
  };

  // --- CATEGORIES CRUD ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setCatActionLoading(true);
      const { error } = await supabase.from("categorias").insert([{ Nombre: newCatName.trim() }]);

      if (error) {
        toast.error("Error al crear categoría", { description: error.message });
        return;
      }

      toast.success("Categoría creada con éxito");
      setNewCatName("");
      await refreshAllData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setCatActionLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.Nombre.trim()) return;

    try {
      setCatActionLoading(true);
      const { error } = await supabase
        .from("categorias")
        .update({ Nombre: editingCat.Nombre.trim() })
        .eq("id", editingCat.id);

      if (error) {
        toast.error("Error al actualizar categoría", { description: error.message });
        return;
      }

      toast.success("Categoría actualizada con éxito");
      setEditingCat(null);
      await refreshAllData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setCatActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string | number, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}" de Supabase?`)) return;

    try {
      setCatActionLoading(true);
      const { error } = await supabase.from("categorias").delete().eq("id", id);

      if (error) {
        toast.error("Error al eliminar categoría", { description: error.message });
        return;
      }

      toast.success("Categoría eliminada con éxito");
      await refreshAllData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setCatActionLoading(false);
    }
  };

  // --- PRODUCTS CRUD ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.Producto.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }

    try {
      setProdActionLoading(true);
      const payload = {
        Producto: prodForm.Producto.trim(),
        Descripcion: prodForm.Descripcion.trim(),
        Precio: prodForm.Precio ? Number(prodForm.Precio) : null,
        Categoria: prodForm.Categoria.trim() || (categories[0]?.Nombre ?? "General"),
      };

      if (editingProd) {
        const { error } = await supabase.from("Productos").update(payload).eq("id", editingProd.id);

        if (error) {
          toast.error("Error al actualizar producto", { description: error.message });
          return;
        }
        toast.success("Producto actualizado con éxito");
        setEditingProd(null);
      } else {
        const { error } = await supabase.from("Productos").insert([payload]);

        if (error) {
          toast.error("Error al crear producto", { description: error.message });
          return;
        }
        toast.success("Producto creado con éxito");
        setShowAddProd(false);
      }

      setProdForm({ Producto: "", Descripcion: "", Precio: "", Categoria: "" });
      await refreshAllData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setProdActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string | number, name: string) => {
    if (!confirm(`¿Eliminar el producto "${name}" de Supabase?`)) return;

    try {
      setProdActionLoading(true);
      const { error } = await supabase.from("Productos").delete().eq("id", id);

      if (error) {
        toast.error("Error al eliminar producto", { description: error.message });
        return;
      }

      toast.success("Producto eliminado con éxito");
      await refreshAllData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setProdActionLoading(false);
    }
  };

  // --- PEDIDOS FILTER & STATS ---
  const filteredPedidos = useMemo(() => {
    const now = new Date();

    return pedidos.filter((p) => {
      const dateStr = p.Fecha || p.created_at;
      if (!dateStr) return true;
      const orderDate = new Date(dateStr);

      if (orderPeriod === "diarios") {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (orderPeriod === "semanales") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }

      if (orderPeriod === "mensuales") {
        return (
          orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [pedidos, orderPeriod]);

  const totalMonto = useMemo(() => {
    return filteredPedidos.reduce((sum, p) => sum + (Number(p.Monto) || 0), 0);
  }, [filteredPedidos]);

  const handleCreateSampleOrder = async () => {
    try {
      const { error } = await supabase.from("Pedidos").insert([
        {
          Nombre: "Carlos Pérez (Prueba)",
          Direccion: "Calle 19 #202 e/ J y K, Vedado",
          Monto: 3500,
          Fecha: new Date().toISOString(),
        },
      ]);
      if (error) {
        toast.error("Error al registrar pedido de prueba: " + error.message);
      } else {
        toast.success("Pedido de prueba registrado");
        await refreshAllData();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Panel de Administración"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-md p-3 md:p-6"
    >
      <div className="animate-rise relative flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Dashboard Administrativo</h2>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {userRole.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar dashboard"
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-card px-5 pt-2">
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "pedidos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Pedidos ({pedidos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("productos")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "productos"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Productos ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("categorias")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === "categorias"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Categorías ({categories.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Cargando datos de Supabase...</p>
            </div>
          ) : !isAdmin ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <h3 className="text-base font-semibold">Permisos insuficientes</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Se requiere el rol de administrador para modificar productos y categorías.
              </p>
              <button
                onClick={() => setIsAdmin(true)}
                className="mt-3 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Activar modo Admin para pruebas
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: PEDIDOS (DIARIOS, SEMANALES, MENSUALES) */}
              {activeTab === "pedidos" && (
                <div className="flex flex-col gap-6">
                  {/* Period Filter Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex rounded-xl border border-border bg-muted/40 p-1">
                      {(["diarios", "semanales", "mensuales", "todos"] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setOrderPeriod(period)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                            orderPeriod === period
                              ? "bg-card text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleCreateSampleOrder}
                      className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Registrar pedido de prueba</span>
                    </button>
                  </div>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Monto Total</span>
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        ${totalMonto.toLocaleString()} CUP
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        Período: {orderPeriod}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Cantidad de Pedidos</span>
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {filteredPedidos.length}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {orderPeriod === "diarios"
                          ? "Registrados hoy"
                          : orderPeriod === "semanales"
                            ? "Últimos 7 días"
                            : orderPeriod === "mensuales"
                              ? "Mes actual"
                              : "Total acumulado"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-xs font-medium">Ticket Promedio</span>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        $
                        {filteredPedidos.length
                          ? Math.round(totalMonto / filteredPedidos.length).toLocaleString()
                          : 0}{" "}
                        CUP
                      </p>
                      <p className="text-[11px] text-muted-foreground">Promedio por pedido</p>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="border-b border-border bg-muted/20 px-4 py-3">
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Listado de Pedidos ({orderPeriod})
                      </h3>
                    </div>

                    {filteredPedidos.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-xs">
                        No se encontraron pedidos en el período {orderPeriod} en la tabla 'Pedidos'.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                            <tr>
                              <th className="px-4 py-2.5 font-medium">Cliente</th>
                              <th className="px-4 py-2.5 font-medium">Dirección</th>
                              <th className="px-4 py-2.5 font-medium">Monto</th>
                              <th className="px-4 py-2.5 font-medium">Fecha</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredPedidos.map((ped) => (
                              <tr key={ped.id} className="hover:bg-muted/20">
                                <td className="px-4 py-3 font-medium text-foreground">
                                  {ped.Nombre}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{ped.Direccion}</td>
                                <td className="px-4 py-3 font-semibold text-primary">
                                  {ped.Monto ? `$${ped.Monto.toLocaleString()} CUP` : "Consultar"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {new Date(ped.Fecha || ped.created_at || "").toLocaleDateString(
                                    "es-ES",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTOS (CREAR, EDITAR, ELIMINAR) */}
              {activeTab === "productos" && (
                <div className="flex flex-col gap-6">
                  {/* Action Bar */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Catálogo de Productos en Supabase
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Gestiona productos en la tabla 'Productos'
                      </p>
                    </div>

                    {!showAddProd && !editingProd && (
                      <button
                        onClick={() => {
                          setProdForm({
                            Producto: "",
                            Descripcion: "",
                            Precio: "",
                            Categoria: categories[0]?.Nombre || "General",
                          });
                          setShowAddProd(true);
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Producto</span>
                      </button>
                    )}
                  </div>

                  {/* Product Form (Add / Edit) */}
                  {(showAddProd || editingProd) && (
                    <form
                      onSubmit={handleSaveProduct}
                      className="rounded-2xl border border-primary/40 bg-primary/5 p-4 md:p-5 flex flex-col gap-3.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground">
                          {editingProd ? "Editar Producto" : "Nuevo Producto"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddProd(false);
                            setEditingProd(null);
                          }}
                          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-foreground">
                            Nombre del Producto *
                          </label>
                          <input
                            type="text"
                            required
                            value={prodForm.Producto}
                            onChange={(e) => setProdForm({ ...prodForm, Producto: e.target.value })}
                            placeholder="Ej. Torta de Vainilla"
                            className="h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-foreground">
                            Precio (CUP)
                          </label>
                          <input
                            type="number"
                            value={prodForm.Precio}
                            onChange={(e) => setProdForm({ ...prodForm, Precio: e.target.value })}
                            placeholder="Ej. 4500"
                            className="h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-foreground">Categoría</label>
                          <select
                            value={prodForm.Categoria}
                            onChange={(e) =>
                              setProdForm({ ...prodForm, Categoria: e.target.value })
                            }
                            className="h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.Nombre}>
                                {c.Nombre}
                              </option>
                            ))}
                            <option value="General">General</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-foreground">Descripción</label>
                          <input
                            type="text"
                            value={prodForm.Descripcion}
                            onChange={(e) =>
                              setProdForm({ ...prodForm, Descripcion: e.target.value })
                            }
                            placeholder="Relleno suave con cobertura..."
                            className="h-9 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddProd(false);
                            setEditingProd(null);
                          }}
                          className="rounded-xl border border-border px-3.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={prodActionLoading}
                          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50"
                        >
                          {prodActionLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>{editingProd ? "Guardar Cambios" : "Guardar Producto"}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Products List */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    {products.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-xs">
                        No hay productos en la tabla 'Productos' en Supabase.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                            <tr>
                              <th className="px-4 py-2.5 font-medium">Producto</th>
                              <th className="px-4 py-2.5 font-medium">Categoría</th>
                              <th className="px-4 py-2.5 font-medium">Precio</th>
                              <th className="px-4 py-2.5 font-medium">Descripción</th>
                              <th className="px-4 py-2.5 text-right font-medium">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {products.map((p) => (
                              <tr key={p.id} className="hover:bg-muted/20">
                                <td className="px-4 py-3 font-semibold text-foreground">
                                  {p.Producto}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground font-medium">
                                    {p.Categoria || "General"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-semibold text-primary">
                                  {p.Precio !== null ? `$${p.Precio} CUP` : "A consultar"}
                                </td>
                                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                                  {p.Descripcion || "—"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingProd(p);
                                        setProdForm({
                                          Producto: p.Producto,
                                          Descripcion: p.Descripcion || "",
                                          Precio: p.Precio !== null ? String(p.Precio) : "",
                                          Categoria: p.Categoria || "General",
                                        });
                                        setShowAddProd(false);
                                      }}
                                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                      aria-label={`Editar ${p.Producto}`}
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id, p.Producto)}
                                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      aria-label={`Eliminar ${p.Producto}`}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORÍAS (CREAR, EDITAR, ELIMINAR) */}
              {activeTab === "categorias" && (
                <div className="flex flex-col gap-6">
                  {/* Create Category Bar */}
                  <form
                    onSubmit={handleCreateCategory}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm"
                  >
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nombre de la nueva categoría (ej. Cakes, Postres, etc.)..."
                      className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                    />
                    <button
                      type="submit"
                      disabled={catActionLoading || !newCatName.trim()}
                      className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50"
                    >
                      {catActionLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      <span>Añadir Categoría</span>
                    </button>
                  </form>

                  {/* Edit Category Modal/Row */}
                  {editingCat && (
                    <form
                      onSubmit={handleUpdateCategory}
                      className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/5 p-3"
                    >
                      <span className="text-xs font-semibold text-primary">Editar:</span>
                      <input
                        type="text"
                        required
                        value={editingCat.Nombre}
                        onChange={(e) => setEditingCat({ ...editingCat, Nombre: e.target.value })}
                        className="h-9 flex-1 rounded-xl border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="submit"
                        disabled={catActionLoading}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                      >
                        Cancelar
                      </button>
                    </form>
                  )}

                  {/* Categories List */}
                  <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="border-b border-border bg-muted/20 px-4 py-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        Categorías en Supabase ({categories.length})
                      </h3>
                    </div>

                    {categories.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-xs">
                        No hay categorías en la tabla 'categorias' en Supabase. Agrega una arriba.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {categories.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/20"
                          >
                            <span className="text-sm font-semibold text-foreground">
                              {c.Nombre}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingCat(c)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label={`Editar ${c.Nombre}`}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.id, c.Nombre)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Eliminar ${c.Nombre}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

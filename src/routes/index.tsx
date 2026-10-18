import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ShoppingBag,
  X,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Home,
  LayoutGrid,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import heroImg from "@/assets/hero-cupcake.jpg";
import { CATEGORIES, PRODUCTS, WHATSAPP_NUMBER, type Product } from "@/data/products";
import {
  addToCart,
  buildWhatsAppMessage,
  cartTotal,
  formatCUP,
  hasValidPrice,
  isValidQty,
  whatsappUrl,
  type CartLine,
} from "@/lib/cart";
import { WhatsAppCheckoutButton } from "@/components/whatsapp-checkout-button";
import { supabase } from "@/lib/supabase";
import { AuthModal } from "@/components/auth-modal";
import { AdminDashboard } from "@/components/admin-dashboard";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caram & Maranatha — Repostería artesanal" },
      {
        name: "description",
        content:
          "Cakes, cupcakes, helados, pies y marquesitas. Pide en línea y confirma por WhatsApp.",
      },
      { property: "og:title", content: "Caram & Maranatha — Repostería artesanal" },
      {
        property: "og:description",
        content: "Cakes, cupcakes, helados, pies y marquesitas. Pide en línea por WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CART_KEY = "cm-cart-v1";
const priceLabel = (p: Product) => (hasValidPrice(p) ? formatCUP(p.price) : "Consultar precio");

function openWhatsApp(message: string) {
  const url = whatsappUrl(WHATSAPP_NUMBER, message);
  if (!url) {
    toast.error("WhatsApp no configurado", {
      description:
        "El administrador debe indicar el número en WHATSAPP_NUMBER. El pedido no se ha enviado.",
    });
    return;
  }
  window.open(url, "_blank", "noopener");
}

function Index() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [bump, setBump] = useState(0);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoriesList, setCategoriesList] = useState<string[]>(["Todas"]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function fetchSupabaseCategories() {
      try {
        setLoadingCategories(true);
        const { data, error } = await supabase.from("categorias").select("*");
        if (error) {
          console.error("Error al obtener categorias de Supabase:", error);
        } else if (data && data.length > 0) {
          const names = data
            .map((item: Record<string, unknown>) => {
              const val =
                item["Nombre"] ??
                item["nombre"] ??
                item["name"] ??
                item["categoria"] ??
                item["title"];
              return typeof val === "string" ? val.trim() : "";
            })
            .filter((name: string) => name.length > 0);

          if (names.length > 0) {
            setCategoriesList(["Todas", ...Array.from(new Set(names))]);
          } else {
            setCategoriesList(["Todas"]);
          }
        } else {
          setCategoriesList(["Todas"]);
        }
      } catch (err) {
        console.error("Error al conectar con categorias en Supabase:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchSupabaseCategories();

    const channel = supabase
      .channel("categorias-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "categorias" }, () => {
        fetchSupabaseCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    async function fetchSupabaseProducts() {
      try {
        setLoadingProducts(true);
        const { data, error } = await supabase.from("Productos").select("*");
        if (error) {
          console.error("Error al obtener productos de Supabase:", error);
          setProductsList([]);
        } else if (data && data.length > 0) {
          const mapped: Product[] = data.map((item: Record<string, unknown>) => {
            const idVal =
              item["id"] !== undefined && item["id"] !== null
                ? String(item["id"])
                : String(Math.random());
            const nameVal =
              typeof item["Producto"] === "string" && item["Producto"]
                ? item["Producto"]
                : typeof item["nombre"] === "string" && item["nombre"]
                  ? item["nombre"]
                  : typeof item["name"] === "string" && item["name"]
                    ? item["name"]
                    : "Producto";
            const descVal =
              typeof item["Descripcion"] === "string"
                ? item["Descripcion"]
                : typeof item["descripcion"] === "string"
                  ? item["descripcion"]
                  : "";
            const priceNum =
              item["Precio"] !== null && item["Precio"] !== undefined && item["Precio"] !== ""
                ? Number(item["Precio"])
                : item["precio"] !== null && item["precio"] !== undefined && item["precio"] !== ""
                  ? Number(item["precio"])
                  : null;
            const catVal =
              typeof item["Categoria"] === "string" && item["Categoria"]
                ? item["Categoria"]
                : typeof item["categoria"] === "string" && item["categoria"]
                  ? item["categoria"]
                  : "General";
            const stockNum =
              item["Stock"] !== null && item["Stock"] !== undefined && item["Stock"] !== ""
                ? Number(item["Stock"])
                : item["stock"] !== null && item["stock"] !== undefined && item["stock"] !== ""
                  ? Number(item["stock"])
                  : 10;
            const imgVal =
              typeof item["Imagen"] === "string" && item["Imagen"]
                ? item["Imagen"]
                : typeof item["imagen"] === "string" && item["imagen"]
                  ? item["imagen"]
                  : heroImg;
            const tagVal =
              typeof item["Tag"] === "string"
                ? item["Tag"]
                : typeof item["tag"] === "string"
                  ? item["tag"]
                  : undefined;

            return {
              id: idVal,
              name: nameVal,
              category: catVal as Product["category"],
              description: descVal,
              price: priceNum !== null && !isNaN(priceNum) ? priceNum : null,
              currency: "CUP",
              stock: !isNaN(stockNum) ? stockNum : 10,
              image: imgVal,
              active: true,
              tag: tagVal,
            };
          });
          setProductsList(mapped);
        } else {
          setProductsList([]);
        }
      } catch (err) {
        console.error("Error al conectar con la tabla Productos en Supabase:", err);
        setProductsList([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchSupabaseProducts();

    const channel = supabase
      .channel("productos-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "Productos" }, () => {
        fetchSupabaseProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const catalog = useMemo(() => productsList.filter((p) => p.active), [productsList]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        setCart(
          parsed.filter(
            (l) => catalog.some((p) => p.id === l.id) && Number.isInteger(l.qty) && l.qty > 0,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  }, [catalog]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, mounted]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter(
      (p) =>
        (cat === "Todas" || p.category.toLowerCase() === cat.toLowerCase()) &&
        (!q || p.name.toLowerCase().includes(q)),
    );
  }, [query, cat, catalog]);

  const count = mounted ? cart.reduce((n, l) => n + l.qty, 0) : 0;

  const add = (p: Product, qty: number) => {
    setCart((c) => addToCart(c, p.id, qty, p.stock));
    setBump((b) => b + 1);
    toast.success(`${p.name} añadido al pedido`);
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-background pb-28 md:pb-16">
      <header className="relative h-[228px] overflow-hidden rounded-b-[3rem] md:h-[300px]">
        <img
          src={heroImg}
          alt=""
          aria-hidden
          width={1024}
          height={640}
          className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-glass" />
        <button
          onClick={() => (currentUser ? setDashboardOpen(true) : setAuthOpen(true))}
          className="absolute left-4 top-4 z-10 hidden md:flex h-11 items-center gap-2 rounded-full border border-accent/40 bg-glass px-4 text-xs font-semibold text-secondary-foreground shadow-soft backdrop-blur-md transition hover:scale-105"
        >
          {currentUser ? (
            <>
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Admin Dashboard</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </>
          )}
        </button>
        <button
          onClick={() => setCartOpen(true)}
          aria-label={`Abrir carrito, ${count} artículos`}
          className="absolute right-4 top-4 z-10 hidden md:flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-glass text-secondary-foreground shadow-soft backdrop-blur-md transition hover:scale-105"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span
              key={bump}
              className="animate-pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
            >
              {count}
            </span>
          )}
        </button>
        <div
          style={{
            transform: `translateY(${scrollY * 0.35}px)`,
            opacity: Math.max(0.1, 1 - scrollY * 0.004),
          }}
          className="relative flex h-full flex-col items-center justify-center gap-8 px-6 transition-transform duration-75"
        >
          <h1 className="text-brand-gradient text-center text-4xl font-normal tracking-tight md:text-5xl">
            Caram &amp; Maranatha
          </h1>
          <label className="relative w-full max-w-[250px] md:max-w-md">
            <span className="sr-only">Buscar productos</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-full border border-accent bg-background/90 pl-5 pr-10 text-base outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <Search
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </label>
        </div>
      </header>

      <section aria-label="Buscar en el catálogo" className="mt-6 px-4">
        <div className="relative mx-auto max-w-md">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos por nombre..."
            className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-10 text-sm outline-none shadow-soft transition focus-visible:ring-2 focus-visible:ring-ring"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      <section ref={catRef} aria-labelledby="cat-title" className="mt-4 scroll-mt-4">
        <h2 id="cat-title" className="text-center text-base">
          Categorias
        </h2>
        <div
          role="tablist"
          className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-2 md:justify-center"
        >
          {loadingCategories ? (
            <p className="py-2 text-xs text-muted-foreground">Cargando categorías de Supabase...</p>
          ) : categoriesList.length <= 1 ? (
            <p className="py-2 text-center text-sm text-muted-foreground">
              No existen categorías disponibles aún
            </p>
          ) : (
            categoriesList.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border border-accent px-3 py-1 text-sm transition ${
                  cat === c
                    ? "bg-accent text-accent-foreground"
                    : "bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))
          )}
        </div>
      </section>

      <main className="mt-6 grid gap-6 px-4 md:grid-cols-2">
        {loadingProducts && (
          <p className="col-span-full py-12 text-center text-xs text-muted-foreground">
            Cargando productos de la tabla 'Productos' en Supabase...
          </p>
        )}
        {!loadingProducts && productsList.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-base font-medium text-foreground">
              No existen productos disponibles aún
            </p>
          </div>
        )}
        {!loadingProducts && productsList.length > 0 && filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No se encontraron productos para esta categoría o búsqueda.
          </p>
        )}
        {filtered.map((p, i) => (
          <article
            key={`${cat}-${p.id}`}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-rise flex flex-col items-center gap-4 rounded-[2.5rem] border border-border bg-card p-4 shadow-soft min-[380px]:flex-row min-[380px]:items-start"
          >
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              width={816}
              height={816}
              className="aspect-square w-40 shrink-0 rounded-full object-cover min-[380px]:w-[45%]"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2 text-sm">
              <h3 className="text-lg leading-tight">
                {p.name}
                {p.tag && (
                  <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 align-middle text-[10px] text-secondary-foreground">
                    {p.tag}
                  </span>
                )}
              </h3>
              {p.description && (
                <>
                  <p className="text-xs text-muted-foreground">Descripción:</p>
                  <p className="text-xs">{p.description}</p>
                </>
              )}
              <p className="text-xs">Precio: {priceLabel(p)}</p>
              <p className="text-xs">Disp.: {p.stock}</p>
              <button
                onClick={() => setSelected(p)}
                disabled={p.stock < 1}
                className="mt-2 h-10 rounded-full bg-primary px-4 text-xs font-semibold tracking-wide text-primary-foreground shadow-cta transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                PEDIR AHORA
              </button>
            </div>
          </article>
        ))}
      </main>

      <nav
        aria-label="Menú principal"
        className="fixed inset-x-3 bottom-3 z-40 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-5 items-end rounded-full border border-border bg-glass px-2 py-1.5 shadow-soft backdrop-blur-xl">
          <ThumbBtn
            label={currentUser ? "Admin" : "Login"}
            onClick={() => (currentUser ? setDashboardOpen(true) : setAuthOpen(true))}
          >
            {currentUser ? (
              <ShieldCheck className="h-5 w-5 text-primary" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
          </ThumbBtn>
          <ThumbBtn label="Inicio" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Home className="h-5 w-5" />
          </ThumbBtn>
          <button
            onClick={() =>
              openWhatsApp(
                cart.length
                  ? buildWhatsAppMessage(cart, productsList)
                  : "Hola, quiero hacer un pedido en Caram & Maranatha.",
              )
            }
            aria-label="Pedir por WhatsApp"
            className="mx-auto -mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-cta transition active:scale-95"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          <ThumbBtn
            label="Categorías"
            onClick={() => catRef.current?.scrollIntoView({ behavior: "smooth" })}
          >
            <LayoutGrid className="h-5 w-5" />
          </ThumbBtn>
          <ThumbBtn label="Pedido" onClick={() => setCartOpen(true)}>
            <span className="relative">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span
                  key={bump}
                  className="animate-pop absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
                >
                  {count}
                </span>
              )}
            </span>
          </ThumbBtn>
        </div>
      </nav>

      {selected && (
        <ProductModal
          product={selected}
          products={productsList}
          onClose={() => setSelected(null)}
          onAdd={add}
        />
      )}
      {cartOpen && (
        <CartPanel
          cart={cart}
          products={productsList}
          setCart={setCart}
          onClose={() => setCartOpen(false)}
        />
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setDashboardOpen(true)}
      />
      <AdminDashboard
        isOpen={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        onDataChanged={() => {
          fetchSupabaseCategories();
          fetchSupabaseProducts();
        }}
      />
    </div>
  );
}

function ThumbBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] text-muted-foreground transition hover:text-secondary-foreground active:scale-95"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function Overlay({
  onClose,
  children,
  label,
}: {
  onClose: () => void;
  children: React.ReactNode;
  label: string;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal
      aria-label={label}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-rise relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-border bg-card p-6 shadow-soft md:rounded-[2rem]"
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function ProductModal({
  product: p,
  products = PRODUCTS,
  onClose,
  onAdd,
}: {
  product: Product;
  products?: Product[];
  onClose: () => void;
  onAdd: (p: Product, q: number) => void;
}) {
  const [qtyText, setQtyText] = useState("1");
  const qty = Number(qtyText);
  const valid = isValidQty(qty, p.stock);
  const priced = hasValidPrice(p);

  const direct = () => {
    if (!valid) return;
    const msg = priced
      ? buildWhatsAppMessage([{ id: p.id, qty }], products)
      : `Hola, quiero consultar el precio de ${p.name} (${qty} unidad${qty > 1 ? "es" : ""}) en Caram & Maranatha.`;
    openWhatsApp(msg);
  };

  return (
    <Overlay onClose={onClose} label={p.name}>
      <img
        src={p.image}
        alt={p.name}
        className="mx-auto aspect-square w-48 rounded-full object-cover"
      />
      <h2 className="mt-4 text-center text-xl">{p.name}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">{p.description}</p>
      <div className="mt-4 flex justify-between text-sm">
        <span>Precio: {priceLabel(p)}</span>
        <span>Disponibles: {p.stock}</span>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          aria-label="Disminuir"
          onClick={() => setQtyText(String(Math.max(1, (Number.isFinite(qty) ? qty : 1) - 1)))}
          className="rounded-full border border-accent p-2"
        >
          <Minus className="h-4 w-4" />
        </button>
        <label>
          <span className="sr-only">Cantidad</span>
          <input
            inputMode="numeric"
            value={qtyText}
            onChange={(e) => setQtyText(e.target.value)}
            aria-invalid={!valid}
            className="h-10 w-16 rounded-full border border-border text-center outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </label>
        <button
          aria-label="Aumentar"
          onClick={() =>
            setQtyText(String(Math.min(p.stock, (Number.isFinite(qty) ? qty : 0) + 1)))
          }
          className="rounded-full border border-accent p-2"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {!valid && (
        <p role="alert" className="mt-2 text-center text-xs text-destructive">
          Introduce un número entero entre 1 y {p.stock}.
        </p>
      )}
      {priced && valid && (
        <p className="mt-2 text-center text-sm font-medium">Total: {formatCUP(p.price * qty)}</p>
      )}
      <div className="mt-6 grid gap-3">
        <button
          disabled={!valid}
          onClick={() => {
            onAdd(p, qty);
            onClose();
          }}
          className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-cta transition active:scale-95 disabled:opacity-50"
        >
          Añadir al pedido
        </button>
        <button
          disabled={!valid}
          onClick={direct}
          className="flex h-11 items-center justify-center gap-2 rounded-full border border-accent text-sm text-secondary-foreground transition hover:bg-secondary disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" />{" "}
          {priced ? "Pedir por WhatsApp" : "Consultar por WhatsApp"}
        </button>
      </div>
    </Overlay>
  );
}

function CartPanel({
  cart,
  products = PRODUCTS,
  setCart,
  onClose,
}: {
  cart: CartLine[];
  products?: Product[];
  setCart: React.Dispatch<React.SetStateAction<CartLine[]>>;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { total, allPriced } = cartTotal(cart, products);
  const change = (id: string, d: number, stock: number) =>
    setCart((c) =>
      c.map((l) => (l.id === id ? { ...l, qty: Math.min(stock, Math.max(1, l.qty + d)) } : l)),
    );
  const remove = (id: string) => setCart((c) => c.filter((l) => l.id !== id));

  return (
    <Overlay onClose={onClose} label="Carrito">
      <h2 className="text-xl">Tu pedido</h2>
      <p className="mt-1 text-xs text-muted-foreground">Los pedidos se hacen solo por WhatsApp.</p>
      {!mounted ? (
        <p className="py-10 text-center text-muted-foreground">Cargando...</p>
      ) : cart.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Tu pedido está vacío. ¡Elige algo dulce! 🧁
        </p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-border">
            {cart.map((l) => {
              const p = products.find((x) => x.id === l.id) ?? PRODUCTS.find((x) => x.id === l.id)!;
              return (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <img src={p.image} alt="" className="h-14 w-14 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {hasValidPrice(p) ? formatCUP(p.price * l.qty) : "Consultar precio"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        aria-label="Disminuir"
                        onClick={() => change(l.id, -1, p.stock)}
                        className="rounded-full border border-border p-1"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <button
                        aria-label="Aumentar"
                        onClick={() => change(l.id, 1, p.stock)}
                        className="rounded-full border border-border p-1"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    aria-label={`Eliminar ${p.name}`}
                    onClick={() => remove(l.id)}
                    className="rounded-full p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-medium">
            <span>Total</span>
            <span>{allPriced ? formatCUP(total) : "A consultar"}</span>
          </div>
          {!allPriced && (
            <p className="mt-2 text-xs text-muted-foreground">
              Hay productos sin precio configurado. Envía una consulta por WhatsApp.
            </p>
          )}
          <div className="mt-4">
            <WhatsAppCheckoutButton cart={cart} products={products} />
          </div>
        </>
      )}
    </Overlay>
  );
}

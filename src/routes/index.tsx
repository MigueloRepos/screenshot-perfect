import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, X, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Caram & Maranatha — Repostería artesanal" },
      { name: "description", content: "Cakes, cupcakes, helados, pies y marquesitas. Pide en línea y confirma por WhatsApp." },
      { property: "og:title", content: "Caram & Maranatha — Repostería artesanal" },
      { property: "og:description", content: "Cakes, cupcakes, helados, pies y marquesitas. Pide en línea por WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CART_KEY = "cm-cart-v1";
const catalog = PRODUCTS.filter((p) => p.active);
const priceLabel = (p: Product) => (hasValidPrice(p) ? formatCUP(p.price) : "Consultar precio");

function openWhatsApp(message: string) {
  const url = whatsappUrl(WHATSAPP_NUMBER, message);
  if (!url) {
    toast.error("WhatsApp no configurado", {
      description: "El administrador debe indicar el número en WHATSAPP_NUMBER. El pedido no se ha enviado.",
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
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        setCart(parsed.filter((l) => catalog.some((p) => p.id === l.id) && Number.isInteger(l.qty) && l.qty > 0));
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((p) => (cat === "Todas" || p.category === cat) && (!q || p.name.toLowerCase().includes(q)));
  }, [query, cat]);

  const count = cart.reduce((n, l) => n + l.qty, 0);

  const add = (p: Product, qty: number) => {
    setCart((c) => addToCart(c, p.id, qty, p.stock));
    setBump((b) => b + 1);
    toast.success(`${p.name} añadido al carrito`);
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl bg-background pb-16">
      <header className="relative h-[228px] overflow-hidden rounded-b-[3rem] md:h-[300px]">
        <img src={heroImg} alt="" aria-hidden width={1024} height={640} className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]" />
        <div className="absolute inset-0 bg-glass" />
        <button
          onClick={() => setCartOpen(true)}
          aria-label={`Abrir carrito, ${count} artículos`}
          className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-glass text-secondary-foreground shadow-soft backdrop-blur-md transition hover:scale-105"
        >
          <ShoppingBag className="h-5 w-5" />
          {count > 0 && (
            <span key={bump} className="animate-pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {count}
            </span>
          )}
        </button>
        <div className="relative flex h-full flex-col items-center justify-center gap-8 px-6">
          <h1 className="text-brand-gradient text-center text-4xl font-normal tracking-tight md:text-5xl">Caram &amp; Maranatha</h1>
          <label className="relative w-full max-w-[250px] md:max-w-md">
            <span className="sr-only">Buscar productos</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-full border border-accent bg-background/90 pl-5 pr-10 text-base outline-none backdrop-blur focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          </label>
        </div>
      </header>

      <section aria-labelledby="cat-title" className="mt-2">
        <h2 id="cat-title" className="text-center text-base">Categorias</h2>
        <div role="tablist" className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-2 md:justify-center">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full border border-accent px-3 py-1 text-sm transition ${
                cat === c ? "bg-accent text-accent-foreground" : "bg-background text-foreground hover:bg-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <main className="mt-6 grid gap-6 px-4 md:grid-cols-2">
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">No encontramos productos. Prueba otra búsqueda.</p>
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
                {p.tag && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 align-middle text-[10px] text-secondary-foreground">{p.tag}</span>}
              </h3>
              <p className="text-xs text-muted-foreground">Descripción:</p>
              <p className="text-xs">{p.description}</p>
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

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={add} />}
      {cartOpen && <CartPanel cart={cart} setCart={setCart} onClose={() => setCartOpen(false)} />}
    </div>
  );
}

function Overlay({ onClose, children, label }: { onClose: () => void; children: React.ReactNode; label: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal aria-label={label} className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="animate-rise relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] border border-border bg-card p-6 shadow-soft md:rounded-[2rem]">
        <button onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 rounded-full p-2 hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function ProductModal({ product: p, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (p: Product, q: number) => void }) {
  const [qtyText, setQtyText] = useState("1");
  const qty = Number(qtyText);
  const valid = isValidQty(qty, p.stock);
  const priced = hasValidPrice(p);

  const direct = () => {
    if (!valid) return;
    const msg = priced
      ? buildWhatsAppMessage([{ id: p.id, qty }], PRODUCTS)
      : `Hola, quiero consultar el precio de ${p.name} (${qty} unidad${qty > 1 ? "es" : ""}) en Caram & Maranatha.`;
    openWhatsApp(msg);
  };

  return (
    <Overlay onClose={onClose} label={p.name}>
      <img src={p.image} alt={p.name} className="mx-auto aspect-square w-48 rounded-full object-cover" />
      <h2 className="mt-4 text-center text-xl">{p.name}</h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">{p.description}</p>
      <div className="mt-4 flex justify-between text-sm">
        <span>Precio: {priceLabel(p)}</span>
        <span>Disponibles: {p.stock}</span>
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button aria-label="Disminuir" onClick={() => setQtyText(String(Math.max(1, (Number.isFinite(qty) ? qty : 1) - 1)))} className="rounded-full border border-accent p-2"><Minus className="h-4 w-4" /></button>
        <label>
          <span className="sr-only">Cantidad</span>
          <input inputMode="numeric" value={qtyText} onChange={(e) => setQtyText(e.target.value)} aria-invalid={!valid} className="h-10 w-16 rounded-full border border-border text-center outline-none focus-visible:ring-2 focus-visible:ring-ring/40" />
        </label>
        <button aria-label="Aumentar" onClick={() => setQtyText(String(Math.min(p.stock, (Number.isFinite(qty) ? qty : 0) + 1)))} className="rounded-full border border-accent p-2"><Plus className="h-4 w-4" /></button>
      </div>
      {!valid && <p role="alert" className="mt-2 text-center text-xs text-destructive">Introduce un número entero entre 1 y {p.stock}.</p>}
      {priced && valid && <p className="mt-2 text-center text-sm font-medium">Total: {formatCUP(p.price * qty)}</p>}
      <div className="mt-6 grid gap-3">
        <button disabled={!valid} onClick={() => { onAdd(p, qty); onClose(); }} className="h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-cta transition active:scale-95 disabled:opacity-50">
          Añadir al carrito
        </button>
        <button disabled={!valid} onClick={direct} className="flex h-11 items-center justify-center gap-2 rounded-full border border-accent text-sm text-secondary-foreground transition hover:bg-secondary disabled:opacity-50">
          <MessageCircle className="h-4 w-4" /> {priced ? "Pedir por WhatsApp" : "Consultar por WhatsApp"}
        </button>
      </div>
    </Overlay>
  );
}

function CartPanel({ cart, setCart, onClose }: { cart: CartLine[]; setCart: React.Dispatch<React.SetStateAction<CartLine[]>>; onClose: () => void }) {
  const { total, allPriced } = cartTotal(cart, PRODUCTS);
  const change = (id: string, d: number, stock: number) =>
    setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: Math.min(stock, Math.max(1, l.qty + d)) } : l)));
  const remove = (id: string) => setCart((c) => c.filter((l) => l.id !== id));

  return (
    <Overlay onClose={onClose} label="Carrito">
      <h2 className="text-xl">Tu carrito</h2>
      {cart.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">Tu carrito está vacío. ¡Elige algo dulce! 🧁</p>
      ) : (
        <>
          <ul className="mt-4 divide-y divide-border">
            {cart.map((l) => {
              const p = PRODUCTS.find((x) => x.id === l.id)!;
              return (
                <li key={l.id} className="flex items-center gap-3 py-3">
                  <img src={p.image} alt="" className="h-14 w-14 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{hasValidPrice(p) ? formatCUP(p.price * l.qty) : "Consultar precio"}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button aria-label="Disminuir" onClick={() => change(l.id, -1, p.stock)} className="rounded-full border border-border p-1"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <button aria-label="Aumentar" onClick={() => change(l.id, 1, p.stock)} className="rounded-full border border-border p-1"><Plus className="h-3 w-3" /></button>
                    </div>
                  </div>
                  <button aria-label={`Eliminar ${p.name}`} onClick={() => remove(l.id)} className="rounded-full p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-medium">
            <span>Total</span>
            <span>{allPriced ? formatCUP(total) : "A consultar"}</span>
          </div>
          {!allPriced && <p className="mt-2 text-xs text-muted-foreground">Hay productos sin precio configurado. Envía una consulta por WhatsApp.</p>}
          <button
            onClick={() => openWhatsApp(buildWhatsAppMessage(cart, PRODUCTS))}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-cta active:scale-95"
          >
            <MessageCircle className="h-4 w-4" /> {allPriced ? "Confirmar pedido por WhatsApp" : "Consultar por WhatsApp"}
          </button>
          {!WHATSAPP_NUMBER && <p className="mt-2 text-center text-xs text-destructive">Número de WhatsApp pendiente de configurar.</p>}
        </>
      )}
    </Overlay>
  );
}

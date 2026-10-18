import type { Product } from "@/data/products";

export interface CartLine {
  id: string;
  qty: number;
}

export function hasValidPrice(p: Pick<Product, "price">): p is { price: number } {
  return typeof p.price === "number" && Number.isFinite(p.price) && p.price > 0;
}

export function isValidQty(qty: number, stock: number) {
  return Number.isInteger(qty) && qty >= 1 && qty <= stock;
}

export function formatCUP(n: number) {
  return `${new Intl.NumberFormat("es-CU", { maximumFractionDigits: 0 }).format(Math.round(n))} CUP`;
}

export function addToCart(lines: CartLine[], id: string, qty: number, stock: number): CartLine[] {
  const existing = lines.find((l) => l.id === id);
  if (existing) {
    return lines.map((l) => (l.id === id ? { ...l, qty: Math.min(stock, l.qty + qty) } : l));
  }
  return [...lines, { id, qty: Math.min(stock, qty) }];
}

export function cartTotal(lines: CartLine[], products: Product[]) {
  let total = 0;
  let allPriced = true;
  for (const l of lines) {
    const p = products.find((x) => x.id === l.id);
    if (!p || !hasValidPrice(p)) {
      allPriced = false;
      continue;
    }
    total += p.price * l.qty;
  }
  return { total, allPriced };
}

export function buildWhatsAppMessage(lines: CartLine[], products: Product[]) {
  const items = lines
    .map((l) => {
      const p = products.find((x) => x.id === l.id);
      return p ? `- ${p.name} × ${l.qty}` : null;
    })
    .filter(Boolean)
    .join("\n");
  const { total, allPriced } = cartTotal(lines, products);
  const totalLine = allPriced ? `Total: ${formatCUP(total)}` : "Total: a consultar (hay productos sin precio)";
  return `Hola, quiero realizar un pedido en Caram & Maranatha.\n\nProductos:\n${items}\n\n${totalLine}\n\n¿Podrían confirmar la disponibilidad y los detalles de entrega?`;
}

export function whatsappUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// Catálogo central. Edita precios, disponibilidad, categorías y fotos aquí.
import cakeChocolate from "@/assets/cake-chocolate.jpg";
import cupcakeLeche from "@/assets/cupcake-leche.jpg";
import helado from "@/assets/helado.jpg";
import pie from "@/assets/pie.jpg";
import marquesita from "@/assets/marquesita.jpg";

// Número comercial de WhatsApp en formato internacional, solo dígitos (ej. "5355555555").
// Vacío hasta que el negocio lo proporcione.
export const WHATSAPP_NUMBER = "";

export const CATEGORIES = ["Todas", "Cake", "Helados", "Pie", "Marquesitas", "CupCake"] as const;
export type Category = Exclude<(typeof CATEGORIES)[number], "Todas">;

export interface Product {
  id: string;
  name: string;
  category: Category;
  description: string;
  price: number | null; // null = "Consultar precio"
  currency: "CUP";
  stock: number;
  image: string;
  active: boolean;
  tag?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "cake-chocolate",
    name: "Cake de Chocolate",
    category: "Cake",
    description: "Cake de chocolate con crema de leche y vainilla.",
    price: 6000,
    currency: "CUP",
    stock: 40,
    image: cakeChocolate,
    active: true,
  },
  {
    id: "cupcake-leche-condensada",
    name: "CupCake de Leche Condensada",
    category: "CupCake",
    description: "Cupcake de vainilla con cobertura cremosa de leche condensada.",
    price: null,
    currency: "CUP",
    stock: 20,
    image: cupcakeLeche,
    active: true,
  },
  // --- Datos de demostración editables ---
  {
    id: "demo-helado",
    name: "Copa de Helado Mixta",
    category: "Helados",
    description: "Vainilla, fresa y chocolate en copa. (Demo editable)",
    price: null,
    currency: "CUP",
    stock: 15,
    image: helado,
    active: true,
    tag: "Demo",
  },
  {
    id: "demo-pie",
    name: "Pie de Guayaba",
    category: "Pie",
    description: "Masa dorada enrejada rellena de guayaba. (Demo editable)",
    price: null,
    currency: "CUP",
    stock: 10,
    image: pie,
    active: true,
    tag: "Demo",
  },
  {
    id: "demo-marquesita",
    name: "Marquesitas de Chocolate y Queso",
    category: "Marquesitas",
    description: "Crepa crujiente con chocolate y queso. (Demo editable)",
    price: null,
    currency: "CUP",
    stock: 25,
    image: marquesita,
    active: true,
    tag: "Demo",
  },
];

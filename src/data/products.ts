// Catálogo central. Edita precios, disponibilidad, categorías y fotos aquí.
import cakeChocolate from "@/assets/cake-chocolate.jpg";
import cupcakeLeche from "@/assets/cupcake-leche.jpg";
import helado from "@/assets/helado.jpg";
import pie from "@/assets/pie.jpg";
import marquesita from "@/assets/marquesita.jpg";

// Número comercial de WhatsApp en formato internacional, solo dígitos (ej. "5355555555").
export const WHATSAPP_NUMBER = "";

export const CATEGORIES = [
  "Todas",
  "Cakes",
  "Pastries",
  "Breads",
  "Helados",
  "Pie",
  "CupCake",
] as const;
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
    category: "Cakes",
    description: "Cake de chocolate húmedo con ganache y crema de leche.",
    price: 6000,
    currency: "CUP",
    stock: 40,
    image: cakeChocolate,
    active: true,
    tag: "Popular",
  },
  {
    id: "cake-red-velvet",
    name: "Cake Red Velvet",
    category: "Cakes",
    description: "Bizcocho rojo aterciopelado con crema de queso y vainilla.",
    price: 6500,
    currency: "CUP",
    stock: 25,
    image: cakeChocolate,
    active: true,
  },
  {
    id: "croissant-mantequilla",
    name: "Croissant de Mantequilla",
    category: "Pastries",
    description: "Hojaldre crujiente horneado con auténtica mantequilla.",
    price: 1200,
    currency: "CUP",
    stock: 50,
    image: cupcakeLeche,
    active: true,
    tag: "Nuevo",
  },
  {
    id: "cupcake-leche-condensada",
    name: "CupCake de Leche Condensada",
    category: "Pastries",
    description: "Cupcake de vainilla con cobertura cremosa de leche condensada.",
    price: null,
    currency: "CUP",
    stock: 30,
    image: cupcakeLeche,
    active: true,
  },
  {
    id: "pastel-hojaldre-guayaba",
    name: "Pastel de Hojaldre y Guayaba",
    category: "Pastries",
    description: "Delicioso pastelito dorado relleno de dulce de guayaba.",
    price: 900,
    currency: "CUP",
    stock: 40,
    image: pie,
    active: true,
  },
  {
    id: "pan-masa-madre",
    name: "Pan Artesanal de Masa Madre",
    category: "Breads",
    description: "Pan rústico de fermentación lenta con corteza crujiente y miga suave.",
    price: 2000,
    currency: "CUP",
    stock: 20,
    image: cakeChocolate,
    active: true,
    tag: "Artesanal",
  },
  {
    id: "pan-integral-semillas",
    name: "Pan Integral con Semillas",
    category: "Breads",
    description: "Pan saludable de grano entero con mezcla de semillas nutritivas.",
    price: 2200,
    currency: "CUP",
    stock: 18,
    image: cakeChocolate,
    active: true,
  },
  {
    id: "demo-helado",
    name: "Copa de Helado Mixta",
    category: "Helados",
    description: "Vainilla, fresa y chocolate en copa con sirope artesanal.",
    price: 1800,
    currency: "CUP",
    stock: 15,
    image: helado,
    active: true,
  },
  {
    id: "demo-pie",
    name: "Pie de Guayaba",
    category: "Pie",
    description: "Masa dorada enrejada rellena de pasta de guayaba selecta.",
    price: 4500,
    currency: "CUP",
    stock: 10,
    image: pie,
    active: true,
  },
  {
    id: "demo-marquesita",
    name: "Marquesitas de Chocolate y Queso",
    category: "Pastries",
    description: "Crepa crujiente enrollada con chocolate fundido y queso crema.",
    price: 2500,
    currency: "CUP",
    stock: 25,
    image: marquesita,
    active: true,
  },
];

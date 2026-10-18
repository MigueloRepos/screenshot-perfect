import { useState } from "react";
import { MessageCircle, User, MapPin, Phone, Truck } from "lucide-react";
import { toast } from "sonner";
import { PRODUCTS, WHATSAPP_NUMBER as DEFAULT_WHATSAPP, type Product } from "@/data/products";
import { buildWhatsAppMessage, whatsappUrl, cartTotal, formatCUP, type CartLine } from "@/lib/cart";

interface WhatsAppOrderFormProps {
  cart: CartLine[];
  products?: Product[];
  phoneNumber?: string;
  className?: string;
  onSuccess?: () => void;
}

export function WhatsAppCheckoutButton({
  cart,
  products = PRODUCTS,
  phoneNumber = DEFAULT_WHATSAPP || "5355555555",
  className = "",
  onSuccess,
}: WhatsAppOrderFormProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<number>(500); // 500 CUP default delivery
  const [customPhone, setCustomPhone] = useState(phoneNumber);

  const { total, allPriced } = cartTotal(cart, products);
  const grandTotal = allPriced ? total + deliveryFee : null;

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Tu carrito está vacío", {
        description: "Agrega al menos un producto antes de enviar tu pedido por WhatsApp.",
      });
      return;
    }

    if (!name.trim()) {
      toast.error("Falta tu nombre", {
        description: "Por favor, introduce tu nombre completo para el pedido.",
      });
      return;
    }

    if (!address.trim()) {
      toast.error("Falta tu dirección", {
        description: "Por favor, introduce tu dirección particular para la entrega.",
      });
      return;
    }

    const message = buildWhatsAppMessage(cart, products, {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
      deliveryFee,
    });

    const url = whatsappUrl(customPhone, message);
    if (!url) {
      toast.error("Número de WhatsApp no válido", {
        description: "Por favor, comprueba el número de WhatsApp de destino.",
      });
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("¡Pedido generado para WhatsApp!", {
      description: "Se abrió WhatsApp con todos tus datos y productos listos para enviar.",
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleWhatsAppOrder} className="flex flex-col gap-4 w-full text-left">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          Datos para el Pedido por WhatsApp
        </h3>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Nombre completo *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. María González Pérez"
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Dirección particular (Domicilio) *
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej. Calle 23 #456 e/ G y H, Vedado"
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Teléfono de contacto (Opcional)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ej. +53 51234567"
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Delivery Fee option */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" /> Costo de domicilio (CUP)
          </label>
          <select
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(Number(e.target.value))}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={300}>Domicilio Zona Cercana (300 CUP)</option>
            <option value={500}>Domicilio Estándar (500 CUP)</option>
            <option value={800}>Domicilio Zona Alejada (800 CUP)</option>
            <option value={0}>Recogida en Tienda (0 CUP)</option>
          </select>
        </div>
      </div>

      {/* Summary calculation */}
      <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-xs flex flex-col gap-1.5">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal productos:</span>
          <span>{allPriced ? formatCUP(total) : "A consultar"}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Costo de domicilio:</span>
          <span>{formatCUP(deliveryFee)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-sm font-bold text-foreground">
          <span>Total a pagar:</span>
          <span className="text-primary">
            {allPriced ? formatCUP(grandTotal!) : "A consultar + domicilio"}
          </span>
        </div>
      </div>

      {/* Submit WhatsApp button */}
      <button
        type="submit"
        disabled={cart.length === 0}
        className={`flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-white font-semibold text-sm shadow-cta transition hover:brightness-110 active:scale-95 disabled:opacity-50 ${className}`}
      >
        <MessageCircle className="h-5 w-5 fill-current" />
        <span>Enviar Pedido por WhatsApp</span>
      </button>

      {/* Advanced WhatsApp destination number configuration */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-[11px] text-muted-foreground">WhatsApp negocio:</span>
        <input
          type="text"
          value={customPhone}
          onChange={(e) => setCustomPhone(e.target.value)}
          placeholder="Ej. 5355555555"
          className="h-7 flex-1 rounded-lg border border-border bg-background px-2 text-[11px] outline-none"
        />
      </div>
    </form>
  );
}

import { describe, expect, it } from "vitest";
import { addToCart, cartTotal, isValidQty, whatsappUrl } from "@/lib/cart";
import { PRODUCTS } from "@/data/products";

describe("cart rules", () => {
  it("rejects quantities above stock or non-integer", () => {
    expect(isValidQty(41, 40)).toBe(false);
    expect(isValidQty(1.5, 40)).toBe(false);
    expect(isValidQty(0, 40)).toBe(false);
    expect(isValidQty(40, 40)).toBe(true);
  });
  it("caps added quantity at stock", () => {
    expect(addToCart([{ id: "a", qty: 39 }], "a", 5, 40)[0]?.qty).toBe(40);
  });
  it("totals 2 chocolate cakes as 12000 CUP", () => {
    expect(cartTotal([{ id: "cake-chocolate", qty: 2 }], PRODUCTS)).toEqual({
      total: 12000,
      allPriced: true,
    });
  });
  it("flags carts with unpriced products", () => {
    expect(cartTotal([{ id: "cupcake-leche-condensada", qty: 1 }], PRODUCTS).allPriced).toBe(false);
  });
  it("returns no link without a WhatsApp number", () => {
    expect(whatsappUrl("", "hola")).toBeNull();
  });
});

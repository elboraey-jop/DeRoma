"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createManualOrderAction } from "@/app/admin/orders/actions";

interface Product {
  id: string;
  name: string;
  price: number;
  color: string | null;
  variants: Array<{ id: string; size: string; stock: number }>;
}
interface Line {
  variantId: string;
  quantity: number;
}

export default function AdminManualOrderForm({
  products,
}: {
  products: Product[];
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const addLine = () => {
    if (
      !selectedVariant ||
      lines.some((line) => line.variantId === selectedVariant)
    )
      return;
    setLines([...lines, { variantId: selectedVariant, quantity: 1 }]);
    setSelectedVariant("");
  };
  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find((item) =>
          item.variants.some((variant) => variant.id === line.variantId),
        );
        return sum + (product?.price || 0) * line.quantity;
      }, 0),
    [lines, products],
  );
  return (
    <form action={createManualOrderAction} className="space-y-5">
      <input type="hidden" name="itemsJson" value={JSON.stringify(lines)} />
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center gap-2">
          <Plus className="h-5 w-5 text-[#D8B46A]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              Step 1
            </p>
            <h2 className="font-playfair text-xl font-bold">
              Customer details
            </h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            required
            name="customerName"
            placeholder="Customer name"
            className="admin-input"
          />
          <input
            required
            name="customerPhone"
            type="tel"
            placeholder="Phone"
            className="admin-input"
          />
          <input
            required
            name="governorate"
            placeholder="Governorate"
            className="admin-input"
          />
          <input
            required
            name="city"
            placeholder="City / Area"
            className="admin-input"
          />
          <textarea
            required
            name="address"
            rows={3}
            placeholder="Address"
            className="admin-input sm:col-span-2 resize-y"
          />
        </div>
      </section>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 2
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">Order items</h2>
        <div className="mt-4 flex gap-2">
          <select
            value={selectedVariant}
            onChange={(event) => setSelectedVariant(event.target.value)}
            className="admin-input min-w-0 flex-1"
          >
            <option value="">Choose a product variant</option>
            {products.flatMap((product) =>
              product.variants
                .filter((variant) => variant.stock > 0)
                .map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {product.name} · {product.color || "No color"} · {variant.size} ·{" "}
                    {variant.stock} in stock
                  </option>
                )),
            )}
          </select>
          <button
            type="button"
            onClick={addLine}
            className="rounded-xl bg-[#D8B46A] px-3 text-xs font-bold text-[#942E3A]"
          >
            Add
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {lines.map((line) => {
            const product = products.find((item) =>
              item.variants.some((variant) => variant.id === line.variantId),
            );
            const variant = product?.variants.find(
              (item) => item.id === line.variantId,
            );
            return (
              <div
                key={line.variantId}
                className="flex items-center gap-3 rounded-xl bg-[#FFF9EB] p-3 text-xs"
              >
                <span className="min-w-0 flex-1 truncate font-bold">
                  {product?.name} · {product?.color || "No color"} · {variant?.size}
                </span>
                <input
                  name={`qty-${line.variantId}`}
                  type="number"
                  min="1"
                  max={variant?.stock}
                  value={line.quantity}
                  onChange={(event) =>
                    setLines(
                      lines.map((item) =>
                        item.variantId === line.variantId
                          ? { ...item, quantity: Number(event.target.value) }
                          : item,
                      ),
                    )
                  }
                  className="w-16 rounded-lg border border-[#942E3A]/15 bg-white px-2 py-1.5 text-center text-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    setLines(
                      lines.filter((item) => item.variantId !== line.variantId),
                    )
                  }
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          {lines.length === 0 && (
            <p className="rounded-xl bg-[#FFF9EB] p-4 text-center text-xs text-[#6B1F2A]/60">
              Add products to this manual order.
            </p>
          )}
        </div>
      </section>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 3
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          Pricing adjustment
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label>
            <span className="field-label">Products total</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={subtotal}
              readOnly
              className="admin-input cursor-not-allowed bg-stone-100"
            />
          </label>
          <label>
            <span className="field-label">Discount</span>
            <input
              name="discount"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="admin-input"
            />
          </label>
          <label>
            <span className="field-label">Shipping fee</span>
            <input
              required
              name="shippingCost"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="admin-input"
            />
          </label>
        </div>
      </section>
      <button
        type="submit"
        disabled={!lines.length}
        className="w-full rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Create manual order
      </button>
    </form>
  );
}

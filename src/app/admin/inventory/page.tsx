import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getActiveProducts } from "@/lib/products";
import { Package, Search } from "lucide-react";
import { updateVariantStockAction } from "@/app/admin/inventory/actions";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await requireAdmin();
  let rows: Array<{
    variantId: string;
    product: string;
    sku: string;
    size: string;
    color: string;
    stock: number;
    lowStockLimit: number;
  }> = [];
  try {
    const products = await prisma.product.findMany({
      include: { variants: true },
      orderBy: { name: "asc" },
    });
    rows = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        product: product.name,
        sku: product.sku || "",
        size: variant.size,
        color: product.color || "",
        stock: variant.stock,
        lowStockLimit: product.lowStockLimit,
      })),
    );
  } catch {
    const products = await getActiveProducts();
    rows = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        product: product.name,
        sku: product.sku || "",
        size: variant.size,
        color: product.color || "",
        stock: variant.stock,
        lowStockLimit: 2,
      })),
    );
  }
  const low = rows.filter(
    (row) => row.stock > 0 && row.stock <= row.lowStockLimit,
  ).length;
  const out = rows.filter((row) => row.stock === 0).length;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Operations
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">Inventory</h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          Review variant-level stock and make quick adjustments before orders
          arrive.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Variants
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {rows.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Low stock
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">{low}</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-red-700/65">
            Out of stock
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-red-700">
            {out}
          </p>
        </div>
      </div>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold">Stock ledger</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">Product</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Variant</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {rows.map((row) => (
                <tr key={row.variantId}>
                  <td className="py-3 font-bold text-[#942E3A]">
                    {row.product}
                  </td>
                  <td className="py-3 text-[10px] text-[#6B1F2A]/60">
                    {row.sku}
                  </td>
                  <td className="py-3 text-[#6B1F2A]">
                    {row.color} · {row.size}
                  </td>
                  <td className="py-3">
                    <span
                      className={
                        row.stock === 0
                          ? "font-bold text-red-600"
                          : row.stock <= row.lowStockLimit
                            ? "font-bold text-amber-600"
                            : "text-emerald-700"
                      }
                    >
                      {row.stock === 0
                        ? "Out of stock"
                        : row.stock <= row.lowStockLimit
                          ? "Low stock"
                          : "Healthy"}{" "}
                      · {row.stock}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <form
                      action={updateVariantStockAction}
                      className="flex justify-end gap-1"
                    >
                      <input
                        type="hidden"
                        name="variantId"
                        value={row.variantId}
                      />
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={row.stock}
                        className="w-16 rounded-lg border border-[#942E3A]/15 bg-[#FFF9EB] px-2 py-1.5 text-center text-xs"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-[#942E3A] px-2.5 py-1.5 text-[10px] font-bold text-[#FFF9EB]"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6B1F2A]/60">
              <Search className="mx-auto h-6 w-6 text-[#D8B46A]" />
              <p className="mt-2">No inventory records yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Building2, Plus, Trash2 } from "lucide-react";
import {
  createSupplierAction,
  deleteSupplierAction,
} from "@/app/admin/suppliers/actions";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  await requireAdmin();
  let suppliers: Array<{
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    _count: { products: number };
  }> = [];
  try {
    suppliers = await prisma.supplier.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Unable to load suppliers", error);
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Procurement
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">Suppliers</h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          Keep supplier contacts, purchasing notes, and linked product counts in
          one place.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">Add supplier</h2>
          </div>
          <form action={createSupplierAction} className="mt-5 space-y-3">
            <input
              required
              name="name"
              placeholder="Supplier name"
              className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
            />
            <input
              name="phone"
              placeholder="Phone"
              className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
            />
            <input
              name="address"
              placeholder="Address"
              className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
            />
            <textarea
              name="notes"
              rows={3}
              placeholder="Notes"
              className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB]"
            >
              Save supplier
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">
              Supplier directory
            </h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="rounded-2xl border border-[#942E3A]/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-playfair text-lg font-bold">
                    {supplier.name}
                  </h3>
                  <form action={deleteSupplierAction}>
                    <input type="hidden" name="id" value={supplier.id} />
                    <button
                      type="submit"
                      aria-label={`Delete ${supplier.name}`}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                <p className="mt-2 text-xs text-[#6B1F2A]/70">
                  {supplier.phone || "No phone"}
                  {supplier.email ? ` · ${supplier.email}` : ""}
                </p>
                {supplier.address && (
                  <p className="mt-2 text-[10px] text-[#6B1F2A]/60">
                    {supplier.address}
                  </p>
                )}
                <p className="mt-3 text-[10px] font-bold text-[#D8B46A]">
                  {supplier._count.products} linked products
                </p>
                {supplier.notes && (
                  <p className="mt-2 text-[10px] leading-relaxed text-[#6B1F2A]/60">
                    {supplier.notes}
                  </p>
                )}
              </div>
            ))}
            {suppliers.length === 0 && (
              <p className="col-span-full py-10 text-center text-xs text-[#6B1F2A]/60">
                No suppliers yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

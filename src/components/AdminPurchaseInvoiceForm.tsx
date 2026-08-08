"use client";

import Link from "next/link";
import { CheckCircle2, FileText, Plus, Receipt, Trash2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { createPurchaseInvoiceAction } from "@/app/admin/suppliers/actions";
import { AdminProductPicker, AdminSupplierPicker, type ProcurementVariant } from "@/components/AdminProcurementPickers";

type VariantOption = {
  id: string;
  label: string;
  productId: string;
  productName: string;
  wholesalePrice: number;
  retailPrice: number;
  category: string;
  image: string | null;
};

type InvoiceLine = VariantOption & {
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  notes: string;
};

export default function AdminPurchaseInvoiceForm({
  suppliers,
  variants,
}: {
  suppliers: { id: string; name: string }[];
  variants: VariantOption[];
}) {
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  const summary = useMemo(() => ({
    productTypes: lines.length,
    units: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.quantity * line.wholesalePrice, 0),
    retailValue: lines.reduce((sum, line) => sum + line.quantity * line.retailPrice, 0),
  }), [lines]);

  const addLine = () => {
    const variant = variants.find((item) => item.id === selectedVariant);
    if (!variant || lines.some((line) => line.id === variant.id)) return;
    setLines((current) => [...current, { ...variant, quantity: 1, notes: "" }]);
    setSelectedVariant("");
  };

  const updateLine = (
    id: string,
    field: keyof Pick<InvoiceLine, "quantity" | "wholesalePrice" | "retailPrice" | "notes">,
    value: string,
  ) => {
    setLines((current) => current.map((line) => line.id === id
      ? { ...line, [field]: field === "notes" ? value : Number(value) }
      : line));
  };

  const serializedLines = JSON.stringify(lines.map(({ id, quantity, wholesalePrice, retailPrice, notes }) => ({
    variantId: id,
    quantity,
    wholesalePrice,
    retailPrice,
    notes,
  })));

  return (
    <form action={createPurchaseInvoiceAction} className="space-y-4 sm:space-y-5">
      <input type="hidden" name="items" value={serializedLines} />
      <input type="hidden" name="shippingCost" value="0" />
      <input type="hidden" name="discount" value="0" />
      <input type="hidden" name="amountPaid" value="0" />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr] sm:gap-5">
        <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Invoice information</p>
          <h2 className="mt-0.5 sm:mt-1 font-playfair text-lg sm:text-xl font-bold">Supplier & invoice</h2>
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            <label>
              <span className="field-label">Supplier *</span>
              <input type="hidden" name="supplierId" value={selectedSupplier} />
              <AdminSupplierPicker suppliers={suppliers} value={selectedSupplier} onChange={setSelectedSupplier} />
            </label>
            <label>
              <span className="field-label">Invoice date *</span>
              <input name="invoiceDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="admin-input" />
            </label>
            <label className="sm:col-span-2">
              <span className="field-label">Notes</span>
              <textarea name="notes" rows={3} className="admin-input resize-y" placeholder="Add any notes about this purchase..." />
            </label>
          </div>
        </section>

        <InvoiceSummary productTypes={summary.productTypes} units={summary.units} subtotal={summary.subtotal} retailValue={summary.retailValue} />
      </div>

      <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Stock receipt</p>
            <h2 className="mt-0.5 sm:mt-1 font-playfair text-lg sm:text-xl font-bold">Products on this invoice</h2>
            <p className="mt-0.5 text-[11px] text-[#6B1F2A]/60 sm:mt-1 sm:text-xs">The summary updates instantly as you build the invoice.</p>
          </div>
          <Link href="/admin/products/new?fromInvoice=1" className="text-left text-[10px] font-bold text-[#942E3A] underline sm:text-center">Need a new product? Create it first</Link>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row">
          <AdminProductPicker variants={variants as ProcurementVariant[]} value={selectedVariant} onChange={setSelectedVariant} />
          <button type="button" onClick={addLine} className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#D8B46A] px-4 py-2.5 text-xs font-bold text-[#942E3A] shrink-0 sm:py-3"><Plus className="h-4 w-4" /> Add product</button>
        </div>

        <div className="mt-4 space-y-3">
          {lines.map((line) => (
            <div key={line.id} className="rounded-2xl bg-[#FFF9EB]/70 p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-bold text-[#942E3A] text-xs sm:text-sm">{line.productName}</p><p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">{line.label}</p></div>
                <button type="button" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="text-red-600 p-1" aria-label="Remove product"><Trash2 className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                <label><span className="field-label">Quantity</span><input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", event.target.value)} className="admin-input" /></label>
                <label><span className="field-label">Wholesale / unit</span><input type="number" min="0" step="0.01" value={line.wholesalePrice} onChange={(event) => updateLine(line.id, "wholesalePrice", event.target.value)} className="admin-input" /></label>
                <label><span className="field-label">Selling / unit</span><input type="number" min="0" step="0.01" value={line.retailPrice} onChange={(event) => updateLine(line.id, "retailPrice", event.target.value)} className="admin-input" /></label>
                <div><span className="field-label">Line total</span><p className="admin-input flex items-center font-bold text-[#942E3A]">{(line.quantity * line.wholesalePrice).toFixed(2)} EGP</p></div>
              </div>
            </div>
          ))}
          {!lines.length && <div className="rounded-2xl border border-dashed border-[#D8B46A]/60 py-8 text-center text-xs text-[#6B1F2A]/60 sm:py-12">Choose a product variant above to start the invoice.</div>}
        </div>
      </section>

      <div className="flex items-center justify-between gap-2">
        <Link href="/admin/suppliers" className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-center text-xs font-bold text-[#942E3A] shrink-0 sm:px-5 sm:py-3">Cancel</Link>
        <button type="submit" disabled={!lines.length} className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:py-3">Save invoice & receive stock</button>
      </div>
    </form>
  );
}

function InvoiceSummary({ productTypes, units, subtotal, retailValue }: { productTypes: number; units: number; subtotal: number; retailValue: number }) {
  return (
    <section className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-sm sm:p-7">
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Live overview</p><h2 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">Invoice summary</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[#942E3A]"><Receipt className="h-5 w-5" /></div></div>
      <div className="mt-5 grid grid-cols-2 gap-2"><SummaryMetric icon={<FileText />} label="Products" value={String(productTypes)} /><SummaryMetric icon={<PackageIcon />} label="Units" value={String(units)} /></div>
      <div className="mt-3 space-y-3 rounded-2xl bg-white/65 p-4 text-xs text-[#6B1F2A]"><p className="flex items-center justify-between gap-3"><span>Purchase total</span><strong className="font-playfair text-xl text-[#942E3A]">{subtotal.toFixed(2)} EGP</strong></p><p className="flex items-center justify-between gap-3 border-t border-[#942E3A]/10 pt-3"><span>Expected retail value</span><strong className="text-[#942E3A]">{retailValue.toFixed(2)} EGP</strong></p><p className="flex items-center gap-2 pt-1 text-[10px] font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Ready to receive stock</p></div>
    </section>
  );
}

function SummaryMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl bg-white/65 p-3"><div className="text-[#D8B46A]">{icon}</div><p className="mt-3 text-[9px] uppercase tracking-wide text-[#6B1F2A]/55">{label}</p><p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">{value}</p></div>; }
function PackageIcon() { return <Wallet className="h-4 w-4" />; }

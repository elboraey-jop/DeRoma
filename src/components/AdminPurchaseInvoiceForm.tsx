"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowLeft, Boxes, Check, CheckCircle2, ChevronDown, FilePlus2, FileText, LoaderCircle, PackagePlus, Plus, Receipt, Trash2, Wallet, X } from "lucide-react";
import { useActionState, useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { createPurchaseInvoiceAction, createSupplierWithResultAction } from "@/app/admin/suppliers/actions";
import { AdminCatalogProductPicker, AdminSupplierPicker, type ProcurementProduct } from "@/components/AdminProcurementPickers";
import AdminProductCreateForm, { type CatalogOption, type RelatedProduct, type Supplier } from "@/components/AdminProductCreateForm";
import { nextSkuFromValues } from "@/lib/sku";
import { useAdminI18n } from "@/providers/AdminI18nContext";

type VariantOption = {
  id: string;
  label: string;
  productId: string;
  productName: string;
  wholesalePrice: number;
  retailPrice: number;
  category: string;
  image: string | null;
  size: string;
  stock: number;
};

type InvoiceLine = VariantOption & {
  quantity: number;
  wholesalePrice: number;
  retailPrice: number;
  notes: string;
  batchId?: string;
};

type PendingProductDraft = {
  name: string;
  sku: string;
  skuAuto: boolean;
  category: string;
  description: string;
  subcategory: string;
  brand: string;
  color: string;
  material: string;
  price: string;
  compareAtPrice: string;
  wholesalePrice: string;
  additionalCost: string;
  supplierId: string;
  badge: string;
  featured: boolean;
  bestSeller: boolean;
  lowStockLimit: string;
  images: string[];
  status: string;
  variants: {
    size: string;
    stock: number;
    price?: number | string;
    compareAtPrice?: number | string | null;
    wholesalePrice?: number | string | null;
    additionalCost?: number | string | null;
  }[];
  reviews: unknown[];
  relatedProductIds: string[];
};

type BatchDraft = {
  quantity: string;
  retailPrice: string;
  wholesalePrice: string;
  enabled: boolean;
};

type InvoiceState = {
  status: "idle" | "error";
  message: string;
};

function IntakeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#8B7CC7]/45 bg-[#8B7CC7]/12 px-3.5 py-3 shadow-[0_8px_20px_rgba(139,124,199,0.16)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/65">{label}</p>
      <p className="mt-1 truncate font-playfair text-lg font-bold text-[#5F4A9A]">{value}</p>
    </div>
  );
}

export default function AdminPurchaseInvoiceForm({
  suppliers,
  variants,
  productOptions,
  catalogProducts,
  initialVariantId,
}: {
  suppliers: Supplier[];
  variants: VariantOption[];
  productOptions: CatalogOption[];
  catalogProducts: RelatedProduct[];
  initialVariantId?: string;
}) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(variants.find((variant) => variant.id === initialVariantId)?.productId || "");
  const [batchDrafts, setBatchDrafts] = useState<Record<string, BatchDraft>>({});
  const [retailMode, setRetailMode] = useState<"old" | "new">("old");
  const [wholesaleMode, setWholesaleMode] = useState<"old" | "new">("old");
  const [newRetailPrice, setNewRetailPrice] = useState("");
  const [newWholesalePrice, setNewWholesalePrice] = useState("");
  const [supplierOptions, setSupplierOptions] = useState(suppliers);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [supplierError, setSupplierError] = useState("");
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<"choice" | "batch" | "new">("choice");
  const [pendingProducts, setPendingProducts] = useState<PendingProductDraft[]>([]);
  const [invoiceState, invoiceAction, invoicePending] = useActionState<InvoiceState, FormData>(
    async (_previous, formData) => {
      try {
        await createPurchaseInvoiceAction(formData);
        return { status: "idle", message: "" };
      } catch (error) {
        if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
          throw error;
        }
        return {
          status: "error",
          message: error instanceof Error ? error.message : "Unable to save the invoice.",
        };
      }
    },
    { status: "idle", message: "" },
  );
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [isTransitioningMode, startModeTransition] = useTransition();
  const [collapsedProductIds, setCollapsedProductIds] = useState<Set<string>>(new Set());
  const selectedProductVariants = useMemo(
    () => variants.filter((variant) => variant.productId === selectedProductId),
    [selectedProductId, variants],
  );
  const selectedBatchProduct = selectedProductVariants[0];
  const batchCatalogProducts: ProcurementProduct[] = useMemo(
    () => Array.from(new Map(variants.map((variant) => [variant.productId, { id: variant.productId, name: variant.productName, category: variant.category, image: variant.image }])).values()),
    [variants],
  );

  useEffect(() => {
    if (!addModalOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [addModalOpen]);

  const summary = useMemo(() => ({
    productTypes: lines.filter((line) => !line.batchId).length
      + new Set(lines.map((line) => line.batchId).filter(Boolean)).size
      + pendingProducts.length,
    units: lines.reduce((sum, line) => sum + line.quantity, 0) + pendingProducts.reduce((sum, product) => sum + product.variants.reduce((productSum, variant) => productSum + Number(variant.stock || 0), 0), 0),
    subtotal: lines.reduce((sum, line) => sum + line.quantity * line.wholesalePrice, 0) + pendingProducts.reduce((sum, product) => sum + product.variants.reduce((productSum, variant) => productSum + Number(variant.stock || 0) * Number(variant.wholesalePrice ?? product.wholesalePrice ?? 0), 0), 0),
    retailValue: lines.reduce((sum, line) => sum + line.quantity * line.retailPrice, 0) + pendingProducts.reduce((sum, product) => sum + product.variants.reduce((productSum, variant) => productSum + Number(variant.stock || 0) * Number(variant.price ?? product.price ?? 0), 0), 0),
  }), [lines, pendingProducts]);
  const batchGroups = useMemo(() => {
    const groups = new Map<string, InvoiceLine[]>();
    lines.forEach((line) => {
      if (!line.batchId) return;
      groups.set(line.batchId, [...(groups.get(line.batchId) || []), line]);
    });
    return Array.from(groups.values());
  }, [lines]);

  const handleEmbeddedProductSubmit = (formData: FormData) => {
    const read = (name: string) => String(formData.get(name) || "").trim();
    let productVariants: PendingProductDraft["variants"] = [];
    let reviews: unknown[] = [];
    try {
      productVariants = JSON.parse(read("variants"));
      reviews = JSON.parse(read("reviews"));
    } catch {
      return;
    }
    const images = read("images").split("\n").map((image) => image.trim()).filter(Boolean);
    const draft: PendingProductDraft = {
      name: read("name"),
      sku: read("sku").toUpperCase(),
      skuAuto: read("skuAuto") !== "false",
      category: read("category") || "shoes",
      description: read("description"),
      subcategory: read("subcategory"),
      brand: read("brand"),
      color: read("color"),
      material: read("material"),
      price: read("price"),
      compareAtPrice: read("compareAtPrice"),
      wholesalePrice: read("wholesalePrice"),
      additionalCost: read("additionalCost"),
      supplierId: read("supplierId"),
      badge: read("badge"),
      featured: formData.get("featured") === "on",
      bestSeller: formData.get("bestSeller") === "on",
      lowStockLimit: read("lowStockLimit") || "2",
      images,
      status: read("status") || "active",
      variants: productVariants,
      reviews,
      relatedProductIds: formData.getAll("relatedProductIds").map(String).filter(Boolean),
    };
    setPendingProducts((current) => [...current, draft]);
    setAddModalOpen(false);
    setAddMode("choice");
  };

  useEffect(() => {
    if (!selectedProductVariants.length) return;
    setBatchDrafts((current) => {
      const next = { ...current };
      selectedProductVariants.forEach((variant) => {
        if (!next[variant.id]) next[variant.id] = { quantity: "", retailPrice: String(variant.retailPrice), wholesalePrice: String(variant.wholesalePrice), enabled: true };
      });
      return next;
    });
    setNewRetailPrice(String(selectedBatchProduct?.retailPrice || ""));
    setNewWholesalePrice(String(selectedBatchProduct?.wholesalePrice || ""));
    setRetailMode("old");
    setWholesaleMode("old");
  }, [selectedProductId, selectedBatchProduct, selectedProductVariants]);

  const updateBatchDraft = (variantId: string, field: keyof BatchDraft, value: string | boolean) => {
    setBatchDrafts((current) => ({ ...current, [variantId]: { ...(current[variantId] || { quantity: "", retailPrice: "", wholesalePrice: "", enabled: true }), [field]: value } }));
  };

  const addBatch = () => {
    if (!selectedProductVariants.length) return;
    setIsAddingBatch(true);
    const batchId = `batch-${Date.now()}`;
    const batchLines = selectedProductVariants
      .map((variant) => {
        const draft = batchDrafts[variant.id];
        const quantity = Number(draft?.quantity || 0);
        return quantity > 0 && draft?.enabled !== false ? { ...variant, quantity, wholesalePrice: Number(wholesaleMode === "new" ? newWholesalePrice : draft?.wholesalePrice || variant.wholesalePrice), retailPrice: Number(retailMode === "new" ? newRetailPrice : draft?.retailPrice || variant.retailPrice), notes: "", batchId } : null;
      })
      .filter(Boolean) as InvoiceLine[];
    const newBatchLines = batchLines.filter((line) => !lines.some((current) => current.id === line.id));
    if (!newBatchLines.length) return;
    setLines((current) => [...current, ...newBatchLines]);
    setSelectedProductId("");
    setBatchDrafts({});
    setAddModalOpen(false);
    setAddMode("choice");
    setIsAddingBatch(false);
  };

  const openAddModal = () => {
    setAddMode("choice");
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddMode("choice");
  };

  const closeSupplierModal = () => {
    setSupplierModalOpen(false);
    setNewSupplierName("");
    setSupplierError("");
  };

  const resequencePendingProductSkus = (productsToResequence: PendingProductDraft[]) => {
    const usedSkus = new Set(
      catalogProducts
        .map((product) => product.sku?.trim().toUpperCase())
        .filter((sku): sku is string => Boolean(sku)),
    );

    return productsToResequence.map((product) => {
      if (!product.skuAuto) {
        usedSkus.add(product.sku.trim().toUpperCase());
        return product;
      }

      const sku = nextSkuFromValues(product.category, Array.from(usedSkus));
      usedSkus.add(sku);
      return { ...product, sku };
    });
  };

  const toggleProduct = (id: string) => {
    setCollapsedProductIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createSupplier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newSupplierName.trim();
    if (!name) return;

    setIsCreatingSupplier(true);
    setSupplierError("");
    try {
      const formData = new FormData();
      formData.set("name", name);
      const created = await createSupplierWithResultAction(formData);
      setSupplierOptions((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedSupplier(created.id);
      closeSupplierModal();
    } catch (error) {
      setSupplierError(error instanceof Error ? error.message : "Unable to add supplier.");
    } finally {
      setIsCreatingSupplier(false);
    }
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
    productId: lines.find((line) => line.id === id)?.productId,
    variantSize: lines.find((line) => line.id === id)?.size,
    quantity,
    wholesalePrice,
    retailPrice,
    notes,
  })));

  return (
    <form action={invoiceAction} className="space-y-4 sm:space-y-5 text-right">
      <input type="hidden" name="items" value={serializedLines} />
      <input type="hidden" name="newProducts" value={pendingProducts.length ? JSON.stringify(pendingProducts) : ""} />
      <input type="hidden" name="shippingCost" value="0" />
      <input type="hidden" name="discount" value="0" />
      <input type="hidden" name="amountPaid" value="0" />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr] sm:gap-5">
        <section className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
            {isRtl ? "بيانات فاتورة الشراء" : "Invoice information"}
          </p>
          <h2 className="mt-0.5 sm:mt-1 font-playfair text-lg sm:text-xl font-bold text-[#942E3A]">
            {isRtl ? "المورد وتاريخ الفاتورة" : "Supplier & invoice"}
          </h2>
          <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">
            <label>
              <span className="field-label">{t("suppliers.supplierName")} *</span>
              <input type="hidden" name="supplierId" value={selectedSupplier} />
              <AdminSupplierPicker
                suppliers={supplierOptions}
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                onAddNew={() => setSupplierModalOpen(true)}
              />
            </label>

            <label>
              <span className="field-label">{isRtl ? "تاريخ الفاتورة *" : "Invoice date *"}</span>
              <input name="invoiceDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="admin-input text-right" />
            </label>

            <label className="sm:col-span-2">
              <span className="field-label">{t("orders.notes")}</span>
              <textarea name="notes" rows={3} className="admin-input resize-y text-right" placeholder={isRtl ? "إضافة أية ملاحظات عن شحنة التوريد..." : "Add any notes about this purchase..."} />
            </label>
          </div>
        </section>

        <InvoiceSummary productTypes={summary.productTypes} units={summary.units} subtotal={summary.subtotal} retailValue={summary.retailValue} />
      </div>

      <section className="relative overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#D8B46A]/12 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              {isRtl ? "استلام المخزون" : "Stock receipt"}
            </p>
            <h2 className="mt-1 font-playfair text-xl font-black text-[#942E3A] sm:text-2xl">
              {isRtl ? "المنتجات المسجلة بالفاتورة" : "Products on this invoice"}
            </h2>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] shadow-[0_10px_24px_rgba(148,46,58,0.2)] transition hover:-translate-y-0.5 hover:bg-[#7e2732]"
          >
            <Plus className="h-4 w-4 text-[#D8B46A]" />
            <span>{isRtl ? "إضافة المنتج للفاتورة" : "Add product"}</span>
          </button>
        </div>

        <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
          <IntakeStat label={isRtl ? "الأصناف" : "Products"} value={formatNumber(summary.productTypes)} />
          <IntakeStat label={isRtl ? "القطع" : "Units"} value={formatNumber(summary.units)} />
          <IntakeStat label={isRtl ? "الحالة" : "Status"} value={summary.productTypes ? (isRtl ? "قيد التجهيز" : "In progress") : (isRtl ? "جاهز للإضافة" : "Ready to add")} />
        </div>

        <div className="relative mt-4 space-y-3">
          {pendingProducts.map((pendingProduct, pendingProductIndex) => {
            const pendingProductId = `pending-product-${pendingProductIndex}`;
            return (
            <div key={pendingProductId} className={`rounded-2xl border border-[#D8B46A]/50 bg-[#fff7df] p-3.5 sm:p-5 ${isRtl ? "text-right" : "text-left"}`}>
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => toggleProduct(pendingProductId)} className={`min-w-0 flex-1 ${isRtl ? "text-right" : "text-left"}`}>
                  <span className="mb-1 inline-flex rounded-full bg-[#942E3A] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#D8B46A]">{isRtl ? "منتج جديد" : "New product"}</span>
                  <span className="flex items-center gap-2"><span className="font-playfair text-lg font-bold text-[#942E3A]">{pendingProduct.name}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform ${collapsedProductIds.has(pendingProductId) ? "" : "rotate-180"}`} /></span>
                  <p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">{pendingProduct.sku} · {isRtl ? "منتج جديد سيتم إنشاؤه مع هذه الفاتورة" : "New product to be created with this invoice"}</p>
                </button>
                <button type="button" onClick={() => setPendingProducts((current) => resequencePendingProductSkus(current.filter((_, index) => index !== pendingProductIndex)))} className="text-red-600 p-1" aria-label={isRtl ? "إزالة المنتج الجديد" : "Remove new product"}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {!collapsedProductIds.has(pendingProductId) && <>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "القسم" : "Category"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{pendingProduct.category}</p></div>
                <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "سعر البيع" : "Selling"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{formatPrice(Number(pendingProduct.price) || 0)}</p></div>
                <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "سعر الجملة" : "Wholesale"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{formatPrice(Number(pendingProduct.wholesalePrice) || 0)}</p></div>
                <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "تكلفة إضافية" : "Additional"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{formatPrice(Number(pendingProduct.additionalCost) || 0)}</p></div>
                <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "حد المخزون" : "Low stock"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{pendingProduct.lowStockLimit}</p></div>
              </div>
              <div className="mt-4 overflow-x-auto rounded-xl border border-[#942E3A]/10 bg-white/70">
                <div className="min-w-[620px]">
                <div className="grid grid-cols-5 gap-2 border-b border-[#942E3A]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-[#6B1F2A]/50">
                  <span>{isRtl ? "المقاس / الحجم" : "Size / volume"}</span><span className={isRtl ? "text-left" : "text-right"}>{isRtl ? "الكمية" : "Qty"}</span><span className={isRtl ? "text-left" : "text-right"}>{isRtl ? "سعر البيع" : "Selling"}</span><span className={isRtl ? "text-left" : "text-right"}>{isRtl ? "سعر الجملة" : "Wholesale"}</span><span className={isRtl ? "text-left" : "text-right"}>{isRtl ? "تكلفة إضافية" : "Extra cost"}</span>
                </div>
                {pendingProduct.variants.map((variant) => (
                  <div key={variant.size} className="grid grid-cols-5 gap-2 border-b border-[#942E3A]/8 px-3 py-2.5 text-xs text-[#942E3A] last:border-0">
                    <span className="font-bold">{variant.size}</span>
                    <span className={isRtl ? "text-left" : "text-right"}>{formatNumber(Number(variant.stock) || 0)}</span>
                    <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(Number(variant.price ?? pendingProduct.price) || 0)}</span>
                    <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(Number(variant.wholesalePrice ?? pendingProduct.wholesalePrice) || 0)}</span>
                    <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(Number(variant.additionalCost ?? pendingProduct.additionalCost) || 0)}</span>
                  </div>
                ))}
                <div className="grid grid-cols-5 gap-2 bg-[#FFF9EB] px-3 py-3 text-xs font-bold text-[#942E3A]">
                  <span>{isRtl ? "الإجمالي" : "Total"}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatNumber(pendingProduct.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0))}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(pendingProduct.variants.reduce((sum, variant) => sum + Number(variant.stock || 0) * Number(variant.price ?? pendingProduct.price ?? 0), 0))}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(pendingProduct.variants.reduce((sum, variant) => sum + Number(variant.stock || 0) * Number(variant.wholesalePrice ?? pendingProduct.wholesalePrice ?? 0), 0))}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(pendingProduct.variants.reduce((sum, variant) => sum + Number(variant.stock || 0) * Number(variant.additionalCost ?? pendingProduct.additionalCost ?? 0), 0))}</span>
                </div>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-[#6B1F2A]/65">
                {formatNumber(pendingProduct.variants.length)} {isRtl ? "موديلات" : "variants"} · {formatNumber(pendingProduct.variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0))} {isRtl ? "قطعة ستتم إضافتها لهذه الفاتورة." : "units will be added to this invoice."}
              </p>
              </>}
              {collapsedProductIds.has(pendingProductId) && (
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "القسم" : "Category"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{pendingProduct.category}</p></div>
                  <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "سعر البيع" : "Selling"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{formatPrice(Number(pendingProduct.price) || 0)}</p></div>
                  <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "سعر الجملة" : "Wholesale"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{formatPrice(Number(pendingProduct.wholesalePrice) || 0)}</p></div>
                  <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "تكلفة إضافية" : "Additional"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{formatPrice(Number(pendingProduct.additionalCost) || 0)}</p></div>
                  <div className="rounded-xl bg-white/70 p-2.5"><p className="text-[9px] uppercase tracking-wide text-[#6B1F2A]/50">{isRtl ? "حد المخزون" : "Low stock"}</p><p className="mt-1 text-xs font-bold text-[#942E3A]">{pendingProduct.lowStockLimit}</p></div>
                </div>
              )}
            </div>
            );
          })}
          {batchGroups.map((group) => {
            const totalQuantity = group.reduce((sum, line) => sum + line.quantity, 0);
            const totalWholesale = group.reduce((sum, line) => sum + line.quantity * line.wholesalePrice, 0);
            const totalRetail = group.reduce((sum, line) => sum + line.quantity * line.retailPrice, 0);
            return (
            <div key={group[0].batchId} className={`rounded-2xl border border-[#942E3A]/15 bg-white p-3.5 sm:p-4 ${isRtl ? "text-right" : "text-left"}`}>
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => toggleProduct(group[0].batchId || group[0].productId)} className={`min-w-0 flex-1 ${isRtl ? "text-right" : "text-left"}`}>
                  <span className="mb-1 inline-flex rounded-full bg-[#D8B46A] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#942E3A]">{isRtl ? "دفعة جديدة" : "New batch"}</span>
                  <span className="flex items-center gap-2"><span className="font-playfair text-lg font-bold text-[#942E3A]">{group[0].productName}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform ${collapsedProductIds.has(group[0].batchId || group[0].productId) ? "" : "rotate-180"}`} /></span>
                  <p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">{isRtl ? "استلام مخزون جديد" : "New stock receipt"} · {formatNumber(group.length)} {isRtl ? "مقاسات / أحجام" : "sizes / volumes"}</p>
                </button>
                <button type="button" onClick={() => setLines((current) => current.filter((line) => line.batchId !== group[0].batchId))} className="p-1 text-red-600" aria-label={isRtl ? "إزالة الدفعة" : "Remove batch"}><Trash2 className="h-4 w-4" /></button>
              </div>
              {!collapsedProductIds.has(group[0].batchId || group[0].productId) && <div className="mt-3 overflow-x-auto rounded-xl border border-[#942E3A]/10">
                <div className="min-w-[560px]">
                <div className="grid grid-cols-4 gap-2 bg-[#FFF9EB] px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-[#6B1F2A]/55"><span>{isRtl ? "المقاس / الحجم" : "Size / volume"}</span><span className={isRtl ? "text-left" : "text-right"}>{isRtl ? "الكمية" : "Qty"}</span><span className={isRtl ? "text-left" : "text-right"}>{isRtl ? "سعر البيع / للقطعة" : "Selling / unit"}</span><span className={isRtl ? "text-left" : "text-right"}>{isRtl ? "سعر الجملة / للقطعة" : "Wholesale / unit"}</span></div>
                {group.map((line) => <div key={line.id} className="grid grid-cols-4 gap-2 border-t border-[#942E3A]/8 px-3 py-2.5 text-xs text-[#942E3A]"><span className="font-bold">{line.size}</span><span className={isRtl ? "text-left" : "text-right"}>{formatNumber(line.quantity)}</span><span className={isRtl ? "text-left" : "text-right"}>{formatPrice(line.retailPrice)}</span><span className={isRtl ? "text-left" : "text-right"}>{formatPrice(line.wholesalePrice)}</span></div>)}
                <div className="grid grid-cols-4 gap-2 border-t border-[#D8B46A]/45 bg-[#FFF9EB] px-3 py-3 text-xs font-bold text-[#942E3A]"><span>{isRtl ? "الإجمالي" : "Total"}</span><span className={isRtl ? "text-left" : "text-right"}>{formatNumber(totalQuantity)} {isRtl ? "قطعة" : "pieces"}</span><span className={isRtl ? "text-left" : "text-right"}>{formatPrice(totalRetail)} {isRtl ? "إجمالي البيع" : "selling total"}</span><span className={isRtl ? "text-left" : "text-right"}>{formatPrice(totalWholesale)} {isRtl ? "إجمالي الشراء" : "purchase total"}</span></div>
                </div>
              </div>}
              {collapsedProductIds.has(group[0].batchId || group[0].productId) && (
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-[#D8B46A]/40 bg-[#FFF9EB] px-3 py-3 text-xs font-bold text-[#942E3A]">
                  <span>{formatNumber(totalQuantity)} {isRtl ? "قطعة" : "pieces"}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(totalWholesale)} {isRtl ? "إجمالي الشراء" : "purchase total"}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(totalRetail)} {isRtl ? "إجمالي البيع" : "selling total"}</span>
                </div>
              )}
            </div>
            );
          })}
          {lines.filter((line) => !line.batchId).map((line) => (
            <div key={line.id} className={`rounded-2xl bg-[#FFF9EB]/70 p-3.5 sm:p-4 ${isRtl ? "text-right" : "text-left"}`}>
              <div className="flex items-start justify-between gap-3">
                <button type="button" onClick={() => toggleProduct(line.id)} className={`min-w-0 flex-1 ${isRtl ? "text-right" : "text-left"}`}>
                  <span className="flex items-center gap-2"><span className="font-bold text-[#942E3A] text-xs sm:text-sm">{line.productName}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform ${collapsedProductIds.has(line.id) ? "" : "rotate-180"}`} /></span>
                  <p className="mt-0.5 text-[10px] text-[#6B1F2A]/60">{line.label}</p>
                </button>
                <button type="button" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="text-red-600 p-1" aria-label={isRtl ? "إزالة المنتج" : "Remove product"}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {!collapsedProductIds.has(line.id) && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                <label>
                  <span className="field-label">{isRtl ? "الكمية" : "Quantity"}</span>
                  <input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", event.target.value)} className="admin-input text-right" />
                </label>

                <label>
                  <span className="field-label">{isRtl ? "سعر الشراء / للقطعة" : "Wholesale / unit"}</span>
                  <input type="number" min="0" step="0.01" value={line.wholesalePrice} onChange={(event) => updateLine(line.id, "wholesalePrice", event.target.value)} className="admin-input text-right" />
                </label>

                <label>
                  <span className="field-label">{isRtl ? "سعر البيع / للقطعة" : "Selling / unit"}</span>
                  <input type="number" min="0" step="0.01" value={line.retailPrice} onChange={(event) => updateLine(line.id, "retailPrice", event.target.value)} className="admin-input text-right" />
                </label>

                <div>
                  <span className="field-label">{isRtl ? "إجمالي البند" : "Line total"}</span>
                  <p className="admin-input flex items-center font-bold text-[#942E3A]">
                    {formatPrice(line.quantity * line.wholesalePrice)}
                  </p>
                </div>
              </div>}
              {collapsedProductIds.has(line.id) && (
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-[#D8B46A]/40 bg-white/70 px-3 py-3 text-xs font-bold text-[#942E3A]">
                  <span>{formatNumber(line.quantity)} {isRtl ? "قطعة" : "pieces"}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(line.quantity * line.wholesalePrice)} {isRtl ? "إجمالي الشراء" : "purchase total"}</span>
                  <span className={isRtl ? "text-left" : "text-right"}>{formatPrice(line.quantity * line.retailPrice)} {isRtl ? "إجمالي البيع" : "selling total"}</span>
                </div>
              )}
            </div>
          ))}

          {!lines.length && !pendingProducts.length && (
            <div className="rounded-2xl border border-dashed border-[#D8B46A]/60 py-8 text-center text-xs text-[#6B1F2A]/60 sm:py-12">
              {isRtl ? "اختر أحد منتجات الكتالوج أعلاه لإضافته للفاتورة." : "Choose a product variant above to start the invoice."}
            </div>
          )}
        </div>
      </section>

      {addModalOpen && typeof document !== "undefined" && createPortal(
        (
          <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#8B7CC7]/45 p-3 backdrop-blur-[2px] sm:p-6"
          role="dialog"
          aria-modal="true"
          dir={isRtl ? "rtl" : "ltr"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddModal();
          }}
        >
          <div data-lenis-prevent className={`admin-modal-scroll hide-scrollbar w-full max-w-5xl rounded-3xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-4 shadow-2xl sm:p-7 ${addMode === "new" ? "h-[calc(100dvh-1.5rem)] max-h-[calc(100dvh-1.5rem)] touch-pan-y overflow-y-scroll overscroll-contain sm:h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-3rem)]" : "max-h-[calc(100dvh-1.5rem)] overflow-y-auto overscroll-contain sm:max-h-[calc(100dvh-3rem)]"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
                  {isRtl ? "إدخال المنتجات" : "Product intake"}
                </p>
                <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
                  {addMode === "choice"
                    ? (isRtl ? "إضافة إلى هذه الفاتورة" : "Add to this invoice")
                    : addMode === "batch"
                      ? (isRtl ? "إضافة دفعة من الكتالوج" : "Add an existing batch")
                      : (isRtl ? "إنشاء منتج جديد" : "Create a new product")}
                </h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">
                  {addMode === "choice"
                    ? (isRtl ? "اختر كيف تريد بناء سطر المخزون التالي." : "Choose how you want to build the next stock line.")
                    : addMode === "batch"
                      ? (isRtl ? "اختر صنفاً من الكتالوج ثم حدد التكلفة والكمية." : "Pick a catalog variant, then add its cost and quantity below.")
                      : (isRtl ? "أكمل تجهيز المنتج بالكامل دون مغادرة الفاتورة." : "Complete the product setup without leaving the invoice.")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAddModal}
                className="rounded-full p-2 text-[#942E3A] transition hover:bg-[#FFF9EB]"
                aria-label={isRtl ? "إغلاق نافذة إضافة المنتج" : "Close add product modal"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addMode === "choice" && (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => startModeTransition(() => setAddMode("new"))}
                  disabled={isTransitioningMode}
                  className={`group rounded-3xl border border-[#942E3A]/12 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D8B46A] sm:p-6 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#942E3A] text-[#D8B46A]">
                    <FilePlus2 className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-playfair text-xl font-bold text-[#942E3A]">
                    {isRtl ? "منتج جديد" : "New product"}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#6B1F2A]/65">
                    {isRtl ? "إنشاء المنتج بالكامل والموديلات والأسعار ومعرض الصور داخل هذه النافذة." : "Create the complete product, variants, pricing and gallery in this modal."}
                  </p>
                  <span className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-wider text-[#942E3A]">
                    {isRtl ? "فتح محرر المنتج ←" : "Open product editor →"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => startModeTransition(() => setAddMode("batch"))}
                  disabled={isTransitioningMode}
                  className={`group rounded-3xl border border-[#D8B46A]/50 bg-[#fff7df] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#942E3A] sm:p-6 ${isRtl ? "text-right" : "text-left"}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#942E3A]">
                    <Boxes className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-playfair text-xl font-bold text-[#942E3A]">
                    {isRtl ? "دفعة حالية" : "Existing batch"}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#6B1F2A]/65">
                    {isRtl ? "اختر موديل منتج موجود بالفعل في الكتالوج وأضفه إلى هذه الفاتورة." : "Select a product variant already in the catalog and add it to this invoice."}
                  </p>
                  <span className="mt-5 inline-flex text-[10px] font-bold uppercase tracking-wider text-[#942E3A]">
                    {isRtl ? "اختر من الكتالوج ←" : "Choose from catalog →"}
                  </span>
                </button>
              </div>
            )}

            {addMode === "batch" && (
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={() => setAddMode("choice")}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#942E3A]/12 bg-white px-3 py-2 text-xs font-bold text-[#942E3A]"
                >
                  <ArrowLeft className={`h-3.5 w-3.5 ${isRtl ? "rotate-180" : ""}`} /> {isRtl ? "رجوع" : "Back"}
                </button>
                <div className="rounded-3xl border border-[#D8B46A]/40 bg-gradient-to-br from-[#FFF9EB] to-white p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">{isRtl ? "دفعة من الكتالوج" : "Catalog batch"}</p>
                  <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">{isRtl ? "اختر موديل المنتج" : "Choose a product variant"}</h3>
                  <div className="mt-4">
                    <AdminCatalogProductPicker products={batchCatalogProducts} value={selectedProductId} onChange={setSelectedProductId} />
                  </div>
                  {selectedProductId && selectedBatchProduct && (
                    <div className="mt-4 space-y-4 rounded-2xl border border-[#942E3A]/10 bg-white p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-playfair text-lg font-bold text-[#942E3A]">{selectedBatchProduct.productName}</p>
                          <p className="text-[10px] text-[#6B1F2A]/60">{isRtl ? "حدد الكميات لكل مقاس / حجم." : "Select quantities for each size / volume."}</p>
                        </div>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button type="button" onClick={() => setRetailMode("old")} className={`rounded-full px-3 py-1.5 ${retailMode === "old" ? "bg-[#942E3A] text-white" : "bg-[#FFF9EB] text-[#942E3A]"}`}>{isRtl ? "سعر البيع الحالي" : "Old selling price"}</button>
                          <button type="button" onClick={() => setRetailMode("new")} className={`rounded-full px-3 py-1.5 ${retailMode === "new" ? "bg-[#942E3A] text-white" : "bg-[#FFF9EB] text-[#942E3A]"}`}>{isRtl ? "سعر بيع جديد" : "New selling price"}</button>
                        </div>
                      </div>
                      {retailMode === "new" && <input type="number" min="0" step="0.01" value={newRetailPrice} onChange={(event) => setNewRetailPrice(event.target.value)} className="admin-input text-right" placeholder={isRtl ? "سعر بيع جديد" : "New selling price"} />}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#942E3A]/10 pt-4">
                        <p className="text-xs font-bold text-[#942E3A]">{isRtl ? "سعر الجملة لهذه الدفعة" : "Wholesale price for this batch"}</p>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <button type="button" onClick={() => setWholesaleMode("old")} className={`rounded-full px-3 py-1.5 ${wholesaleMode === "old" ? "bg-[#942E3A] text-white" : "bg-[#FFF9EB] text-[#942E3A]"}`}>{isRtl ? "سعر الجملة الحالي" : "Old wholesale"}</button>
                          <button type="button" onClick={() => setWholesaleMode("new")} className={`rounded-full px-3 py-1.5 ${wholesaleMode === "new" ? "bg-[#942E3A] text-white" : "bg-[#FFF9EB] text-[#942E3A]"}`}>{isRtl ? "سعر جملة جديد" : "New wholesale"}</button>
                        </div>
                      </div>
                      {wholesaleMode === "new" && <input type="number" min="0" step="0.01" value={newWholesalePrice} onChange={(event) => setNewWholesalePrice(event.target.value)} className="admin-input text-right" placeholder={isRtl ? "سعر جملة جديد" : "New wholesale price"} />}
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {selectedProductVariants.map((variant) => (
                          <div key={variant.id} className="rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/65 p-3 text-xs text-[#942E3A]">
                            <div className="flex items-center justify-between"><span className="font-bold">EU {variant.size}</span><span className="text-[10px] text-[#6B1F2A]/60">{isRtl ? "الحالي: " : "Current: "}{formatNumber(variant.stock)}</span></div>
                            <label className="mt-2 block"><span className="mb-1 block text-[9px] uppercase tracking-wide text-[#6B1F2A]/55">{isRtl ? "الكمية المستلمة" : "Receive quantity"}</span>
                            <input type="number" min="0" value={batchDrafts[variant.id]?.quantity || ""} onChange={(event) => updateBatchDraft(variant.id, "quantity", event.target.value)} className="admin-input h-9 px-2 text-right" placeholder="0" />
                            </label>
                            <button type="button" onClick={() => updateBatchDraft(variant.id, "enabled", batchDrafts[variant.id]?.enabled === false)} className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold ${batchDrafts[variant.id]?.enabled !== false ? "bg-[#942E3A] text-white" : "border border-[#D8B46A] text-[#942E3A]"}`}><Check className="h-3.5 w-3.5" /> {batchDrafts[variant.id]?.enabled !== false ? (isRtl ? "مضمن" : "Included") : (isRtl ? "مستبعد" : "Excluded")}</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addBatch}
                    disabled={isAddingBatch || !selectedProductId || !selectedProductVariants.some((variant) => Number(batchDrafts[variant.id]?.quantity || 0) > 0) || (retailMode === "new" && !newRetailPrice) || (wholesaleMode === "new" && !newWholesalePrice)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isAddingBatch ? <LoaderCircle className="h-4 w-4 animate-spin text-[#D8B46A]" /> : <PackagePlus className="h-4 w-4 text-[#D8B46A]" />} {isAddingBatch ? (isRtl ? "جاري الإضافة..." : "Adding…") : (isRtl ? "إضافة للفاتورة" : "Add to invoice")}
                  </button>
                </div>
              </div>
            )}

            {addMode === "new" && (
              <div className="mt-6">
                <AdminProductCreateForm
                  options={productOptions}
                  suppliers={suppliers}
                  products={catalogProducts}
                  reservedSkus={pendingProducts.map((product) => product.sku)}
                  embedded
                  onCancel={closeAddModal}
                  onEmbeddedSubmit={handleEmbeddedProductSubmit}
                />
              </div>
            )}
          </div>
          </div>
        ),
        document.body,
      )}

      {supplierModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#8B7CC7]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-supplier-title"
          dir={isRtl ? "rtl" : "ltr"}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSupplierModal();
          }}
        >
          <form onSubmit={createSupplier} className="w-full max-w-md rounded-3xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">{isRtl ? "المورد" : "Supplier"}</p>
                <h2 id="add-supplier-title" className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">{isRtl ? "إضافة مورد جديد" : "Add new supplier"}</h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">{isRtl ? "أضف الاسم الآن، ويمكنك إكمال تفاصيل المورد لاحقًا." : "Add the name now; you can complete the supplier details later."}</p>
              </div>
              <button type="button" onClick={closeSupplierModal} className="rounded-full p-2 text-[#942E3A] hover:bg-[#FFF9EB]" aria-label={isRtl ? "إغلاق نافذة إضافة المورد" : "Close add supplier modal"}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mt-6 block">
              <span className="field-label">{isRtl ? "اسم المورد / المصنع *" : "Supplier / factory name *"}</span>
              <input autoFocus required value={newSupplierName} onChange={(event) => setNewSupplierName(event.target.value)} className="admin-input" placeholder={isRtl ? "أدخل اسم المورد أو المصنع" : "Enter supplier name"} />
            </label>
            {supplierError && <p className="mt-2 text-xs font-semibold text-red-600">{supplierError}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={closeSupplierModal} className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#942E3A]">{isRtl ? "إلغاء" : "Cancel"}</button>
              <button type="submit" disabled={isCreatingSupplier || !newSupplierName.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40">
                {isCreatingSupplier && <LoaderCircle className="h-4 w-4 animate-spin text-[#D8B46A]" />}
                {isCreatingSupplier ? (isRtl ? "جاري الإنشاء..." : "Creating...") : (isRtl ? "إضافة المورد" : "Create supplier")}
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}

      {invoiceState.status === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
          {invoiceState.message}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <Link href="/admin/suppliers" className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-center text-xs font-bold text-[#942E3A] shrink-0 sm:px-5 sm:py-3">
          {t("common.cancel")}
        </Link>
        <button
          type="submit"
          disabled={invoicePending || !selectedSupplier || (!lines.length && !pendingProducts.length)}
          className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:py-3"
        >
          {invoicePending ? <><LoaderCircle className="mr-2 inline-block h-4 w-4 animate-spin" /> {isRtl ? "جاري حفظ الفاتورة..." : "Saving invoice…"}</> : (isRtl ? "حفظ الفاتورة وتأكيد استلام المخزون" : "Save invoice & receive stock")}
        </button>
      </div>
    </form>
  );
}

function InvoiceSummary({ productTypes, units, subtotal, retailValue }: { productTypes: number; units: number; subtotal: number; retailValue: number }) {
  const { lang, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  return (
    <section className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-xs sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
            {isRtl ? "ملخص الشراء" : "Live overview"}
          </p>
          <h2 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
            {isRtl ? "إجمالي الفاتورة" : "Invoice summary"}
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[#942E3A]">
          <Receipt className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <SummaryMetric icon={<FileText />} label={isRtl ? "الأصناف" : "Products"} value={formatNumber(productTypes)} />
        <SummaryMetric icon={<PackageIcon />} label={isRtl ? "القطع" : "Units"} value={formatNumber(units)} />
      </div>

      <div className="mt-3 space-y-3 rounded-2xl bg-white/65 p-4 text-xs text-[#6B1F2A]">
        <p className="flex items-center justify-between gap-3">
          <span>{isRtl ? "إجمالي الشراء بالجملة" : "Purchase total"}</span>
          <strong className="font-playfair text-xl text-[#942E3A]">{formatPrice(subtotal)}</strong>
        </p>

        <p className="flex items-center justify-between gap-3 border-t border-[#942E3A]/10 pt-3">
          <span>{isRtl ? "القيمة البيعية المتوقعة" : "Expected retail value"}</span>
          <strong className="text-[#942E3A]">{formatPrice(retailValue)}</strong>
        </p>

        <p className="flex items-center gap-2 pt-1 text-[10px] font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{isRtl ? "جاهز لإضافة القطع فور الحفظ" : "Ready to receive stock"}</span>
        </p>
      </div>
    </section>
  );
}

function SummaryMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/65 p-3">
      <div className="text-[#D8B46A]">{icon}</div>
      <p className="mt-3 text-[9px] uppercase tracking-wide text-[#6B1F2A]/55">{label}</p>
      <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">{value}</p>
    </div>
  );
}

function PackageIcon() {
  return <Wallet className="h-4 w-4" />;
}

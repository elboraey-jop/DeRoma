"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  GripVertical,
  ImagePlus,
  PackagePlus,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { createProductAction } from "@/app/admin/products/actions";
import { updateProductAction } from "@/app/admin/products/[id]/actions";
import { createCatalogOptionAction } from "@/app/admin/products/categories/actions";
import { createSupplierWithResultAction } from "@/app/admin/suppliers/actions";
import AdminImageGalleryField from "@/components/AdminImageGalleryField";
import { AdminCatalogProductPicker } from "@/components/AdminProcurementPickers";
import { useToast } from "@/providers/ToastProvider";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export type CatalogOption = {
  category: string;
  type: string;
  name: string;
  value: string | null;
};
export type Supplier = { id: string; name: string };
export type RelatedProduct = {
  id: string;
  name: string;
  category: string;
  sku?: string | null;
  image: string | null;
};
type VariantDraft = { size: string; stock: number };
type PerfumePriceDraft = {
  price: string;
  compareAtPrice: string;
  wholesalePrice: string;
  additionalCost: string;
};
type ReviewDraft = {
  id?: string;
  customerName: string;
  rating: number;
  body: string;
};
type BrandState = {
  status: "idle" | "success" | "error";
  message: string;
  value: string;
};
type SupplierState = {
  status: "idle" | "success" | "error";
  message: string;
  id: string;
  name: string;
};
type EditProduct = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  status: string;
  description: string | null;
  brand: string | null;
  color: string | null;
  subcategory: string | null;
  material: string | null;
  images: string[];
  price: number;
  compareAtPrice: number | null;
  wholesalePrice: number | null;
  additionalCost: number | null;
  supplierId: string | null;
  lowStockLimit: number;
  featured: boolean;
  bestSeller: boolean;
  variants: Array<{
    id: string;
    size: string;
    stock: number;
    price: number | null;
    compareAtPrice: number | null;
    wholesalePrice: number | null;
    additionalCost: number | null;
  }>;
  relatedIds: string[];
  reviews: Array<{
    id?: string;
    customerName: string;
    rating: number;
    body: string;
  }>;
};
const reviewStep = { label: "Reviews", caption: "Social proof" };

const categories = [
  { key: "shoes", label: "Shoes" },
  { key: "bags", label: "Bags" },
  { key: "perfumes", label: "Perfumes" },
  { key: "accessories", label: "Accessories" },
];

const categoryHelp: Record<string, string> = {
  shoes: "Choose the shoe brand and color, then add stock per size.",
  bags: "Choose the bag category, brand and color, then add stock per size.",
  perfumes:
    "Choose the perfume brand and volume in ml, then add stock per bottle size.",
  accessories:
    "Choose the accessory category, brand and material, then add its stock options.",
};

const productSteps = [
  { label: "Identity", caption: "Name & category" },
  { label: "Gallery", caption: "Images & media" },
  { label: "Inventory", caption: "Variants & stock" },
  { label: "Relations", caption: "Similar products" },
  { label: "Pricing", caption: "Costs & visibility" },
];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41"];

function skuPrefix(category: string) {
  return category === "shoes"
    ? "S"
    : category === "bags"
      ? "B"
      : category === "perfumes"
        ? "P"
        : "A";
}

function nextSku(category: string, products: RelatedProduct[]) {
  const prefix = skuPrefix(category);
  const highest = products.reduce((max, product) => {
    if (product.category !== category) return max;
    const match = product.sku?.match(new RegExp(`^${prefix}(\\d+)$`, "i"));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

const COLOR_PALETTE = [
  { value: "White", hex: "#FFFFFF" },
  { value: "Beige", hex: "#E8D9C5" },
  { value: "Black", hex: "#111111" },
  { value: "Grey", hex: "#8E8E86" },
  { value: "Pink", hex: "#E8A7A1" },
  { value: "Brown", hex: "#5C4033" },
  { value: "Burgundy", hex: "#6F1F2D" },
  { value: "Navy", hex: "#1F365D" },
  { value: "Silver", hex: "#C4C8CE" },
  { value: "Gold", hex: "#D4AF37" },
  { value: "Red", hex: "#942E3A" },
  { value: "Green", hex: "#557A57" },
];

function getColorSwatch(color: string) {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  return (
    COLOR_PALETTE.find(
      (item) => item.value.toLowerCase() === color.toLowerCase(),
    )?.hex || "#D8B46A"
  );
}

function AdminDropdown({
  name,
  label,
  values,
  placeholder,
  defaultValue = "",
  required = false,
  colorMode = false,
  brandMode = false,
  optionCategory = "",
  optionType = "",
  categoryMode = false,
  materialMode = false,
}: {
  name: string;
  label: string;
  values: Array<{ value: string; label: string }>;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
  colorMode?: boolean;
  brandMode?: boolean;
  optionCategory?: string;
  optionType?: string;
  categoryMode?: boolean;
  materialMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [customHex, setCustomHex] = useState("#942E3A");
  const [customColorName, setCustomColorName] = useState("");
  const [customColorSwatches, setCustomColorSwatches] = useState<Record<string, string>>({});
  const [colorPending, setColorPending] = useState(false);
  const [colorError, setColorError] = useState("");
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [customBrand, setCustomBrand] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [brandState, brandAction, brandPending] = useActionState<
    BrandState,
    FormData
  >(
    async (_previous, formData) => {
      try {
        await createCatalogOptionAction(formData);
        return {
          status: "success" as const,
          message: "Brand added successfully.",
          value: String(formData.get("name") || "").trim(),
        };
      } catch (error) {
        return {
          status: "error" as const,
          message:
            error instanceof Error
              ? error.message
              : "Unable to add this brand.",
          value: "",
        };
      }
    },
    { status: "idle" as const, message: "", value: "" },
  );
  const [categoryState, categoryAction, categoryPending] = useActionState<
    BrandState,
    FormData
  >(
    async (_previous, formData) => {
      try {
        await createCatalogOptionAction(formData);
        return {
          status: "success" as const,
          message: "Category added successfully.",
          value: String(formData.get("name") || "").trim(),
        };
      } catch (error) {
        return {
          status: "error" as const,
          message:
            error instanceof Error
              ? error.message
              : "Unable to add this category.",
          value: "",
        };
      }
    },
    { status: "idle" as const, message: "", value: "" },
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = values.find((item) => item.value === value);
  const selectedLabel =
    selected?.label || ((colorMode || brandMode) && value ? value : "");
  const selectedColorSwatch = customColorSwatches[value] || getColorSwatch(value);

  const addCustomColor = async () => {
    const name = customColorName.trim();
    if (!name || !optionCategory || !optionType) return;

    setColorPending(true);
    setColorError("");
    try {
      const formData = new FormData();
      formData.set("category", optionCategory);
      formData.set("type", optionType);
      formData.set("name", name);
      formData.set("value", customHex);
      await createCatalogOptionAction(formData);

      setCustomColorSwatches((current) => ({ ...current, [name]: customHex }));
      setValue(name);
      setCustomColorName("");
      setPaletteOpen(false);
      setOpen(false);
    } catch (error) {
      setColorError(error instanceof Error ? error.message : "Unable to add this color.");
    } finally {
      setColorPending(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (brandState.status === "success") {
      setValue(brandState.value);
      setCustomBrand("");
      setBrandModalOpen(false);
      setOpen(false);
    }
  }, [brandState.status, brandState.value]);

  useEffect(() => {
    if (categoryState.status === "success") {
      setValue(categoryState.value);
      setCustomCategory("");
      setCategoryModalOpen(false);
      setOpen(false);
    }
  }, [categoryState.status, categoryState.value]);

  return (
    <div ref={dropdownRef} className="relative">
      <span className="field-label">{label}</span>
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        disabled={
          !values.length &&
          !colorMode &&
          !brandMode &&
          !categoryMode &&
          !materialMode
        }
        onClick={() => setOpen((current) => !current)}
        className={`admin-input flex w-full items-center justify-between text-left ${!values.length && !colorMode && !brandMode && !categoryMode && !materialMode ? "cursor-not-allowed opacity-60" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={
            selectedLabel
              ? "flex items-center gap-2 text-[#942E3A]"
              : "text-[#6B1F2A]/60"
          }
        >
          {selectedLabel && colorMode && (
            <span
              className="h-4 w-4 rounded-full border border-[#942E3A]/15"
              style={{ backgroundColor: selectedColorSwatch }}
            />
          )}
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#D8B46A] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open &&
        (values.length > 0 ||
          colorMode ||
          brandMode ||
          categoryMode ||
          materialMode) && (
          <div
            onWheel={(event) => event.stopPropagation()}
            className="hide-scrollbar overscroll-contain absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-56 overflow-y-auto rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-1.5 shadow-[0_18px_40px_rgba(67,25,31,0.18)]"
            role="listbox"
          >
            {colorMode && (
              <>
                <button
                  type="button"
                  onClick={() => setPaletteOpen((current) => !current)}
                  className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#D8B46A]/70 px-3 py-2.5 text-left text-xs font-bold text-[#942E3A] hover:bg-[#F2DFC0]"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D8B46A] text-[#942E3A]">
                    +
                  </span>
                  Add new color
                  <ChevronDown
                    className={`ml-auto h-3.5 w-3.5 text-[#D8B46A] transition-transform ${paletteOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </>
            )}
            {(brandMode || categoryMode || materialMode) && (
              <button
                type="button"
                onClick={() => {
                  if (categoryMode || materialMode) {
                    setCustomCategory("");
                    setCategoryModalOpen(true);
                  } else {
                    setCustomBrand("");
                    setBrandModalOpen(true);
                  }
                }}
                className="mb-1 flex w-full items-center gap-2 rounded-xl border border-dashed border-[#D8B46A]/70 px-3 py-2.5 text-left text-xs font-bold text-[#942E3A] hover:bg-[#F2DFC0]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D8B46A] text-[#942E3A]">
                  +
                </span>
                Add new{" "}
                {materialMode
                  ? "material"
                  : categoryMode
                    ? "category"
                    : "brand"}
              </button>
            )}
            {values.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setValue(item.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${item.value === value ? "bg-[#942E3A] font-bold text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}
                role="option"
                aria-selected={item.value === value}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={
                      colorMode
                        ? "h-4 w-4 rounded-full border border-[#942E3A]/15"
                        : "hidden"
                    }
                    style={
                      colorMode
                        ? { backgroundColor: getColorSwatch(item.value) }
                        : undefined
                    }
                  />
                  {item.label}
                </span>
                {item.value === value && (
                  <Check className="h-3.5 w-3.5 text-[#D8B46A]" />
                )}
              </button>
            ))}
          </div>
        )}
      {paletteOpen && colorMode && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B7CC7]/30 p-4 backdrop-blur-[2px]"
          onMouseDown={() => setPaletteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-5 shadow-[0_24px_70px_rgba(67,25,31,0.28)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  Product color
                </p>
                <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                  Add new color
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="rounded-full px-2 py-1 text-lg text-[#942E3A]/55 hover:bg-[#F2DFC0]"
              >
                ×
              </button>
            </div>
            <label className="mt-5 block">
              <span className="field-label">Color name *</span>
              <input
                value={customColorName}
                onChange={(event) => setCustomColorName(event.target.value)}
                className="admin-input"
                placeholder="e.g. Burgundy"
                autoFocus
              />
            </label>
            <div className="mt-4 rounded-2xl border border-[#D8B46A]/35 bg-white p-4">
              <label className="flex cursor-pointer flex-col items-center gap-3">
                <span
                  className="h-28 w-full rounded-2xl border border-[#942E3A]/15 shadow-inner"
                  style={{ backgroundColor: customHex }}
                />
                <span className="text-xs font-bold text-[#942E3A]">
                  Move through the color palette
                </span>
                <input
                  type="color"
                  value={customHex}
                  onChange={(event) => setCustomHex(event.target.value)}
                  className="h-12 w-full cursor-pointer rounded-xl border-0 bg-transparent p-0"
                />
              </label>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB] px-3 py-2">
                <span
                  className="h-5 w-5 rounded-full border border-[#942E3A]/15"
                  style={{ backgroundColor: customHex }}
                />
                <span className="font-mono text-xs font-bold uppercase text-[#942E3A]">
                  {customHex}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#942E3A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addCustomColor}
                disabled={!customColorName.trim() || colorPending}
                className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {colorPending ? "Adding..." : "Use this color"}
              </button>
            </div>
            {colorError && <p className="mt-3 text-xs font-semibold text-red-600">{colorError}</p>}
          </div>
        </div>
      )}
      {brandModalOpen && brandMode && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B7CC7]/30 p-4 backdrop-blur-[2px]"
          onMouseDown={() => setBrandModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-5 shadow-[0_24px_70px_rgba(67,25,31,0.28)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  Product catalog
                </p>
                <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                  Add new brand
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBrandModalOpen(false)}
                className="rounded-full px-2 py-1 text-lg text-[#942E3A]/55 hover:bg-[#F2DFC0]"
              >
                ×
              </button>
            </div>
            <form
              action={brandAction}
              onSubmit={(event) => event.stopPropagation()}
              className="mt-5 space-y-4"
            >
              <input type="hidden" name="category" value={optionCategory} />
              <input type="hidden" name="type" value={optionType} />
              <label>
                <span className="field-label">Brand name</span>
                <input
                  name="name"
                  value={customBrand}
                  onChange={(event) => setCustomBrand(event.target.value)}
                  required
                  autoFocus
                  className="admin-input"
                  placeholder="e.g. Puma"
                />
              </label>
              {brandState.status === "error" && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-[11px] font-semibold leading-4 text-red-700">
                  {brandState.message}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#942E3A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={brandPending || !customBrand.trim()}
                  className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-wait disabled:opacity-50"
                >
                  {brandPending ? "Adding..." : "Add brand"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
      {categoryModalOpen && (categoryMode || materialMode) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B7CC7]/30 p-4 backdrop-blur-[2px]"
          onMouseDown={() => setCategoryModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-5 shadow-[0_24px_70px_rgba(67,25,31,0.28)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  Product catalog
                </p>
                <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                  Add new {materialMode ? "material" : "category"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="rounded-full px-2 py-1 text-lg text-[#942E3A]/55 hover:bg-[#F2DFC0]"
              >
                ×
              </button>
            </div>
            <form action={categoryAction} className="mt-5 space-y-4">
              <input type="hidden" name="category" value={optionCategory} />
              <input type="hidden" name="type" value={optionType} />
              <label>
                <span className="field-label">
                  {materialMode ? "Material name" : "Category name"}
                </span>
                <input
                  name="name"
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  required
                  autoFocus
                  className="admin-input"
                  placeholder={
                    materialMode ? "e.g. Stainless steel" : "e.g. Shoulder bags"
                  }
                />
              </label>
              {categoryState.status === "error" && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-[11px] font-semibold leading-4 text-red-700">
                  {categoryState.message}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#942E3A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryPending || !customCategory.trim()}
                  className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-wait disabled:opacity-50"
                >
                  {categoryPending
                    ? "Adding..."
                    : `Add ${materialMode ? "material" : "category"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SupplierDropdown({
  suppliers,
  defaultValue = "",
}: {
  suppliers: Supplier[];
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [supplierName, setSupplierName] = useState("");
  const supplierRef = useRef<HTMLDivElement>(null);
  const [supplierState, supplierAction, supplierPending] = useActionState<
    SupplierState,
    FormData
  >(
    async (_previous, formData) => {
      try {
        const created = await createSupplierWithResultAction(formData);
        return {
          status: "success" as const,
          message: "Supplier added successfully.",
          id: created.id,
          name: created.name,
        };
      } catch (error) {
        return {
          status: "error" as const,
          message:
            error instanceof Error ? error.message : "Unable to add supplier.",
          id: "",
          name: "",
        };
      }
    },
    { status: "idle", message: "", id: "", name: "" },
  );
  useEffect(() => {
    if (supplierState.status === "success") {
      setValue(supplierState.id);
      setSupplierName("");
      setModalOpen(false);
      setOpen(false);
    }
  }, [supplierState.status, supplierState.id]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!supplierRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const selected = suppliers.find((supplier) => supplier.id === value);
  return (
    <div ref={supplierRef} className="relative">
      <span className="field-label">Supplier / merchant</span>
      <input type="hidden" name="supplierId" value={value} />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="admin-input flex w-full items-center justify-between text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-[#942E3A]" : "text-[#6B1F2A]/60"}>
          {selected?.name || "No supplier"}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#D8B46A] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className="hide-scrollbar overscroll-contain absolute bottom-[calc(100%+6px)] left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-1.5 shadow-[0_18px_40px_rgba(67,25,31,0.18)]"
          onWheel={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setSupplierName("");
            }}
            className="mb-1 flex w-full items-center gap-2 rounded-xl border border-dashed border-[#D8B46A]/70 px-3 py-2.5 text-left text-xs font-bold text-[#942E3A] hover:bg-[#F2DFC0]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D8B46A]">
              +
            </span>
            Add new supplier
          </button>
          <button
            type="button"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="flex w-full rounded-xl px-3 py-2.5 text-left text-xs text-[#942E3A] hover:bg-[#F2DFC0]"
          >
            No supplier
          </button>
          {suppliers.map((supplier) => (
            <button
              type="button"
              key={supplier.id}
              onClick={() => {
                setValue(supplier.id);
                setOpen(false);
              }}
              className={`flex w-full rounded-xl px-3 py-2.5 text-left text-xs transition ${supplier.id === value ? "bg-[#942E3A] font-bold text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}
            >
              {supplier.name}
            </button>
          ))}
        </div>
      )}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B7CC7]/30 p-4 backdrop-blur-[2px]"
          onMouseDown={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-5 shadow-[0_24px_70px_rgba(67,25,31,0.28)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  Purchasing
                </p>
                <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                  Add new supplier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full px-2 py-1 text-lg text-[#942E3A]/55"
              >
                ×
              </button>
            </div>
            <form action={supplierAction} className="mt-5 space-y-4">
              <label>
                <span className="field-label">Supplier name</span>
                <input
                  name="name"
                  required
                  autoFocus
                  value={supplierName}
                  onChange={(event) => setSupplierName(event.target.value)}
                  className="admin-input"
                  placeholder="Supplier or company name"
                />
              </label>
              {supplierState.status === "error" && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                  {supplierState.message}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#942E3A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={supplierPending || !supplierName.trim()}
                  className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:cursor-wait disabled:opacity-50"
                >
                  {supplierPending ? "Adding..." : "Add supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OptionsSelect({
  options,
  category,
  type,
  name,
  label,
  required = false,
  defaultValue = "",
}: {
  options: CatalogOption[];
  category: string;
  type: string;
  name: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const values = options.filter(
    (option) => option.category === category && option.type === type,
  );
  return (
    <label className="relative">
      <AdminDropdown
        name={name}
        label={label}
        required={required}
        colorMode={type === "color"}
        brandMode={type === "brand"}
        categoryMode={type === "subcategory"}
        materialMode={type === "material"}
        optionCategory={category}
        optionType={type}
        defaultValue={defaultValue}
        placeholder={
          values.length
            ? `Select ${label.toLowerCase()}`
            : `No ${label.toLowerCase()} configured`
        }
        values={values.map((option) => ({
          value: option.name,
          label: option.name,
        }))}
      />
      {!values.length &&
        !["brand", "color", "subcategory", "material"].includes(type) && (
          <Link
            href="/admin/products/categories"
            className="mt-1 block text-[10px] font-bold text-[#942E3A] underline"
          >
            Add {label.toLowerCase()} in catalog options
          </Link>
        )}
    </label>
  );
}

export default function AdminProductCreateForm({
  options,
  suppliers,
  products,
  redirectTo,
  initialProduct,
  embedded = false,
  onCancel,
  onEmbeddedSubmit,
}: {
  options: CatalogOption[];
  suppliers: Supplier[];
  products: RelatedProduct[];
  redirectTo?: string;
  initialProduct?: EditProduct;
  embedded?: boolean;
  onCancel?: () => void;
  onEmbeddedSubmit?: (formData: FormData) => void;
}) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";
  const { toast } = useToast();
  const isEdit = Boolean(initialProduct);
  const steps = isEdit
    ? [
        { label: "Details", caption: "Product information" },
        { label: "Gallery", caption: "Manage media" },
        { label: "Inventory", caption: "Manage stock" },
        { label: "Relations", caption: "Similar products" },
        { label: "Pricing", caption: "Update costs" },
        reviewStep,
      ]
    : productSteps;
  const [category, setCategory] = useState(initialProduct?.category || "shoes");
  const perfumeVolumes = options
    .filter(
      (option) => option.category === "perfumes" && option.type === "volume",
    )
    .map((option) => option.name);
  const availablePerfumeVolumes = perfumeVolumes.length
    ? perfumeVolumes
    : ["30 ml", "50 ml", "100 ml"];
  const [variants, setVariants] = useState<VariantDraft[]>(
    () =>
      initialProduct?.variants.map((variant) => ({
        size: variant.size,
        stock: variant.stock,
      })) || [{ size: "36", stock: 0 }],
  );
  const [productSku, setProductSku] = useState(
    () => initialProduct?.sku || nextSku("shoes", products),
  );
  const [skuEdited, setSkuEdited] = useState(false);
  const [shoeSizes, setShoeSizes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      SHOE_SIZES.map((size) => [
        size,
        initialProduct
          ? initialProduct.variants.some((variant) => variant.size === size)
          : true,
      ]),
    ),
  );
  const [shoeQuantities, setShoeQuantities] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        SHOE_SIZES.map((size) => [
          size,
          initialProduct?.variants.find((variant) => variant.size === size)
            ?.stock || 0,
        ]),
      ),
  );
  const [bagQuantity, setBagQuantity] = useState(
    initialProduct?.variants[0]?.stock || 0,
  );
  const [accessoryQuantity, setAccessoryQuantity] = useState(
    initialProduct?.variants[0]?.stock || 0,
  );
  const [perfumeVolumesEnabled, setPerfumeVolumesEnabled] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      availablePerfumeVolumes.map((volume) => [
        volume,
        initialProduct
          ? initialProduct.variants.some((variant) => variant.size === volume)
          : true,
      ]),
    ),
  );
  const [perfumeQuantities, setPerfumeQuantities] = useState<
    Record<string, number>
  >(() =>
    Object.fromEntries(
      availablePerfumeVolumes.map((volume) => [
        volume,
        initialProduct?.variants.find((variant) => variant.size === volume)
          ?.stock || 0,
      ]),
    ),
  );
  const [perfumePricing, setPerfumePricing] = useState<
    Record<string, PerfumePriceDraft>
  >(() =>
    Object.fromEntries(
      availablePerfumeVolumes.map((volume) => {
        const variant = initialProduct?.variants.find(
          (item) => item.size === volume,
        );
        return [
          volume,
          {
            price: String(variant?.price ?? initialProduct?.price ?? ""),
            compareAtPrice: String(
              variant?.compareAtPrice ?? initialProduct?.compareAtPrice ?? "",
            ),
            wholesalePrice: String(
              variant?.wholesalePrice ?? initialProduct?.wholesalePrice ?? "",
            ),
            additionalCost: String(
              variant?.additionalCost ?? initialProduct?.additionalCost ?? "",
            ),
          },
        ];
      }),
    ),
  );
  const [relatedIds, setRelatedIds] = useState<string[]>(
    initialProduct?.relatedIds || [],
  );
  const [draggedRelated, setDraggedRelated] = useState<number | null>(null);
  const [reviews, setReviews] = useState<ReviewDraft[]>(
    initialProduct?.reviews || [],
  );
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [ratingMenuOpen, setRatingMenuOpen] = useState(false);
  const ratingMenuRef = useRef<HTMLDivElement>(null);
  const [editingReviewIndex, setEditingReviewIndex] = useState<number | null>(
    null,
  );
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>({
    customerName: "",
    rating: 5,
    body: "",
  });
  useEffect(() => {
    if (!ratingMenuOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        ratingMenuRef.current &&
        !ratingMenuRef.current.contains(event.target as Node)
      ) {
        setRatingMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [ratingMenuOpen]);
  const [activeStep, setActiveStep] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(
    String(initialProduct?.price ?? ""),
  );
  const [compareAtPrice, setCompareAtPrice] = useState(
    String(initialProduct?.compareAtPrice ?? ""),
  );
  const [wholesalePrice, setWholesalePrice] = useState(
    String(initialProduct?.wholesalePrice ?? ""),
  );
  const [additionalCost, setAdditionalCost] = useState(
    String(initialProduct?.additionalCost ?? ""),
  );
  const categoryOptions = (type: string) =>
    options.filter(
      (option) => option.category === category && option.type === type,
    );
  const sizeType = category === "perfumes" ? "volume" : "size";
  const sizeLabel =
    category === "perfumes"
      ? "Volume / ml"
      : category === "shoes"
        ? "Size"
        : "Option / size";

  const updateVariant = (
    index: number,
    field: keyof VariantDraft,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((variant, itemIndex) =>
        itemIndex === index
          ? { ...variant, [field]: field === "stock" ? Number(value) : value }
          : variant,
      ),
    );
  };
  const relatedProducts = relatedIds
    .map((id) => products.find((product) => product.id === id))
    .filter(Boolean) as RelatedProduct[];
  const addRelated = (id: string) =>
    setRelatedIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  const removeRelated = (id: string) =>
    setRelatedIds((current) => current.filter((item) => item !== id));
  const reorderRelated = (from: number, to: number) =>
    setRelatedIds((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  const updateReview = (
    index: number,
    field: keyof ReviewDraft,
    value: string,
  ) =>
    setReviews((current) =>
      current.map((review, itemIndex) =>
        itemIndex === index
          ? { ...review, [field]: field === "rating" ? Number(value) : value }
          : review,
      ),
    );

  return (
    <form
      action={embedded ? undefined : isEdit ? updateProductAction : createProductAction}
      onSubmit={(event) => {
        if (embedded) {
          event.preventDefault();
          onEmbeddedSubmit?.(new FormData(event.currentTarget));
          return;
        }
        toast.success(isEdit ? "Product changes saved!" : "New product published!", "CATALOG");
      }}
      className="space-y-5"
    >
      {initialProduct && (
        <input type="hidden" name="id" value={initialProduct.id} />
      )}
      {isEdit && <input type="hidden" name="category" value={category} />}
      <input type="hidden" name="reviews" value={JSON.stringify(reviews)} />
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(
          category === "shoes"
            ? SHOE_SIZES.filter((size) => shoeSizes[size]).map((size) => ({
                size,
                stock: shoeQuantities[size] || 0,
              }))
            : category === "bags"
              ? [{ size: "ONE_SIZE", stock: bagQuantity }]
              : category === "accessories"
                ? [{ size: "ONE_SIZE", stock: accessoryQuantity }]
                : category === "perfumes"
                  ? availablePerfumeVolumes
                      .filter((volume) => perfumeVolumesEnabled[volume])
                      .map((volume) => ({
                        size: volume,
                        stock: perfumeQuantities[volume] || 0,
                        ...perfumePricing[volume],
                      }))
                  : variants,
        )}
      />
      {relatedIds.map((id) => (
        <input key={id} type="hidden" name="relatedProductIds" value={id} />
      ))}

      <div className="sticky top-3 z-20 rounded-2xl sm:rounded-3xl border border-[#942E3A]/10 bg-[#FFF9EB]/95 p-1.5 sm:p-3 shadow-[0_12px_30px_rgba(67,25,31,0.1)] backdrop-blur">
        {/* Mobile: 1-Row Swipeable Horizontal Bar */}
        <div className="flex overflow-x-auto gap-1.5 no-scrollbar sm:hidden">
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isComplete = activeStep > index;
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`group flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-left transition shrink-0 ${
                  isActive
                    ? "bg-[#942E3A] text-[#FFF9EB] shadow-xs font-bold"
                    : "text-[#942E3A]/70 hover:bg-white bg-white/50"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                    isActive
                      ? "bg-[#D8B46A] text-[#942E3A]"
                      : isComplete
                        ? "bg-[#942E3A]/10 text-[#942E3A]"
                        : "bg-white/80 text-[#942E3A]/60"
                  }`}
                >
                  {isComplete ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="text-[11px] whitespace-nowrap">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop: Grid */}
        <div
          className={`hidden sm:grid gap-1 ${isEdit ? "sm:grid-cols-6" : "sm:grid-cols-5"}`}
        >
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isComplete = activeStep > index;
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`group rounded-2xl px-3 py-2.5 text-left transition ${
                  isActive
                    ? "bg-[#942E3A] text-[#FFF9EB] shadow-[0_6px_15px_rgba(148,46,58,0.16)]"
                    : "text-[#942E3A]/65 hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                      isActive
                        ? "bg-[#D8B46A] text-[#942E3A]"
                        : isComplete
                          ? "bg-[#942E3A]/10 text-[#942E3A]"
                          : "bg-white text-[#942E3A]/55"
                    }`}
                  >
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">
                      {step.label}
                    </span>
                    <span
                      className={`block truncate text-[9px] ${
                        isActive ? "text-[#FFF9EB]/60" : "text-[#6B1F2A]/45"
                      }`}
                    >
                      {step.caption}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section
        hidden={activeStep !== 0}
        className="product-editor-panel p-5 sm:p-6"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 1
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          {isEdit ? "Product details" : "Product type & identity"}
        </h2>
        {isEdit ? (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D8B46A]">
                Product type
              </p>
              <p className="mt-1 font-playfair text-lg font-bold capitalize text-[#942E3A]">
                {category}
              </p>
            </div>
            <span className="rounded-full bg-[#942E3A]/10 px-3 py-1 text-[10px] font-bold text-[#942E3A]">
              Fixed after creation
            </span>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {categories.map((item) => (
              <label
                key={item.key}
                className={`cursor-pointer rounded-xl border p-3 text-center text-xs font-bold ${category === item.key ? "border-[#942E3A] bg-[#942E3A] text-[#FFF9EB]" : "border-[#942E3A]/10 bg-[#FFF9EB]/50 text-[#942E3A]"}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={item.key}
                  checked={category === item.key}
                  onChange={() => {
                    setCategory(item.key);
                    if (!skuEdited) setProductSku(nextSku(item.key, products));
                    setVariants([
                      { size: category === "shoes" ? "36" : "", stock: 0 },
                    ]);
                    setBagQuantity(0);
                    setAccessoryQuantity(0);
                    setPerfumeVolumesEnabled(
                      Object.fromEntries(
                        availablePerfumeVolumes.map((volume) => [volume, true]),
                      ),
                    );
                    setPerfumeQuantities(
                      Object.fromEntries(
                        availablePerfumeVolumes.map((volume) => [volume, 0]),
                      ),
                    );
                    setPerfumePricing(
                      Object.fromEntries(
                        availablePerfumeVolumes.map((volume) => [
                          volume,
                          {
                            price: "",
                            compareAtPrice: "",
                            wholesalePrice: "",
                            additionalCost: "",
                          },
                        ]),
                      ),
                    );
                    setShoeSizes(
                      Object.fromEntries(
                        SHOE_SIZES.map((size) => [size, true]),
                      ),
                    );
                    setShoeQuantities(
                      Object.fromEntries(SHOE_SIZES.map((size) => [size, 0])),
                    );
                  }}
                  className="sr-only"
                />
                {item.label}
              </label>
            ))}
          </div>
        )}
        <p className="mt-2 text-[10px] text-[#6B1F2A]/60">
          {isEdit
            ? "Update the product information below while keeping its type unchanged."
            : categoryHelp[category]}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="field-label">Product name</span>
            <input
              name="name"
              required
              defaultValue={initialProduct?.name || ""}
              className="admin-input"
              placeholder="Product name"
            />
          </label>
          <OptionsSelect
            options={options}
            category={category}
            type="brand"
            name="brand"
            label="Brand"
            defaultValue={initialProduct?.brand || ""}
          />
          {category !== "perfumes" && category !== "accessories" && (
            <OptionsSelect
              options={options}
              category={category}
              type="color"
              name="color"
              label="Product color"
              defaultValue={initialProduct?.color || ""}
            />
          )}
          {(category === "bags" || category === "accessories") && (
            <OptionsSelect
              options={options}
              category={category}
              type="subcategory"
              name="subcategory"
              label="Category"
              defaultValue={initialProduct?.subcategory || ""}
            />
          )}
          {category === "accessories" && (
            <OptionsSelect
              options={options}
              category={category}
              type="material"
              name="material"
              label="Material"
              defaultValue={initialProduct?.material || ""}
            />
          )}
          <AdminDropdown
            name="status"
            label="Publishing status"
            defaultValue={initialProduct?.status || "active"}
            placeholder="Select publishing status"
            values={[
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]}
          />
          <label>
            <span className="field-label">Product SKU</span>
            <input
              name="sku"
              required
              value={productSku}
              onChange={(event) => {
                setSkuEdited(true);
                setProductSku(event.target.value.toUpperCase());
              }}
              className="admin-input font-mono uppercase"
              placeholder="DR-NIKE-V2K-PINK"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Description</span>
            <textarea
              name="description"
              rows={5}
              defaultValue={initialProduct?.description || ""}
              className="admin-input resize-y"
              placeholder="Description, details and care instructions"
            />
          </label>
        </div>
      </section>

      <section
        hidden={activeStep !== 4}
        className="product-editor-panel overflow-visible p-5 sm:p-6"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 2
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          {isEdit
            ? "Review pricing, sourcing & visibility"
            : "Pricing, sourcing & visibility"}
        </h2>
        {category === "perfumes" &&
          (() => {
            const activeVolumes = availablePerfumeVolumes.filter(
              (volume) => perfumeVolumesEnabled[volume],
            );
            const firstPricing = perfumePricing[activeVolumes[0]] || {
              price: "",
              compareAtPrice: "",
              wholesalePrice: "",
              additionalCost: "",
            };
            return (
              <>
                <input type="hidden" name="price" value={firstPricing.price} />
                <input
                  type="hidden"
                  name="compareAtPrice"
                  value={firstPricing.compareAtPrice}
                />
                <input
                  type="hidden"
                  name="wholesalePrice"
                  value={firstPricing.wholesalePrice}
                />
                <input
                  type="hidden"
                  name="additionalCost"
                  value={firstPricing.additionalCost}
                />
                <div className="mt-5 rounded-3xl border border-[#D8B46A]/40 bg-gradient-to-br from-[#FFF9EB] via-white to-[#F7E8D4] p-4 sm:p-6 sm:col-span-2 lg:col-span-3">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                        Volume pricing
                      </p>
                      <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                        Price each perfume volume
                      </h3>
                    </div>
                    <p className="text-[10px] text-[#6B1F2A]/55">
                      Every bottle size can have its own price and costs
                    </p>
                  </div>
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {activeVolumes.map((volume) => {
                      const draft = perfumePricing[volume] || {
                        price: "",
                        compareAtPrice: "",
                        wholesalePrice: "",
                        additionalCost: "",
                      };
                      const update = (
                        field: keyof PerfumePriceDraft,
                        value: string,
                      ) =>
                        setPerfumePricing((current) => ({
                          ...current,
                          [volume]: {
                            ...(current[volume] || draft),
                            [field]: value,
                          },
                        }));
                      const profit =
                        (Number(draft.price) || 0) -
                        (Number(draft.wholesalePrice) || 0) -
                        (Number(draft.additionalCost) || 0);
                      return (
                        <div
                          key={volume}
                          className="rounded-2xl border border-[#942E3A]/12 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-[#942E3A] px-3 py-1 text-xs font-bold text-[#FFF9EB]">
                              {volume}
                            </span>
                            <span
                              className={`text-xs font-bold ${profit >= 0 ? "text-emerald-700" : "text-red-700"}`}
                            >
                              {profit.toFixed(0)} EGP profit
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <label>
                              <span className="field-label">Selling price</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.price}
                                onChange={(event) =>
                                  update("price", event.target.value)
                                }
                                className="admin-input"
                              />
                            </label>
                            <label>
                              <span className="field-label">
                                Before discount
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.compareAtPrice}
                                onChange={(event) =>
                                  update("compareAtPrice", event.target.value)
                                }
                                className="admin-input"
                              />
                            </label>
                            <label>
                              <span className="field-label">
                                Wholesale price
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.wholesalePrice}
                                onChange={(event) =>
                                  update("wholesalePrice", event.target.value)
                                }
                                className="admin-input"
                              />
                            </label>
                            <label>
                              <span className="field-label">
                                Additional cost
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={draft.additionalCost}
                                onChange={(event) =>
                                  update("additionalCost", event.target.value)
                                }
                                className="admin-input"
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label hidden={category === "perfumes"}>
            <span className="field-label">Selling price (EGP)</span>
            <input
              name="price"
              required={category !== "perfumes"}
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
              className="admin-input"
            />
          </label>
          <label hidden={category === "perfumes"}>
            <span className="field-label">Price before discount</span>
            <input
              name="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              value={compareAtPrice}
              onChange={(event) => setCompareAtPrice(event.target.value)}
              className="admin-input"
            />
          </label>
          <label hidden={category === "perfumes"}>
            <span className="field-label">Wholesale price</span>
            <input
              name="wholesalePrice"
              type="number"
              min="0"
              step="0.01"
              value={wholesalePrice}
              onChange={(event) => setWholesalePrice(event.target.value)}
              className="admin-input"
            />
          </label>
          <label hidden={category === "perfumes"}>
            <span className="field-label">Additional cost</span>
            <input
              name="additionalCost"
              type="number"
              min="0"
              step="0.01"
              value={additionalCost}
              onChange={(event) => setAdditionalCost(event.target.value)}
              className="admin-input"
            />
          </label>
          <SupplierDropdown
            suppliers={suppliers}
            defaultValue={initialProduct?.supplierId || ""}
          />
          <label>
            <span className="field-label">Low-stock warning at</span>
            <input
              name="lowStockLimit"
              type="number"
              min="0"
              defaultValue={2}
              className="admin-input"
            />
          </label>
        </div>
        {category !== "perfumes" &&
          (() => {
            const sale = Number(sellingPrice) || 0;
            const beforeDiscount = Number(compareAtPrice) || sale;
            const cost =
              (Number(wholesalePrice) || 0) + (Number(additionalCost) || 0);
            const saleProfit = sale - cost;
            const fullPriceProfit = beforeDiscount - cost;
            const margin = sale > 0 ? Math.round((saleProfit / sale) * 100) : 0;
            return (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Profit after discount
                  </p>
                  <p className="mt-2 font-playfair text-2xl font-black text-emerald-800">
                    {saleProfit.toFixed(0)} EGP
                  </p>
                  <p className="mt-1 text-[10px] text-emerald-700">
                    Per unit · {margin}% margin
                  </p>
                </div>
                <div className="rounded-2xl border border-[#D8B46A]/45 bg-[#fff7df] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#8D6A22]">
                    Profit before discount
                  </p>
                  <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
                    {fullPriceProfit.toFixed(0)} EGP
                  </p>
                  <p className="mt-1 text-[10px] text-[#8D6A22]">
                    Based on price before discount
                  </p>
                </div>
                <div className="rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/60">
                    Discount impact
                  </p>
                  <p className="mt-2 font-playfair text-2xl font-black text-[#942E3A]">
                    {Math.max(0, fullPriceProfit - saleProfit).toFixed(0)} EGP
                  </p>
                  <p className="mt-1 text-[10px] text-[#6B1F2A]/60">
                    Profit reduced per unit
                  </p>
                </div>
              </div>
            );
          })()}
      </section>

      <section
        hidden={activeStep !== 1}
        className="product-editor-panel p-5 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-[#D8B46A]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              Step 3
            </p>
            <h2 className="font-playfair text-xl font-bold">
              {isEdit ? "Manage product gallery" : "Main image & gallery"}
            </h2>
          </div>
        </div>
        <AdminImageGalleryField defaultValue={initialProduct?.images.join("\n") || ""} />
      </section>

      <section
        hidden={activeStep !== 2}
        className="product-editor-panel p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-[#D8B46A]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                Step 4
              </p>
              <h2 className="font-playfair text-xl font-bold">
                {isEdit ? "Manage variants & stock" : "Variants & stock"}
              </h2>
            </div>
          </div>
          {isEdit ? (
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("open-add-product", {
                    detail: { productId: initialProduct?.id },
                  }),
                )
              }
              className="hidden inline-flex items-center gap-1 rounded-xl bg-[#D8B46A] px-3 py-2 text-[10px] font-bold text-[#942E3A] shadow-sm transition hover:bg-[#E5C57F]"
            >
              <Plus className="h-3.5 w-3.5" /> Add new batch
            </button>
          ) : (
            category !== "shoes" &&
            category !== "bags" &&
            category !== "accessories" &&
            category !== "perfumes" && (
              <button
                type="button"
                onClick={() =>
                  setVariants((current) => [...current, { size: "", stock: 0 }])
                }
                className="inline-flex items-center gap-1 rounded-xl bg-[#D8B46A] px-3 py-2 text-[10px] font-bold text-[#942E3A]"
              >
                <Plus className="h-3.5 w-3.5" /> Add variant
              </button>
            )
          )}
        </div>
        <fieldset
          disabled={isEdit}
          className={isEdit ? "mt-4 opacity-75" : "mt-4"}
        >
          <p className="text-[10px] text-[#6B1F2A]/55">
            {isEdit
              ? "Update the product SKU and adjust the available stock options below."
              : "One SKU identifies the whole product. Sizes are managed below."}
          </p>
          {category === "shoes" ? (
            <div className="mt-4 rounded-3xl border border-[#942E3A]/10 bg-gradient-to-br from-[#FFF9EB] to-white p-4 sm:p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                    Size matrix
                  </p>
                  <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                    {isEdit
                      ? "Update available sizes"
                      : "Choose available sizes"}
                  </h3>
                </div>
                <p className="text-[10px] text-[#6B1F2A]/55">EU sizes 36–41</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SHOE_SIZES.map((size) => (
                  <div
                    key={size}
                    className={`rounded-2xl border p-3 transition ${shoeSizes[size] ? "border-[#942E3A]/25 bg-white shadow-sm" : "border-[#942E3A]/8 bg-[#FFF9EB]/55 opacity-75"}`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={shoeSizes[size]}
                        onChange={() =>
                          setShoeSizes((current) => ({
                            ...current,
                            [size]: !current[size],
                          }))
                        }
                        className="peer sr-only"
                      />
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black transition ${shoeSizes[size] ? "border-[#942E3A] bg-[#942E3A] text-white" : "border-[#D8B46A] bg-white text-transparent"}`}
                      >
                        <Check className="h-4 w-4" />
                      </span>
                      <span className="font-numeric text-base font-bold text-[#942E3A]">
                        EU {size}
                      </span>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#D8B46A]">
                        {shoeSizes[size] ? "Available" : "Off"}
                      </span>
                    </label>
                    {shoeSizes[size] && (
                      <label className="mt-3 block">
                        <span className="field-label">Quantity</span>
                        <input
                          type="number"
                          min="0"
                          value={shoeQuantities[size] || 0}
                          onChange={(event) =>
                            setShoeQuantities((current) => ({
                              ...current,
                              [size]: Number(event.target.value),
                            }))
                          }
                          className="admin-input"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : category === "perfumes" ? (
            <div className="mt-4 rounded-3xl border border-[#942E3A]/10 bg-gradient-to-br from-[#FFF9EB] to-white p-4 sm:p-6">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                    Volume matrix
                  </p>
                  <h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">
                    {isEdit
                      ? "Update available bottle sizes"
                      : "Choose available bottle sizes"}
                  </h3>
                </div>
                <p className="text-[10px] text-[#6B1F2A]/55">
                  Select each volume and add its quantity
                </p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availablePerfumeVolumes.map((volume) => (
                  <div
                    key={volume}
                    className={`rounded-2xl border p-3 transition ${perfumeVolumesEnabled[volume] ? "border-[#942E3A]/25 bg-white shadow-sm" : "border-[#942E3A]/8 bg-[#FFF9EB]/55 opacity-75"}`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={perfumeVolumesEnabled[volume]}
                        onChange={() =>
                          setPerfumeVolumesEnabled((current) => ({
                            ...current,
                            [volume]: !current[volume],
                          }))
                        }
                        className="peer sr-only"
                      />
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black transition ${perfumeVolumesEnabled[volume] ? "border-[#942E3A] bg-[#942E3A] text-white" : "border-[#D8B46A] bg-white text-transparent"}`}
                      >
                        <Check className="h-4 w-4" />
                      </span>
                      <span className="font-numeric text-base font-bold text-[#942E3A]">
                        {volume}
                      </span>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-[#D8B46A]">
                        {perfumeVolumesEnabled[volume] ? "Available" : "Off"}
                      </span>
                    </label>
                    {perfumeVolumesEnabled[volume] && (
                      <label className="mt-3 block">
                        <span className="field-label">Quantity</span>
                        <input
                          type="number"
                          min="0"
                          value={perfumeQuantities[volume] || 0}
                          onChange={(event) =>
                            setPerfumeQuantities((current) => ({
                              ...current,
                              [volume]: Number(event.target.value),
                            }))
                          }
                          className="admin-input"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : category === "bags" || category === "accessories" ? (
            <div className="mt-4 overflow-hidden rounded-3xl border border-[#D8B46A]/45 bg-gradient-to-br from-[#FFF9EB] via-white to-[#F7E8D4] shadow-[0_16px_35px_rgba(148,46,58,0.08)]">
              <div className="flex items-center justify-between border-b border-[#D8B46A]/25 bg-[#942E3A] px-5 py-4 text-[#FFF9EB] sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                    {category === "bags"
                      ? "Bag inventory"
                      : "Accessory inventory"}
                  </p>
                  <h3 className="mt-1 font-playfair text-xl font-bold">
                    Total pieces in stock
                  </h3>
                </div>
                <PackagePlus className="h-7 w-7 text-[#D8B46A]" />
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[1fr_260px] sm:items-center sm:p-6">
                <div>
                  <p className="font-playfair text-2xl font-bold text-[#942E3A]">
                    One quantity for the whole{" "}
                    {category === "bags" ? "bag" : "accessory"}
                  </p>
                  <p className="mt-2 max-w-lg text-xs leading-5 text-[#6B1F2A]/60">
                    {category === "bags"
                      ? "Bags do not have sizes."
                      : "Accessories do not have size variants."}{" "}
                    Enter the total number of pieces available and the
                    storefront will manage it as one stock item.
                  </p>
                </div>
                <label className="rounded-2xl border border-[#D8B46A]/45 bg-white p-4 shadow-sm">
                  <span className="field-label">Quantity</span>
                  <input
                    type="number"
                    min="0"
                    value={
                      category === "bags" ? bagQuantity : accessoryQuantity
                    }
                    onChange={(event) =>
                      category === "bags"
                        ? setBagQuantity(Number(event.target.value))
                        : setAccessoryQuantity(Number(event.target.value))
                    }
                    className="admin-input text-center text-xl font-bold"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid gap-2 rounded-2xl bg-[#FFF9EB]/70 p-3 sm:grid-cols-[1fr_1fr_1fr_0.7fr_auto]"
                >
                  <label>
                    <span className="field-label">{sizeLabel}</span>
                    {categoryOptions(sizeType).length ? (
                      <select
                        required
                        value={variant.size}
                        onChange={(event) =>
                          updateVariant(index, "size", event.target.value)
                        }
                        className="admin-input"
                      >
                        <option value="">
                          Select {sizeLabel.toLowerCase()}
                        </option>
                        {categoryOptions(sizeType).map((option) => (
                          <option key={option.name}>{option.name}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        value={variant.size}
                        onChange={(event) =>
                          updateVariant(index, "size", event.target.value)
                        }
                        className="admin-input"
                        placeholder={
                          category === "perfumes"
                            ? "100 ml"
                            : category === "shoes"
                              ? "38"
                              : "One size"
                        }
                      />
                    )}
                  </label>
                  <label>
                    <span className="field-label">Quantity</span>
                    <input
                      required
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(event) =>
                        updateVariant(index, "stock", event.target.value)
                      }
                      className="admin-input"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={variants.length === 1}
                    onClick={() =>
                      setVariants((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    aria-label="Remove variant"
                    className="self-end rounded-xl p-3 text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      </section>

      <section
        hidden={activeStep !== 3}
        className="product-editor-panel overflow-visible p-5 sm:p-6"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 5
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          {isEdit ? "Manage related products" : "Similar products"}
        </h2>
        <div className="mt-4">
          <AdminCatalogProductPicker
            products={products}
            value=""
            onChange={addRelated}
          />
          <p className="mt-2 text-[10px] text-[#6B1F2A]/55">
            Choose products from the dropdown, then drag them to set their
            storefront order.
          </p>
        </div>
        {relatedProducts.length > 0 && (
          <div className="mt-4 space-y-2">
            {relatedProducts.map((product, index) => (
              <div
                key={product.id}
                draggable
                onDragStart={() => setDraggedRelated(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggedRelated !== null)
                    reorderRelated(draggedRelated, index);
                  setDraggedRelated(null);
                }}
                onDragEnd={() => setDraggedRelated(null)}
                className={`flex items-center gap-3 rounded-2xl border border-[#942E3A]/10 bg-[#FFF9EB] px-3 py-3 ${draggedRelated === index ? "opacity-50" : ""}`}
              >
                <GripVertical className="h-4 w-4 cursor-grab text-[#D8B46A]" />
                {product.image ? (
                  <img src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-xl bg-white object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#D8B46A]">
                    <PackagePlus className="h-4 w-4" />
                  </span>
                )}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#942E3A]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-[#942E3A]">
                  {product.name}
                </span>
                <span className="text-[9px] capitalize text-[#6B1F2A]/50">
                  {product.category}
                </span>
                <button
                  type="button"
                  onClick={() => removeRelated(product.id)}
                  className="rounded-lg p-1.5 text-red-600 hover:bg-white"
                  aria-label={`Remove ${product.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {!products.length && (
          <p className="mt-3 text-xs text-[#6B1F2A]/55">
            Add more products to configure recommendations.
          </p>
        )}
      </section>

      {isEdit && (
        <section
          hidden={activeStep !== 5}
          className="product-editor-panel p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#D8B46A]" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                  Step 6
                </p>
                <h2 className="font-playfair text-xl font-bold">
                  Initial reviews
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingReviewIndex(null);
                setReviewDraft({
                  customerName: "",
                  rating: 5,
                  body: "",
                });
                setReviewModalOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-[#942E3A]/15 px-3 py-2 text-[10px] font-bold text-[#942E3A]"
            >
              <Plus className="h-3.5 w-3.5" /> Add review
            </button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {reviews.map((review, index) => (
              <article
                key={review.id || index}
                className="group rounded-3xl border border-[#D8B46A]/35 bg-gradient-to-br from-[#FFF9EB] to-white p-5 shadow-[0_12px_30px_rgba(67,25,31,0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1 text-[#D8B46A]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "fill-[#D8B46A]" : "text-[#D8B46A]/35"}`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-xs font-bold text-[#6B1F2A]/60">
                      {review.customerName}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReviewIndex(index);
                        setReviewDraft({ ...review });
                        setReviewModalOpen(true);
                      }}
                      className="rounded-xl border border-[#942E3A]/12 p-2 text-[#942E3A] hover:bg-[#F2DFC0]"
                      aria-label="Edit review"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setReviews((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      aria-label="Delete review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#6B1F2A]/75">
                  {review.body}
                </p>
              </article>
            ))}
            {!reviews.length && (
              <div className="lg:col-span-2 rounded-3xl border-2 border-dashed border-[#D8B46A]/45 bg-[#FFF9EB]/45 p-10 text-center">
                <Star className="mx-auto h-9 w-9 text-[#D8B46A]" />
                <p className="mt-3 font-playfair text-xl font-bold text-[#942E3A]">
                  No reviews yet
                </p>
                <p className="mt-1 text-xs text-[#6B1F2A]/55">
                  Add the first customer review for this product.
                </p>
              </div>
            )}
          </div>
          {reviewModalOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#8B7CC7]/35 p-4 backdrop-blur-[2px]"
              onMouseDown={() => setReviewModalOpen(false)}
            >
              <div
                className="w-full max-w-xl rounded-3xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-6 shadow-[0_24px_70px_rgba(67,25,31,0.28)]"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="step-kicker">Customer voice</p>
                    <h3 className="mt-1 font-playfair text-2xl font-bold text-[#942E3A]">
                      {editingReviewIndex === null
                        ? "Add review"
                        : "Edit review"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="rounded-full p-2 text-[#942E3A]/60 hover:bg-[#F2DFC0]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="field-label">Customer name</span>
                    <input
                      value={reviewDraft.customerName}
                      onChange={(event) =>
                        setReviewDraft((current) => ({
                          ...current,
                          customerName: event.target.value,
                        }))
                      }
                      className="admin-input"
                      autoFocus
                    />
                  </label>
                  <div className="relative" ref={ratingMenuRef}>
                    <span className="field-label">Rating</span>
                    <div className="mt-2 flex items-center gap-1.5" role="radiogroup" aria-label="Rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" role="radio" aria-checked={reviewDraft.rating === star} aria-label={`${star} out of 5 stars`} onClick={() => setReviewDraft((current) => ({ ...current, rating: star }))} className="rounded-lg p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D8B46A]/50">
                          <Star className={`h-7 w-7 ${star <= reviewDraft.rating ? "fill-[#D8B46A] text-[#D8B46A]" : "text-[#d9c8b8] hover:text-[#D8B46A]/70"}`} />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-haspopup="listbox"
                      aria-expanded={ratingMenuOpen}
                      onClick={() => setRatingMenuOpen((current) => !current)}
                      className="hidden"
                    >
                      <span className="flex items-center gap-2">
                        <span className="tracking-[0.15em] text-[#D8B46A]">
                          {"★".repeat(reviewDraft.rating)}
                        </span>
                        <span>{reviewDraft.rating}/5</span>
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#D8B46A] transition-transform ${ratingMenuOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {ratingMenuOpen && (
                      <div
                        role="listbox"
                        aria-label="Rating"
                        className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-20 overflow-hidden rounded-2xl border border-[#D8B46A]/45 bg-[#FFF9EB] p-1.5 shadow-[0_18px_40px_rgba(67,25,31,0.2)]"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            role="option"
                            aria-selected={reviewDraft.rating === rating}
                            onClick={() => {
                              setReviewDraft((current) => ({
                                ...current,
                                rating,
                              }));
                              setRatingMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${reviewDraft.rating === rating ? "bg-[#942E3A] text-[#FFF9EB]" : "text-[#942E3A] hover:bg-[#F2DFC0]"}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className="tracking-[0.15em] text-[#D8B46A]">
                                {"★".repeat(rating)}
                              </span>
                              <span>{rating}/5</span>
                            </span>
                            {reviewDraft.rating === rating && (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <label className="sm:col-span-2">
                    <span className="field-label">Review</span>
                    <textarea
                      rows={5}
                      value={reviewDraft.body}
                      onChange={(event) =>
                        setReviewDraft((current) => ({
                          ...current,
                          body: event.target.value,
                        }))
                      }
                      className="admin-input resize-y"
                      placeholder="Write the customer experience..."
                    />
                  </label>
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="rounded-xl border border-[#942E3A]/15 bg-white px-4 py-2.5 text-xs font-bold text-[#942E3A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={
                      !reviewDraft.customerName.trim() ||
                      !reviewDraft.body.trim()
                    }
                    onClick={() => {
                      setReviews((current) =>
                        editingReviewIndex === null
                          ? [...current, reviewDraft]
                          : current.map((review, index) =>
                              index === editingReviewIndex
                                ? { ...reviewDraft, id: review.id }
                                : review,
                            ),
                      );
                      setReviewModalOpen(false);
                    }}
                    className="rounded-xl bg-[#942E3A] px-5 py-2.5 text-xs font-bold text-[#FFF9EB] disabled:opacity-50"
                  >
                    {editingReviewIndex === null
                      ? "Add review"
                      : "Save changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="flex items-center justify-between gap-2">
        {embedded ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-center text-xs font-bold text-[#942E3A] shrink-0"
          >
            Cancel
          </button>
        ) : (
          <Link
            href="/admin/products"
            className="rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-center text-xs font-bold text-[#942E3A] shrink-0"
          >
            Cancel
          </Link>
        )}
        <div className="flex gap-2">
          {activeStep > 0 && (
            <button
              type="button"
              onClick={() => setActiveStep((step) => step - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-xs font-bold text-[#942E3A]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          )}
          {activeStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep((step) => step + 1)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
            >
              {isEdit ? "Next" : "Continue"}{" "}
              <ArrowRight className="h-3.5 w-3.5 text-[#D8B46A]" />
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
            >
              {isEdit ? "Update product" : "Create product"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

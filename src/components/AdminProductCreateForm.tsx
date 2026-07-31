"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, PackagePlus, Plus, Star, Trash2 } from "lucide-react";
import { createProductAction } from "@/app/admin/products/actions";
import AdminImageGalleryField from "@/components/AdminImageGalleryField";

type CatalogOption = {
  category: string;
  type: string;
  name: string;
  value: string | null;
};
type Supplier = { id: string; name: string };
type RelatedProduct = { id: string; name: string; category: string };
type VariantDraft = { sku: string; color: string; size: string; stock: number };
type ReviewDraft = {
  customerName: string;
  rating: number;
  title: string;
  body: string;
};

const categories = [
  { key: "shoes", label: "Shoes" },
  { key: "bags", label: "Bags" },
  { key: "perfumes", label: "Perfumes" },
  { key: "accessories", label: "Accessories" },
];

const categoryHelp: Record<string, string> = {
  shoes: "Choose the shoe brand, colors and sizes, then add stock per variant.",
  bags: "Choose the bag category, brand and colors, then add stock per variant.",
  perfumes:
    "Choose the perfume brand and volume in ml, then add stock per bottle size.",
  accessories:
    "Choose the accessory category, brand and material, then add its stock options.",
};

const productSteps = [
  { label: "Identity", caption: "Name & category" },
  { label: "Pricing", caption: "Costs & visibility" },
  { label: "Gallery", caption: "Images & media" },
  { label: "Inventory", caption: "Variants & stock" },
  { label: "Relations", caption: "Similar products" },
  { label: "Reviews", caption: "Social proof" },
];

function OptionsSelect({
  options,
  category,
  type,
  name,
  label,
  required = false,
}: {
  options: CatalogOption[];
  category: string;
  type: string;
  name: string;
  label: string;
  required?: boolean;
}) {
  const values = options.filter(
    (option) => option.category === category && option.type === type,
  );
  return (
    <label>
      <span className="field-label">{label}</span>
      <select
        name={name}
        required={required}
        className="admin-input"
        defaultValue=""
      >
        <option value="">
          {values.length
            ? `Select ${label.toLowerCase()}`
            : `No ${label.toLowerCase()} configured`}
        </option>
        {values.map((option) => (
          <option key={`${type}-${option.name}`} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>
      {!values.length && (
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
}: {
  options: CatalogOption[];
  suppliers: Supplier[];
  products: RelatedProduct[];
  redirectTo?: string;
}) {
  const [category, setCategory] = useState("shoes");
  const [variants, setVariants] = useState<VariantDraft[]>([
    { sku: "", color: "", size: "", stock: 0 },
  ]);
  const [reviews, setReviews] = useState<ReviewDraft[]>([]);
  const [activeStep, setActiveStep] = useState(0);
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
  const updateReview = (
    index: number,
    field: keyof ReviewDraft,
    value: string,
  ) => {
    setReviews((current) =>
      current.map((review, itemIndex) =>
        itemIndex === index
          ? { ...review, [field]: field === "rating" ? Number(value) : value }
          : review,
      ),
    );
  };

  return (
    <form action={createProductAction} className="space-y-5">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <input type="hidden" name="reviews" value={JSON.stringify(reviews)} />

      <div className="sticky top-3 z-20 rounded-3xl border border-[#942E3A]/10 bg-[#FFF9EB]/95 p-2 shadow-[0_12px_30px_rgba(67,25,31,0.1)] backdrop-blur sm:p-3">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
          {productSteps.map((step, index) => {
            const isActive = activeStep === index;
            const isComplete = activeStep > index;
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`group rounded-2xl px-2 py-2.5 text-left transition sm:px-3 ${isActive ? "bg-[#942E3A] text-[#FFF9EB] shadow-[0_6px_15px_rgba(148,46,58,0.16)]" : "text-[#942E3A]/65 hover:bg-white"}`}
              >
                <span className="flex items-center gap-2">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${isActive ? "bg-[#D8B46A] text-[#942E3A]" : isComplete ? "bg-[#942E3A]/10 text-[#942E3A]" : "bg-white text-[#942E3A]/55"}`}>
                    {isComplete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[10px] font-bold sm:text-xs">{step.label}</span>
                    <span className={`hidden truncate text-[9px] sm:block ${isActive ? "text-[#FFF9EB]/60" : "text-[#6B1F2A]/45"}`}>{step.caption}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section hidden={activeStep !== 0} className="product-editor-panel p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 1
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          Product type & identity
        </h2>
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
                  setVariants([{ sku: "", color: "", size: "", stock: 0 }]);
                }}
                className="sr-only"
              />
              {item.label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-[#6B1F2A]/60">
          {categoryHelp[category]}
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="field-label">Product name</span>
            <input
              name="name"
              required
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
          />
          {(category === "bags" || category === "accessories") && (
            <OptionsSelect
              options={options}
              category={category}
              type="subcategory"
              name="subcategory"
              label="Category"
            />
          )}
          {category === "accessories" && (
            <OptionsSelect
              options={options}
              category={category}
              type="material"
              name="material"
              label="Material"
            />
          )}
          <label>
            <span className="field-label">Publishing status</span>
            <select name="status" defaultValue="active" className="admin-input">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Description</span>
            <textarea
              name="description"
              rows={5}
              className="admin-input resize-y"
              placeholder="Description, details and care instructions"
            />
          </label>
        </div>
      </section>

      <section hidden={activeStep !== 1} className="product-editor-panel p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 2
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          Pricing, sourcing & visibility
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label>
            <span className="field-label">Selling price (EGP)</span>
            <input
              name="price"
              required
              type="number"
              min="0"
              step="0.01"
              className="admin-input"
            />
          </label>
          <label>
            <span className="field-label">Price before discount</span>
            <input
              name="compareAtPrice"
              type="number"
              min="0"
              step="0.01"
              className="admin-input"
            />
          </label>
          <label>
            <span className="field-label">Wholesale price</span>
            <input
              name="wholesalePrice"
              type="number"
              min="0"
              step="0.01"
              className="admin-input"
            />
          </label>
          <label>
            <span className="field-label">Additional cost</span>
            <input
              name="additionalCost"
              type="number"
              min="0"
              step="0.01"
              className="admin-input"
            />
          </label>
          <label>
            <span className="field-label">Supplier / merchant</span>
            <select name="supplierId" defaultValue="" className="admin-input">
              <option value="">No supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
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
          <label>
            <span className="field-label">Product badge</span>
            <input
              name="badge"
              className="admin-input"
              placeholder="New / Limited / Sale"
            />
          </label>
          <div className="flex flex-wrap items-center gap-5 sm:col-span-2 lg:pt-7">
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                name="featured"
                type="checkbox"
                className="accent-[#942E3A]"
              />{" "}
              Show in For You
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              <input
                name="bestSeller"
                type="checkbox"
                className="accent-[#942E3A]"
              />{" "}
              Show in Best Sellers
            </label>
          </div>
        </div>
      </section>

      <section hidden={activeStep !== 2} className="product-editor-panel p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-[#D8B46A]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              Step 3
            </p>
            <h2 className="font-playfair text-xl font-bold">
              Main image & gallery
            </h2>
          </div>
        </div>
        <AdminImageGalleryField />
      </section>

      <section hidden={activeStep !== 3} className="product-editor-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4 text-[#D8B46A]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                Step 4
              </p>
              <h2 className="font-playfair text-xl font-bold">
                Variants & stock
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setVariants((current) => [
                ...current,
                { sku: "", color: "", size: "", stock: 0 },
              ])
            }
            className="inline-flex items-center gap-1 rounded-xl bg-[#D8B46A] px-3 py-2 text-[10px] font-bold text-[#942E3A]"
          >
            <Plus className="h-3.5 w-3.5" /> Add variant
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-2xl bg-[#FFF9EB]/70 p-3 sm:grid-cols-[1fr_1fr_1fr_0.7fr_auto]"
            >
              <label>
                <span className="field-label">SKU</span>
                <input
                  required
                  value={variant.sku}
                  onChange={(event) =>
                    updateVariant(index, "sku", event.target.value)
                  }
                  className="admin-input"
                  placeholder="DR-001"
                />
              </label>
              <label>
                <span className="field-label">Color</span>
                {categoryOptions("color").length ? (
                  <select
                    required
                    value={variant.color}
                    onChange={(event) =>
                      updateVariant(index, "color", event.target.value)
                    }
                    className="admin-input"
                  >
                    <option value="">Select color</option>
                    {categoryOptions("color").map((option) => (
                      <option key={option.name}>{option.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    value={variant.color}
                    onChange={(event) =>
                      updateVariant(index, "color", event.target.value)
                    }
                    className="admin-input"
                    placeholder={category === "perfumes" ? "Bottle" : "Color"}
                  />
                )}
              </label>
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
                    <option value="">Select {sizeLabel.toLowerCase()}</option>
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
      </section>

      <section hidden={activeStep !== 4} className="product-editor-panel p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Step 5
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          Similar products
        </h2>
        <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
          {products.map((product) => (
            <label
              key={product.id}
              className="flex items-center gap-2 rounded-xl bg-[#FFF9EB] px-3 py-2.5 text-xs"
            >
              <input
                type="checkbox"
                name="relatedProductIds"
                value={product.id}
                className="accent-[#942E3A]"
              />
              <span className="min-w-0 truncate font-semibold">
                {product.name}
              </span>
              <span className="ml-auto text-[9px] capitalize text-[#6B1F2A]/50">
                {product.category}
              </span>
            </label>
          ))}
        </div>
        {!products.length && (
          <p className="mt-3 text-xs text-[#6B1F2A]/55">
            Add more products to configure recommendations.
          </p>
        )}
      </section>

      <section hidden={activeStep !== 5} className="product-editor-panel p-5 sm:p-6">
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
            onClick={() =>
              setReviews((current) => [
                ...current,
                { customerName: "", rating: 5, title: "", body: "" },
              ])
            }
            className="inline-flex items-center gap-1 rounded-xl border border-[#942E3A]/15 px-3 py-2 text-[10px] font-bold text-[#942E3A]"
          >
            <Plus className="h-3.5 w-3.5" /> Add review
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-2xl bg-[#FFF9EB]/70 p-3 sm:grid-cols-[1fr_0.5fr_auto]"
            >
              <label>
                <span className="field-label">Customer name</span>
                <input
                  required
                  value={review.customerName}
                  onChange={(event) =>
                    updateReview(index, "customerName", event.target.value)
                  }
                  className="admin-input"
                />
              </label>
              <label>
                <span className="field-label">Rating</span>
                <select
                  value={review.rating}
                  onChange={(event) =>
                    updateReview(index, "rating", event.target.value)
                  }
                  className="admin-input"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}/5
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() =>
                  setReviews((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                aria-label="Remove review"
                className="self-end rounded-xl p-3 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <label className="sm:col-span-2">
                <span className="field-label">Title</span>
                <input
                  value={review.title}
                  onChange={(event) =>
                    updateReview(index, "title", event.target.value)
                  }
                  className="admin-input"
                />
              </label>
              <label className="sm:col-span-3">
                <span className="field-label">Review</span>
                <textarea
                  required
                  value={review.body}
                  onChange={(event) =>
                    updateReview(index, "body", event.target.value)
                  }
                  rows={3}
                  className="admin-input resize-y"
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/products" className="rounded-xl border border-[#942E3A]/15 bg-white px-5 py-3 text-center text-xs font-bold text-[#942E3A]">Cancel</Link>
        <div className="flex gap-2 sm:ml-auto">
          {activeStep > 0 && <button type="button" onClick={() => setActiveStep((step) => step - 1)} className="inline-flex items-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-4 py-3 text-xs font-bold text-[#942E3A]"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>}
          {activeStep < productSteps.length - 1 ? (
            <button type="button" onClick={() => setActiveStep((step) => step + 1)} className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB]">Continue <ArrowRight className="h-3.5 w-3.5 text-[#D8B46A]" /></button>
          ) : (
            <button type="submit" className="rounded-xl bg-[#942E3A] px-6 py-3 text-xs font-bold text-[#FFF9EB]">Create complete product</button>
          )}
        </div>
      </div>
    </form>
  );
}

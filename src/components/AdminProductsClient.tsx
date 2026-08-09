"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, PackagePlus, Search, SlidersHorizontal } from "lucide-react";
import AdminProductStatusSelect from "@/components/AdminProductStatusSelect";
import AdminProductDiscountModal from "@/components/AdminProductDiscountModal";
import AdminAddProductModal from "@/components/AdminAddProductModal";
import { useAdminI18n } from "@/providers/AdminI18nContext";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  status: string;
  lowStockLimit?: number;
  image: string | null;
  stock: number;
  wholesalePrice: number | null;
  supplierId: string | null;
  variants: {
    id: string;
    size: string;
    stock: number;
    price: number | null;
    wholesalePrice: number | null;
    label: string;
  }[];
}

export default function AdminProductsClient({
  products,
  suppliers,
}: {
  products: ProductRow[];
  suppliers: { id: string; name: string }[];
}) {
  const { lang, t, formatPrice, formatNumber } = useAdminI18n();
  const isRtl = lang === "ar";

  const categories = [
    { key: "all", label: isRtl ? "جميع المنتجات" : "All products" },
    { key: "shoes", label: isRtl ? "أحذية" : "Shoes" },
    { key: "bags", label: isRtl ? "حقائب" : "Bags" },
    { key: "perfumes", label: isRtl ? "عطور" : "Perfumes" },
    { key: "accessories", label: isRtl ? "إكسسوارات" : "Accessories" },
  ];

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory =
          category === "all" || product.category.toLowerCase() === category;
        const matchesSearch = product.name
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [category, products, search],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            {isRtl ? "إدارة الكتالوج والتشكيلة" : "Catalog management"}
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            {t("products.title")}
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            {t("products.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/categories"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-xs font-bold text-[#942E3A] hover:bg-[#FFF9EB] transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#D8B46A]" />
            <span>{t("products.categories")}</span>
          </Link>
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-add-product"))
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-3 py-2.5 text-xs font-bold text-[#FFF9EB] hover:bg-[#7e2732] transition-colors"
          >
            <PackagePlus className="h-4 w-4 text-[#D8B46A]" />
            <span>{t("products.addProduct")}</span>
          </button>
        </div>
      </div>

      <AdminAddProductModal products={products} suppliers={suppliers} />

      <nav
        className="flex w-fit gap-1 rounded-2xl border border-[#942E3A]/10 bg-white p-1 shadow-xs"
        aria-label="Product management tabs"
      >
        <Link
          href="/admin/products"
          aria-current="page"
          className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
        >
          {t("navigation.products")}
        </Link>
        <Link
          href="/admin/products/categories"
          className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#942E3A]/65 hover:bg-[#FFF9EB] hover:text-[#942E3A]"
        >
          {isRtl ? "الأقسام والخيارات" : "Categories & options"}
        </Link>
      </nav>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55 font-bold">
            {t("common.all")}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(products.length)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55 font-bold">
            {isRtl ? "أحذية" : "Shoes"}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(products.filter((p) => p.category === "shoes").length)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3 shadow-xs">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55 font-bold">
            {t("products.statusArchived")}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(products.filter((p) => p.status === "archived").length)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3 shadow-xs">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55 font-bold">
            {t("dashboard.lowStockAlert")}
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {formatNumber(products.filter((p) => p.stock <= (p.lowStockLimit ?? 2)).length)}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(item.key)}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-bold transition-colors ${
                  category === item.key
                    ? "bg-[#942E3A] text-[#FFF9EB]"
                    : "bg-[#FFF9EB] text-[#942E3A]/70 hover:text-[#942E3A]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-64">
            <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A] ${isRtl ? "right-3" : "left-3"}`} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("common.search")}
              className={`w-full rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/60 py-2.5 text-xs outline-none focus:border-[#942E3A] ${isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"}`}
            />
          </label>
        </div>

        {/* Desktop Table View */}
        <div className="hide-scrollbar mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className={`pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>{t("products.productName")}</th>
                <th className={`pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>{t("products.category")}</th>
                <th className={`pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>{t("products.price")}</th>
                <th className={`pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>{t("products.stock")}</th>
                <th className={`pb-3 font-bold ${isRtl ? "text-right" : "text-left"}`}>{t("common.status")}</th>
                <th className={`pb-3 font-bold ${isRtl ? "text-left" : "text-right"}`}>{t("products.discounts")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td className="py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#D8B46A]"
                      aria-label={`Open ${product.name}`}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#FFF9EB]">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <span className="font-bold text-[#942E3A]">
                        {product.name}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 capitalize text-[#6B1F2A]">
                    {product.category}
                  </td>
                  <td className="py-3 font-bold text-[#942E3A]">
                    {formatPrice(product.price)}
                    {product.compareAtPrice && (
                      <span className={`text-[10px] font-normal text-[#6B1F2A]/45 line-through ${isRtl ? "mr-1" : "ml-1"}`}>
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className={
                        product.stock === 0
                          ? "font-bold text-red-600"
                          : product.stock <= 2
                          ? "font-bold text-amber-600"
                          : "text-[#6B1F2A]"
                      }
                    >
                      {formatNumber(product.stock)}
                    </span>
                  </td>
                  <td className="py-3">
                    <AdminProductStatusSelect
                      productId={product.id}
                      status={product.status}
                    />
                  </td>
                  <td className={`py-3 ${isRtl ? "text-left" : "text-right"}`}>
                    <AdminProductDiscountModal
                      productId={product.id}
                      productName={product.name}
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Filter className="h-7 w-7 text-[#D8B46A]" />
              <p className="mt-2 text-sm font-bold">{t("common.noResults")}</p>
            </div>
          )}
        </div>

        {/* Mobile View Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:hidden">
          {filtered.map((product) => (
            <article
              key={product.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-[#FFFDFC] shadow-xs"
            >
              <Link
                href={`/admin/products/${product.id}`}
                className="block p-2.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D8B46A]"
                aria-label={`Open ${product.name}`}
              >
                <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-[#FFF9EB]">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackagePlus className="h-7 w-7 text-[#D8B46A]" />
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 min-h-8 text-[11px] font-bold leading-4 text-[#942E3A]">
                  {product.name}
                </h3>
                <div className="mt-1 flex items-center justify-between gap-1 text-[10px] text-[#6B1F2A]/65">
                  <span className="capitalize">{product.category}</span>
                  <span className="font-bold text-[#942E3A]">
                    {t("products.stock")} {formatNumber(product.stock)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-1">
                  <span className="text-xs font-black text-[#942E3A]">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-[9px] text-[#6B1F2A]/45 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </Link>
              <div className="flex items-center justify-between gap-1 border-t border-[#942E3A]/8 px-2.5 py-2.5">
                <AdminProductStatusSelect
                  productId={product.id}
                  status={product.status}
                  compact
                />
                <AdminProductDiscountModal
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  compact
                />
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-center">
              <Filter className="h-7 w-7 text-[#D8B46A]" />
              <p className="mt-2 text-sm font-bold">{t("common.noResults")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

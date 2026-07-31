"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, PackagePlus, Search, SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AdminProductStatusSelect from "@/components/AdminProductStatusSelect";
import AdminProductDiscountModal from "@/components/AdminProductDiscountModal";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  status: string;
  image: string | null;
  stock: number;
}

const categories = [
  { key: "all", label: "All products" },
  { key: "shoes", label: "Shoes" },
  { key: "bags", label: "Bags" },
  { key: "perfumes", label: "Perfumes" },
  { key: "accessories", label: "Accessories" },
];

export default function AdminProductsClient({
  products,
}: {
  products: ProductRow[];
}) {
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
            Catalog management
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black text-[#942E3A]">
            Products
          </h1>
          <p className="mt-1 text-xs text-[#6B1F2A]/65">
            Manage your collection, pricing, visibility, and inventory.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/products/categories"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#942E3A]/15 bg-white px-3 py-2.5 text-xs font-bold text-[#942E3A]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#D8B46A]" /> Categories
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#942E3A] px-3 py-2.5 text-xs font-bold text-[#FFF9EB]"
          >
            <PackagePlus className="h-4 w-4 text-[#D8B46A]" /> Add product
          </Link>
        </div>
      </div>
      <nav
        className="flex w-fit gap-1 rounded-2xl border border-[#942E3A]/10 bg-white p-1 shadow-sm"
        aria-label="Product management tabs"
      >
        <Link
          href="/admin/products"
          aria-current="page"
          className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
        >
          Products
        </Link>
        <Link
          href="/admin/products/categories"
          className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#942E3A]/65 hover:bg-[#FFF9EB] hover:text-[#942E3A]"
        >
          Categories & options
        </Link>
      </nav>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Total
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {products.length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Shoes
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {products.filter((p) => p.category === "shoes").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Drafts
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {products.filter((p) => p.status === "draft").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D8B46A]/35 bg-[#fff7df] p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
            Low stock
          </p>
          <p className="mt-1 font-playfair text-2xl font-black">
            {products.filter((p) => p.stock <= 2).length}
          </p>
        </div>
      </div>
      <div className="rounded-3xl border border-[#942E3A]/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(item.key)}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-[10px] font-bold transition-colors ${category === item.key ? "bg-[#942E3A] text-[#FFF9EB]" : "bg-[#FFF9EB] text-[#942E3A]/70 hover:text-[#942E3A]"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="relative block lg:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]/60 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#942E3A]"
            />
          </label>
        </div>
        <div className="hide-scrollbar mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3 font-bold">Product</th>
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Price</th>
                <th className="pb-3 font-bold">Stock</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 text-right font-bold">Discount</th>
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
                    {formatCurrency(product.price)}
                    {product.compareAtPrice && (
                      <span className="ml-1 text-[10px] font-normal text-[#6B1F2A]/45 line-through">
                        {formatCurrency(product.compareAtPrice)}
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
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3">
                    <AdminProductStatusSelect productId={product.id} status={product.status} />
                  </td>
                  <td className="py-3 text-right">
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
              <p className="mt-2 text-sm font-bold">No products found</p>
              <p className="mt-1 text-xs text-[#6B1F2A]/60">
                Try another category or search term.
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:hidden">
          {filtered.map((product) => (
            <article
              key={product.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-[#942E3A]/10 bg-[#FFFDFC] shadow-[0_5px_18px_rgba(67,25,31,0.06)]"
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
                  <span className="font-bold text-[#942E3A]">Stock {product.stock}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-1">
                  <span className="text-xs font-black text-[#942E3A]">
                    {formatCurrency(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-[9px] text-[#6B1F2A]/45 line-through">
                      {formatCurrency(product.compareAtPrice)}
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
              <p className="mt-2 text-sm font-bold">No products found</p>
              <p className="mt-1 text-xs text-[#6B1F2A]/60">
                Try another category or search term.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

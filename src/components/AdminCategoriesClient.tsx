"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Tags, Trash2 } from "lucide-react";
import {
  createCatalogOptionAction,
  deleteCatalogOptionAction,
} from "@/app/admin/products/categories/actions";

interface Option {
  id: string;
  category: string;
  type: string;
  name: string;
  value: string | null;
}
const categories = [
  {
    key: "shoes",
    label: "Shoes",
    types: [
      { key: "brand", label: "Brands" },
      { key: "color", label: "Colors" },
      { key: "size", label: "Sizes" },
    ],
  },
  {
    key: "bags",
    label: "Bags",
    types: [
      { key: "subcategory", label: "Bag categories" },
      { key: "brand", label: "Brands" },
      { key: "color", label: "Colors" },
    ],
  },
  {
    key: "perfumes",
    label: "Perfumes",
    types: [
      { key: "brand", label: "Brands" },
      { key: "volume", label: "Sizes / ml" },
    ],
  },
  {
    key: "accessories",
    label: "Accessories",
    types: [
      { key: "subcategory", label: "Categories" },
      { key: "brand", label: "Brands" },
      { key: "material", label: "Materials" },
    ],
  },
];

export default function AdminCategoriesClient({
  options,
}: {
  options: Option[];
}) {
  const [category, setCategory] = useState("shoes");
  const selected =
    categories.find((item) => item.key === category) || categories[0];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Catalog setup
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">
          Categories & options
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-[#6B1F2A]/65">
          Set the reusable choices that appear while creating products. Keep
          these clean so storefront filters stay easy to use.
        </p>
      </div>
      <nav
        className="flex w-fit gap-1 rounded-2xl border border-[#942E3A]/10 bg-white p-1 shadow-sm"
        aria-label="Product management tabs"
      >
        <Link
          href="/admin/products"
          className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#942E3A]/65 hover:bg-[#FFF9EB] hover:text-[#942E3A]"
        >
          Products
        </Link>
        <Link
          href="/admin/products/categories"
          aria-current="page"
          className="rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
        >
          Categories & options
        </Link>
      </nav>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setCategory(item.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold ${category === item.key ? "bg-[#942E3A] text-[#FFF9EB]" : "bg-white text-[#942E3A]/70"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">Add option</h2>
          </div>
          <form action={createCatalogOptionAction} className="mt-5 space-y-3">
            <input type="hidden" name="category" value={category} />
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Option group
              </span>
              <select
                name="type"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
              >
                {selected.types.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Name
              </span>
              <input
                required
                name="name"
                placeholder="e.g. Nike"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none focus:border-[#942E3A]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Extra value{" "}
                <span className="font-normal normal-case text-[#6B1F2A]/50">
                  optional
                </span>
              </span>
              <input
                name="value"
                placeholder="e.g. #942E3A or 100ml"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none focus:border-[#942E3A]"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB]"
            >
              Save option
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">
              {selected.label} options
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selected.types.map((type) => (
              <div key={type.key} className="rounded-2xl bg-[#FFF9EB]/70 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#942E3A]">
                  {type.label}
                </p>
                <div className="mt-2 space-y-1.5">
                  {options
                    .filter(
                      (option) =>
                        option.category === category &&
                        option.type === type.key,
                    )
                    .map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-xs"
                      >
                        <span className="min-w-0 truncate font-semibold text-[#6B1F2A]">
                          {option.name}
                          {option.value && (
                            <small className="ml-1 text-[9px] text-[#6B1F2A]/50">
                              {option.value}
                            </small>
                          )}
                        </span>
                        <form action={deleteCatalogOptionAction}>
                          <input type="hidden" name="id" value={option.id} />
                          <button
                            type="submit"
                            aria-label={`Delete ${option.name}`}
                            className="shrink-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    ))}
                  {options.filter(
                    (option) =>
                      option.category === category && option.type === type.key,
                  ).length === 0 && (
                    <p className="py-3 text-[10px] text-[#6B1F2A]/50">
                      No options yet.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

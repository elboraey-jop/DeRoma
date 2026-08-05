import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { getActiveProducts } from "@/lib/products";
import AdminInventoryClient, { InventoryRow } from "@/components/AdminInventoryClient";
import Link from "next/link";
import {
  ArrowLeft,
  Footprints,
  Sparkle,
  ShoppingBag,
  Gem,
  Sparkles,
  Layers,
  AlertTriangle,
  XCircle,
  Package,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CATEGORY_MAP: Record<string, { name: string; icon: typeof Footprints }> = {
  shoes: { name: "Shoes", icon: Footprints },
  perfumes: { name: "Perfumes", icon: Sparkle },
  bags: { name: "Bags", icon: ShoppingBag },
  accessories: { name: "Accessories", icon: Gem },
};

export default async function InventoryCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireAdmin();
  const { slug } = await params;
  const categoryKey = slug.toLowerCase();

  const categoryMeta = CATEGORY_MAP[categoryKey];
  if (!categoryMeta) {
    notFound();
  }

  let rows: InventoryRow[] = [];

  try {
    const products = await prisma.product.findMany({
      where: {
        category: { equals: categoryKey, mode: "insensitive" },
      },
      include: { variants: true },
      orderBy: { name: "asc" },
    });

    rows = products.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        product: product.name,
        productStatus: product.status || "active",
        category: product.category || categoryKey,
        subcategory: product.subcategory || "General",
        brand: (product as any).brand || "DeRoma",
        sku: product.sku || "",
        size: variant.size,
        color: product.category?.toLowerCase() === "perfumes" ? "" : (product.color || ""),
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        stock: variant.stock,
        price: Number(variant.price || product.price || 0),
        lowStockLimit: product.lowStockLimit || 2,
      }))
    );
  } catch (error) {
    console.warn("Unable to query Prisma products for category inventory:", error);
    const products = await getActiveProducts();
    const catProducts = products.filter(
      (p) => p.category.toLowerCase() === categoryKey
    );

    rows = catProducts.flatMap((product) =>
      product.variants.map((variant) => ({
        variantId: variant.id,
        productId: product.id,
        product: product.name,
        productStatus: (product as any).status || "active",
        category: product.category || categoryKey,
        subcategory: product.subcategory || "General",
        brand: (product as any).brand || "DeRoma",
        sku: product.sku || "",
        size: variant.size,
        color: product.category?.toLowerCase() === "perfumes" ? "" : (product.color || ""),
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        stock: variant.stock,
        price: Number(variant.price || product.price || 0),
        lowStockLimit: 2,
      }))
    );
  }

  const CategoryIcon = categoryMeta.icon;

  const totalProducts = new Set(rows.map((r) => r.productId)).size;
  const totalVariants = rows.length;
  const totalUnits = rows.reduce((sum, r) => sum + r.stock, 0);
  const totalValuation = rows.reduce((sum, r) => sum + r.stock * r.price, 0);
  const lowStockCount = rows.filter((r) => r.stock > 0 && r.stock <= r.lowStockLimit).length;
  const outOfStockCount = rows.filter((r) => r.stock === 0).length;

  // 1. Sizes / Volumes Breakdown
  const sizesMap: Record<string, { size: string; productIds: Set<string>; units: number; val: number }> = {};
  rows.forEach((r) => {
    if (!r.size) return;
    if (!sizesMap[r.size]) {
      sizesMap[r.size] = { size: r.size, productIds: new Set(), units: 0, val: 0 };
    }
    sizesMap[r.size].productIds.add(r.productId);
    sizesMap[r.size].units += r.stock;
    sizesMap[r.size].val += r.stock * r.price;
  });
  const sizesBreakdown = Object.values(sizesMap)
    .map((item) => ({
      size: item.size,
      productsCount: item.productIds.size,
      units: item.units,
      val: item.val,
    }))
    .sort((a, b) => a.size.localeCompare(b.size, undefined, { numeric: true }));

  // 2. Colors Breakdown (Excluded for perfumes)
  const colorsMap: Record<string, { color: string; productIds: Set<string>; units: number; val: number }> = {};
  if (categoryKey !== "perfumes") {
    rows.forEach((r) => {
      if (!r.color) return;
      if (!colorsMap[r.color]) {
        colorsMap[r.color] = { color: r.color, productIds: new Set(), units: 0, val: 0 };
      }
      colorsMap[r.color].productIds.add(r.productId);
      colorsMap[r.color].units += r.stock;
      colorsMap[r.color].val += r.stock * r.price;
    });
  }
  const colorsBreakdown = Object.values(colorsMap)
    .map((item) => ({
      color: item.color,
      productsCount: item.productIds.size,
      units: item.units,
      val: item.val,
    }))
    .sort((a, b) => a.color.localeCompare(b.color));

  // 3. Brands Breakdown
  const brandsMap: Record<string, { brand: string; productIds: Set<string>; units: number; val: number }> = {};
  rows.forEach((r) => {
    if (!r.brand) return;
    if (!brandsMap[r.brand]) {
      brandsMap[r.brand] = { brand: r.brand, productIds: new Set(), units: 0, val: 0 };
    }
    brandsMap[r.brand].productIds.add(r.productId);
    brandsMap[r.brand].units += r.stock;
    brandsMap[r.brand].val += r.stock * r.price;
  });
  const brandsBreakdown = Object.values(brandsMap)
    .map((item) => ({
      brand: item.brand,
      productsCount: item.productIds.size,
      units: item.units,
      val: item.val,
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand));

  return (
    <div className="space-y-6">
      {/* Dedicated Category Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#942E3A]/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/inventory"
            className="rounded-xl border border-[#942E3A]/15 bg-white p-2.5 text-[#942E3A] transition hover:border-[#D8B46A] shadow-sm shrink-0"
            aria-label="Back to All Inventory"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#942E3A] text-[#FFF9EB] shadow-md">
              <CategoryIcon className="h-6 w-6 text-[#D8B46A]" />
            </div>
            <div>
              <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
                {categoryMeta.name} Dedicated Inventory
              </h1>
              <p className="text-xs text-[#6B1F2A]/65 font-medium">
                Comprehensive stock ledger & variant analytics for {categoryMeta.name}.
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/admin/inventory/audits/new?category=${categoryKey}`}
          className="flex items-center gap-2 rounded-2xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB] shadow-md transition hover:bg-[#802832] active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-[#D8B46A]" />
          <span>Audit {categoryMeta.name} Stock</span>
        </Link>
      </div>

      {/* Category Specific KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            Total Products
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            {categoryMeta.name} Variants
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {totalVariants}
          </p>
        </div>

        <div className="rounded-2xl border border-[#942E3A]/10 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            Total Units
          </p>
          <p className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
            {totalUnits.toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/40 bg-[#fff7df] p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
            Category Valuation
          </p>
          <p className="mt-1 font-playfair text-xl font-black text-[#942E3A]">
            {formatCurrency(totalValuation)}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D8B46A]/30 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B1F2A]/55">
              Low Stock
            </p>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 font-playfair text-2xl font-black text-amber-700">
            {lowStockCount}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700/65">
              Out of Stock
            </p>
            <XCircle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-1 font-playfair text-2xl font-black text-rose-700">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Category Variant Metrics Matrix */}
      <div className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-[#942E3A]/10 pb-3">
          <Layers className="h-5 w-5 text-[#D8B46A]" />
          <h3 className="font-playfair text-xl font-bold text-[#942E3A]">
            {categoryMeta.name} Variant Metrics Matrix
          </h3>
        </div>

        {/* Row 1: Sizes / Volumes Breakdown */}
        {sizesBreakdown.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#942E3A]">
              <span className="uppercase tracking-wider text-[11px] text-[#D8B46A]">
                {categoryKey === "perfumes" ? "Volumes Breakdown" : "Sizes Breakdown"}
              </span>
              <span className="text-[10px] text-[#6B1F2A]/50 font-normal">
                {sizesBreakdown.length} unique {categoryKey === "perfumes" ? "volumes" : "sizes"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {sizesBreakdown.map((item) => (
                <div
                  key={item.size}
                  className="rounded-2xl border border-[#942E3A]/12 bg-[#FFF9EB]/70 p-3 shadow-xs hover:border-[#D8B46A] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#942E3A]">
                      {categoryKey === "perfumes" ? item.size : `Size ${item.size}`}
                    </span>
                    <span className="text-[10px] text-[#6B1F2A]/50 font-semibold">
                      {item.productsCount} prods
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-xs">
                    <span className="font-playfair text-base font-bold text-[#942E3A]">
                      {item.units} <span className="text-[10px] font-sans font-normal text-[#6B1F2A]/60">units</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B1F2A]/70">
                      {formatCurrency(item.val)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Row 2: Colors Breakdown (Non-perfumes) */}
        {colorsBreakdown.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-[#942E3A]/8">
            <div className="flex items-center justify-between text-xs font-bold text-[#942E3A]">
              <span className="uppercase tracking-wider text-[11px] text-[#D8B46A]">
                Colors Breakdown
              </span>
              <span className="text-[10px] text-[#6B1F2A]/50 font-normal">
                {colorsBreakdown.length} unique colors
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {colorsBreakdown.map((item) => (
                <div
                  key={item.color}
                  className="rounded-2xl border border-[#942E3A]/12 bg-[#FFF9EB]/70 p-3 shadow-xs hover:border-[#D8B46A] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#942E3A] truncate">
                      {item.color}
                    </span>
                    <span className="text-[10px] text-[#6B1F2A]/50 font-semibold shrink-0 ml-1">
                      {item.productsCount} prods
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-xs">
                    <span className="font-playfair text-base font-bold text-[#942E3A]">
                      {item.units} <span className="text-[10px] font-sans font-normal text-[#6B1F2A]/60">units</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B1F2A]/70">
                      {formatCurrency(item.val)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Row 3: Brands Breakdown */}
        {brandsBreakdown.length > 0 && (
          <div className="space-y-2.5 pt-3 border-t border-[#942E3A]/8">
            <div className="flex items-center justify-between text-xs font-bold text-[#942E3A]">
              <span className="uppercase tracking-wider text-[11px] text-[#D8B46A]">
                Brands Breakdown
              </span>
              <span className="text-[10px] text-[#6B1F2A]/50 font-normal">
                {brandsBreakdown.length} brands
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {brandsBreakdown.map((item) => (
                <div
                  key={item.brand}
                  className="rounded-2xl border border-[#942E3A]/12 bg-[#FFF9EB]/70 p-3 shadow-xs hover:border-[#D8B46A] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#942E3A] truncate">
                      {item.brand}
                    </span>
                    <span className="text-[10px] text-[#6B1F2A]/50 font-semibold shrink-0 ml-1">
                      {item.productsCount} prods
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between text-xs">
                    <span className="font-playfair text-base font-bold text-[#942E3A]">
                      {item.units} <span className="text-[10px] font-sans font-normal text-[#6B1F2A]/60">units</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#6B1F2A]/70">
                      {formatCurrency(item.val)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Filtered Inventory Table */}
      <AdminInventoryClient
        initialRows={rows}
        hideHeader={true}
        hideCategoryCards={true}
      />
    </div>
  );
}

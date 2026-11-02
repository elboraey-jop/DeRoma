import { NextRequest, NextResponse } from "next/server";
import { getActiveProducts, getProductPath } from "@/lib/products";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
  const all = request.nextUrl.searchParams.get("all") === "1";

  if (!all && query.length < 1) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await getActiveProducts();
    const matches = products
      .filter((product) => {
        if (all) return true;
        const searchable = [product.name, product.brand, product.category, product.subcategory, product.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(query);
      })
      .slice(0, all ? 100 : 6)
      .map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand || null,
        price: Number(product.price),
        image: product.images[0] || null,
        href: getProductPath(product),
        searchText: [product.name, product.brand, product.category, product.subcategory, product.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      }));

    return NextResponse.json({ products: matches });
  } catch {
    return NextResponse.json({ products: [] });
  }
}

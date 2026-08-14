import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActiveProducts } from "@/lib/products";

export const dynamic = "force-dynamic";
export const revalidate = 1800; // 30 minutes cache for optimal freshness

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanText(text?: string | null): string {
  if (!text) return "";
  // Strip any HTML tags and collapse whitespace
  return text.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
}

function escapeCsv(field: string): string {
  if (
    field.includes(",") ||
    field.includes('"') ||
    field.includes("\n") ||
    field.includes("\r")
  ) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function getAbsoluteImageUrl(
  imageUrl: string | undefined | null,
  baseUrl: string
): string {
  if (!imageUrl) {
    return `${baseUrl}/og-image.jpg`;
  }
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${baseUrl}${cleanPath}`;
}

function mapTaxonomy(category?: string | null, subcategory?: string | null) {
  const cat = (category || "").toLowerCase().trim();
  switch (cat) {
    case "shoes":
      return {
        googleCategory: "Apparel & Accessories > Shoes",
        fbCategory: "Apparel & Accessories > Shoes",
        gender: "female",
        ageGroup: "adult",
      };
    case "bags":
      return {
        googleCategory: "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
        fbCategory: "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
        gender: "female",
        ageGroup: "adult",
      };
    case "perfumes":
    case "perfume":
      return {
        googleCategory: "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
        fbCategory: "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
        gender: "unisex",
        ageGroup: "adult",
      };
    case "accessories":
      return {
        googleCategory: "Apparel & Accessories > Clothing Accessories",
        fbCategory: "Apparel & Accessories > Clothing Accessories",
        gender: "female",
        ageGroup: "adult",
      };
    default:
      return {
        googleCategory: "Apparel & Accessories",
        fbCategory: "Apparel & Accessories",
        gender: "unisex",
        ageGroup: "adult",
      };
  }
}

interface FeedProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  subcategory: string | null;
  brand: string;
  color: string | null;
  material: string | null;
  images: string[];
  totalStock: number;
  sizes: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
  badge: string | null;
}

async function fetchAllCatalogProducts(): Promise<FeedProductItem[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "active" },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });

    if (dbProducts.length > 0) {
      return dbProducts.map((p) => {
        const totalStock = p.variants.length
          ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
          : 10;
        const sizes = p.variants
          .map((v) => v.size?.trim())
          .filter((s): s is string => Boolean(s));

        return {
          id: p.id,
          name: p.name,
          description: cleanText(p.description) || cleanText(p.name) || "DeRoma Luxury Product",
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          category: p.category || "shoes",
          subcategory: p.subcategory,
          brand: p.brand?.trim() || "DeRoma",
          color: p.color?.trim() || null,
          material: p.material?.trim() || null,
          images: p.images || [],
          totalStock,
          sizes: Array.from(new Set(sizes)),
          isFeatured: Boolean(p.featured),
          isBestSeller: Boolean(p.bestSeller),
          badge: p.badge || null,
        };
      });
    }
  } catch (err) {
    console.warn("Catalog Feed: Using fallback products dataset:", err);
  }

  // Fallback to active catalog products
  const fallbackList = await getActiveProducts();
  return fallbackList.map((p) => {
    const totalStock = p.variants?.length
      ? p.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : 10;
    const sizes = (p.variants || [])
      .map((v) => v.size?.trim())
      .filter((s): s is string => Boolean(s));

    return {
      id: p.id,
      name: p.name,
      description: cleanText(p.description) || cleanText(p.name) || "DeRoma Luxury Product",
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      category: p.category || "shoes",
      subcategory: p.subcategory || null,
      brand: p.brand?.trim() || "DeRoma",
      color: p.color?.trim() || null,
      material: null,
      images: p.images || [],
      totalStock,
      sizes: Array.from(new Set(sizes)),
      isFeatured: false,
      isBestSeller: false,
      badge: null,
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get("format") || "xml").toLowerCase();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      request.nextUrl.origin ||
      "https://deroma.store";

    const products = await fetchAllCatalogProducts();

    if (format === "csv") {
      const headers = [
        "id",
        "title",
        "description",
        "availability",
        "condition",
        "price",
        "sale_price",
        "link",
        "image_link",
        "additional_image_link",
        "brand",
        "google_product_category",
        "fb_product_category",
        "product_type",
        "item_group_id",
        "color",
        "size",
        "material",
        "gender",
        "age_group",
        "inventory",
        "custom_label_0",
        "custom_label_1",
        "custom_label_2",
        "custom_label_3",
        "custom_label_4",
      ];

      const rows = products.map((p) => {
        const isAvailable = p.totalStock > 0;
        const availability = isAvailable ? "in stock" : "out of stock";

        const hasDiscount =
          p.compareAtPrice != null && Number(p.compareAtPrice) > Number(p.price);

        const regularPrice = hasDiscount
          ? `${Number(p.compareAtPrice).toFixed(2)} EGP`
          : `${Number(p.price).toFixed(2)} EGP`;
        const salePrice = hasDiscount ? `${Number(p.price).toFixed(2)} EGP` : "";

        const productLink = `${baseUrl}/shop/${p.id}`;
        const mainImage = getAbsoluteImageUrl(p.images[0], baseUrl);
        const additionalImages = p.images
          .slice(1, 10)
          .map((img) => getAbsoluteImageUrl(img, baseUrl))
          .join(",");

        const taxonomy = mapTaxonomy(p.category, p.subcategory);
        const productType = p.subcategory
          ? `${p.category} > ${p.subcategory}`
          : p.category || "General";

        const customLabel0 = p.category; // Category for ad grouping
        const customLabel1 = hasDiscount ? "On Sale" : "Regular Price";
        const customLabel2 = p.isBestSeller
          ? "Best Seller"
          : p.isFeatured
          ? "Featured"
          : "Normal";
        const customLabel3 =
          p.totalStock > 5 ? "In Stock" : p.totalStock > 0 ? "Low Stock" : "Out of Stock";
        const customLabel4 = p.brand || "DeRoma";

        return [
          escapeCsv(p.id),
          escapeCsv(p.name),
          escapeCsv(p.description),
          escapeCsv(availability),
          "new",
          escapeCsv(regularPrice),
          escapeCsv(salePrice),
          escapeCsv(productLink),
          escapeCsv(mainImage),
          escapeCsv(additionalImages),
          escapeCsv(p.brand),
          escapeCsv(taxonomy.googleCategory),
          escapeCsv(taxonomy.fbCategory),
          escapeCsv(productType),
          escapeCsv(p.id),
          escapeCsv(p.color || ""),
          escapeCsv(p.sizes.join("/")),
          escapeCsv(p.material || ""),
          escapeCsv(taxonomy.gender),
          escapeCsv(taxonomy.ageGroup),
          escapeCsv(String(p.totalStock)),
          escapeCsv(customLabel0),
          escapeCsv(customLabel1),
          escapeCsv(customLabel2),
          escapeCsv(customLabel3),
          escapeCsv(customLabel4),
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
          "Content-Disposition": 'inline; filename="deroma-meta-catalog.csv"',
        },
      });
    }

    if (format === "json") {
      const items = products.map((p) => {
        const isAvailable = p.totalStock > 0;
        const hasDiscount =
          p.compareAtPrice != null && Number(p.compareAtPrice) > Number(p.price);
        const taxonomy = mapTaxonomy(p.category, p.subcategory);

        return {
          id: p.id,
          title: p.name,
          description: p.description,
          availability: isAvailable ? "in stock" : "out of stock",
          condition: "new",
          price: hasDiscount
            ? `${Number(p.compareAtPrice).toFixed(2)} EGP`
            : `${Number(p.price).toFixed(2)} EGP`,
          sale_price: hasDiscount ? `${Number(p.price).toFixed(2)} EGP` : undefined,
          link: `${baseUrl}/shop/${p.id}`,
          image_link: getAbsoluteImageUrl(p.images[0], baseUrl),
          additional_image_link: p.images
            .slice(1, 10)
            .map((img) => getAbsoluteImageUrl(img, baseUrl)),
          brand: p.brand,
          google_product_category: taxonomy.googleCategory,
          fb_product_category: taxonomy.fbCategory,
          product_type: p.subcategory ? `${p.category} > ${p.subcategory}` : p.category,
          item_group_id: p.id,
          color: p.color || undefined,
          size: p.sizes.length ? p.sizes.join("/") : undefined,
          material: p.material || undefined,
          gender: taxonomy.gender,
          age_group: taxonomy.ageGroup,
          inventory: p.totalStock,
          custom_labels: {
            custom_label_0: p.category,
            custom_label_1: hasDiscount ? "On Sale" : "Regular Price",
            custom_label_2: p.isBestSeller ? "Best Seller" : p.isFeatured ? "Featured" : "Normal",
            custom_label_3:
              p.totalStock > 5 ? "In Stock" : p.totalStock > 0 ? "Low Stock" : "Out of Stock",
            custom_label_4: p.brand,
          },
        };
      });

      return NextResponse.json(
        {
          store: "DeRoma",
          domain: baseUrl,
          count: items.length,
          generatedAt: new Date().toISOString(),
          products: items,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
          },
        }
      );
    }

    // Default: Meta / Google Merchant standard RSS 2.0 XML format with full Commerce Manager schema
    const itemsXml = products
      .map((p) => {
        const isAvailable = p.totalStock > 0;
        const availability = isAvailable ? "in stock" : "out of stock";

        const hasDiscount =
          p.compareAtPrice != null && Number(p.compareAtPrice) > Number(p.price);

        const regularPrice = hasDiscount
          ? `${Number(p.compareAtPrice).toFixed(2)} EGP`
          : `${Number(p.price).toFixed(2)} EGP`;
        const salePrice = hasDiscount ? `${Number(p.price).toFixed(2)} EGP` : "";

        const productLink = `${baseUrl}/shop/${p.id}`;
        const mainImage = getAbsoluteImageUrl(p.images[0], baseUrl);
        const additionalImagesXml = p.images
          .slice(1, 10)
          .map(
            (img) =>
              `<g:additional_image_link>${escapeXml(
                getAbsoluteImageUrl(img, baseUrl)
              )}</g:additional_image_link>`
          )
          .join("\n      ");

        const taxonomy = mapTaxonomy(p.category, p.subcategory);
        const productType = p.subcategory
          ? `${p.category} > ${p.subcategory}`
          : p.category || "General";

        const customLabel0 = p.category;
        const customLabel1 = hasDiscount ? "On Sale" : "Regular Price";
        const customLabel2 = p.isBestSeller
          ? "Best Seller"
          : p.isFeatured
          ? "Featured"
          : "Normal";
        const customLabel3 =
          p.totalStock > 5 ? "In Stock" : p.totalStock > 0 ? "Low Stock" : "Out of Stock";
        const customLabel4 = p.brand || "DeRoma";

        return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title><![CDATA[${p.name}]]></g:title>
      <g:description><![CDATA[${p.description}]]></g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(mainImage)}</g:image_link>
      ${additionalImagesXml ? `${additionalImagesXml}\n      ` : ""}<g:brand><![CDATA[${p.brand}]]></g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${escapeXml(regularPrice)}</g:price>
      ${salePrice ? `<g:sale_price>${escapeXml(salePrice)}</g:sale_price>\n      ` : ""}<g:google_product_category><![CDATA[${taxonomy.googleCategory}]]></g:google_product_category>
      <g:fb_product_category><![CDATA[${taxonomy.fbCategory}]]></g:fb_product_category>
      <g:product_type><![CDATA[${productType}]]></g:product_type>
      <g:item_group_id>${escapeXml(p.id)}</g:item_group_id>
      ${p.color ? `<g:color><![CDATA[${p.color}]]></g:color>\n      ` : ""}${p.sizes.length ? `<g:size><![CDATA[${p.sizes.join("/")}]]></g:size>\n      ` : ""}${p.material ? `<g:material><![CDATA[${p.material}]]></g:material>\n      ` : ""}<g:gender>${taxonomy.gender}</g:gender>
      <g:age_group>${taxonomy.ageGroup}</g:age_group>
      <g:inventory>${p.totalStock}</g:inventory>
      <g:custom_label_0><![CDATA[${customLabel0}]]></g:custom_label_0>
      <g:custom_label_1><![CDATA[${customLabel1}]]></g:custom_label_1>
      <g:custom_label_2><![CDATA[${customLabel2}]]></g:custom_label_2>
      <g:custom_label_3><![CDATA[${customLabel3}]]></g:custom_label_3>
      <g:custom_label_4><![CDATA[${customLabel4}]]></g:custom_label_4>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>DeRoma Official Product Catalog</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Official Dynamic Product Catalog Feed for Meta Ads, Instagram Shop and Facebook Commerce Manager</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating Meta Catalog feed:", error);
    return new NextResponse("Internal Server Error generating feed", {
      status: 500,
    });
  }
}

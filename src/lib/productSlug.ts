export function slugifyProductName(name: string): string {
  const slug = name
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "product";
}

export function getProductPath(product: { id: string; name: string; slug?: string | null }): string {
  return `/shop/${encodeURIComponent(product.slug || slugifyProductName(product.name) || product.id)}`;
}

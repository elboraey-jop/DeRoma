const SKU_PREFIXES: Record<string, string> = {
  shoes: "S",
  bags: "B",
  perfumes: "P",
  accessories: "A",
};

export function skuPrefix(category: string) {
  return SKU_PREFIXES[category] || "A";
}

export function nextSkuFromValues(category: string, values: Array<string | null | undefined>) {
  const prefix = skuPrefix(category);
  const highest = values.reduce((max, value) => {
    const match = value?.match(new RegExp(`^${prefix}(\\d+)$`, "i"));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

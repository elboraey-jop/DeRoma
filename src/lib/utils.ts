import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, lang: "ar" | "en" = "ar") {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "EGP 0";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  return `EGP ${formatted}`;
}

export function sortVariantsByNumericSize<T extends { size: string }>(variants: T[]): T[] {
  if (!variants || !Array.isArray(variants)) return [];
  return [...variants].sort((a, b) => {
    const numA = parseFloat(a.size);
    const numB = parseFloat(b.size);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.size.localeCompare(b.size, undefined, { numeric: true, sensitivity: "base" });
  });
}

export function sortSizesList(sizes: string[]): string[] {
  if (!sizes || !Array.isArray(sizes)) return [];
  return [...sizes].sort((a, b) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  });
}

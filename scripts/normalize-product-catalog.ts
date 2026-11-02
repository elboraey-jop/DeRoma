import "dotenv/config";
import prisma from "../src/lib/prisma";

const BRAND_ALIASES: Record<string, string> = {
  adidas: "Adidas",
  adiddas: "Adidas",
  addidas: "Adidas",
  asics: "ASICS",
  asic: "ASICS",
  nike: "Nike",
  nika: "Nike",
  nikе: "Nike",
  puma: "Puma",
  "new balance": "New Balance",
  newbalance: "New Balance",
  "new-balance": "New Balance",
  balenciaga: "Balenciaga",
  balenciagga: "Balenciaga",
  balenciage: "Balenciaga",
  dior: "Dior",
  lacoste: "Lacoste",
  lacost: "Lacoste",
  reebok: "Reebok",
  converse: "Converse",
  vans: "Vans",
  van: "Vans",
  skechers: "Skechers",
  "on cloud": "On",
  on: "On",
};

const KNOWN_BRANDS = Object.values(BRAND_ALIASES).filter(
  (brand, index, brands) => brands.indexOf(brand) === index,
).sort((a, b) => b.length - a.length);

const COLOR_ALIASES: Record<string, string> = {
  white: "White",
  wihte: "White",
  whit: "White",
  offwhite: "Off-White",
  "off-white": "Off-White",
  black: "Black",
  blak: "Black",
  beige: "Beige",
  baige: "Beige",
  biege: "Beige",
  biage: "Beige",
  cream: "Cream",
  grey: "Grey",
  gray: "Grey",
  graey: "Grey",
  pink: "Pink",
  prink: "Pink",
  brown: "Brown",
  brwon: "Brown",
  burgundy: "Burgundy",
  burgandy: "Burgundy",
  navy: "Navy",
  blue: "Blue",
  red: "Red",
  green: "Green",
  yellow: "Yellow",
  orange: "Orange",
  purple: "Purple",
  silver: "Silver",
  silvr: "Silver",
  gold: "Gold",
  golden: "Gold",
  tan: "Tan",
  khaki: "Khaki",
  ivory: "Ivory",
  maroon: "Maroon",
  teal: "Teal",
  coral: "Coral",
  metallic: "Metallic",
  pastel: "Pastel",
  light: "Light",
  dark: "Dark",
  sea: "Sea",
  salt: "Salt",
  moonbeam: "Moonbeam",
  gum: "Gum",
  foam: "Foam",
  orewood: "Orewood",
  baby: "Baby",
  neavyblue: "Navy-Blue",
  purpel: "Purple",
};

function clean(value: string) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalBrand(value: string | null | undefined) {
  const normalized = clean(String(value || "")).toLowerCase();
  if (!normalized) return "";
  return BRAND_ALIASES[normalized] || titleCase(normalized);
}

function findBrand(name: string, storedBrand: string | null | undefined) {
  const stored = canonicalBrand(storedBrand);
  if (stored && KNOWN_BRANDS.includes(stored)) return stored;
  const normalizedName = clean(name).toLowerCase();
  const found = KNOWN_BRANDS.find((brand) => {
    const aliases = Object.entries(BRAND_ALIASES)
      .filter(([, canonical]) => canonical === brand)
      .map(([alias]) => alias);
    return aliases.some((alias) => normalizedName === alias || normalizedName.startsWith(`${alias} `));
  });
  return found || stored;
}

function stripLeadingBrand(value: string, brand: string) {
  const aliases = Object.entries(BRAND_ALIASES)
    .filter(([, canonical]) => canonical === brand)
    .filter(([alias]) => brand !== "On" || alias === "on")
    .map(([alias]) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length);
  if (!aliases.length) return value;
  return value.replace(new RegExp(`^(?:${aliases.join("|")})\\s*`, "i"), "").trim();
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function canonicalColor(value: string | null | undefined) {
  const normalized = clean(String(value || ""))
    .replace(/[&+,/]/g, "-")
    .replace(/-+/g, "-")
    .trim();
  if (!normalized) return "";
  return normalized
    .split(/[- ]/)
    .filter(Boolean)
    .map((part) => COLOR_ALIASES[part.toLowerCase()] || titleCase(part))
    .join("-");
}

function splitModelAndColor(value: string, storedColor: string | null | undefined) {
  const normalized = clean(value);
  const explicitSeparator = normalized.match(/\s+-\s*|[-]\s+/);
  if (explicitSeparator?.index !== undefined) {
    return {
      model: normalized.slice(0, explicitSeparator.index).trim(),
      color: normalized.slice(explicitSeparator.index + explicitSeparator[0].length).trim(),
    };
  }

  const stored = clean(String(storedColor || ""));
  if (stored) {
    const aliases = [stored, ...stored.split(/[&/,+-]/).map((part) => part.trim()).filter(Boolean)]
      .sort((a, b) => b.length - a.length);
    for (const alias of aliases) {
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = normalized.match(new RegExp(`(?:^|[-])\\s*(${escaped}(?:[-&/]\\s*[A-Za-z]+)*)\\s*$`, "i"));
      if (match?.index !== undefined) {
        const color = match[1];
        const colorStart = normalized.length - color.length;
        return { model: normalized.slice(0, colorStart).replace(/[\s-]+$/, "").trim(), color };
      }
    }
  }

  const parts = normalized.split(" ");
  let index = parts.length;
  while (index > 0) {
    const token = parts[index - 1].toLowerCase();
    if (!COLOR_ALIASES[token] && !/[&/]/.test(token)) break;
    index -= 1;
  }
  return index < parts.length
    ? { model: parts.slice(0, index).join(" "), color: parts.slice(index).join(" ") }
    : { model: normalized, color: "" };
}

function normalizeProduct(product: { name: string; brand: string | null; color: string | null }) {
  const brand = findBrand(product.name, product.brand);
  const modelAndColor = brand ? stripLeadingBrand(clean(product.name), brand) : clean(product.name);
  const split = splitModelAndColor(modelAndColor, product.color);
  const color = canonicalColor(split.color || product.color);
  const model = normalizeModel(split.model || "");
  const namePrefix = [brand, model].filter(Boolean).join(" ") || "Product";
  const name = color ? `${namePrefix} - ${color}` : namePrefix;
  return { name: name.replace(/\s+/g, " ").trim(), brand: brand || null, color: color || null };
}

function normalizeModel(value: string) {
  return value
    .replace(/\bAd\s+Star\b/gi, "Adistar")
    .replace(/\bAd\s+Zero\b/gi, "Adizero")
    .replace(/\bSampa\b/gi, "Samba")
    .replace(/\bSuper\s+Star\b/gi, "Superstar")
    .replace(/\bMUI\s+MUI\b/gi, "Miu Miu")
    .replace(/\bCloud\s+Tilt\b/gi, "Cloudtilt")
    .replace(/\bKnu\s+School\b/gi, "Knu Skool")
    .replace(/\bTekno\s+M2K\b/gi, "M2K Tekno")
    .replace(/\bNika\b/gi, "Nike")
    .replace(/\bSpazial\b/gi, "Spezial")
    .replace(/\bFourm\b/gi, "Forum")
    .replace(/\bFourn\b/gi, "Forum")
    .replace(/\bTriple s\b/gi, "Triple S")
    .replace(/\bgel-nyc\b/gi, "Gel-NYC")
    .replace(/\bgel-kayano\b/gi, "Gel-Kayano")
    .replace(/\bv2k\b/gi, "V2K")
    .replace(/\bp600\b/gi, "P600")
    .replace(/\bsb\b/gi, "SB")
    .replace(/\bsp\b/gi, "SB")
    .replace(/\s+/g, " ")
    .trim();
}

async function normalizeProductCatalog() {
  const execute = process.argv.includes("--execute");
  const products = await prisma.product.findMany({
    select: { id: true, name: true, brand: true, color: true },
    orderBy: { name: "asc" },
  });
  const options = await prisma.catalogOption.findMany({
    where: { type: { in: ["brand", "color"] } },
    select: { id: true, category: true, type: true, name: true },
    orderBy: { name: "asc" },
  });

  const productChanges = products.map((product) => ({
    product,
    next: normalizeProduct(product),
  })).filter(({ product, next }) => product.name !== next.name || product.brand !== next.brand || product.color !== next.color);
  const optionChanges = options.map((option) => ({
    option,
    next: option.type === "brand" ? canonicalBrand(option.name) : canonicalColor(option.name),
  })).filter(({ option, next }) => Boolean(next) && option.name !== next);

  console.log("Product catalog normalization preview");
  console.log(`- Products scanned: ${products.length}`);
  console.log(`- Product records to update: ${productChanges.length}`);
  console.log(`- Brand/color options scanned: ${options.length}`);
  console.log(`- Catalog options to update: ${optionChanges.length}`);
  for (const { product, next } of productChanges) {
    console.log(`PRODUCT ${product.id}: ${product.name} -> ${next.name}`);
    if (product.brand !== next.brand) console.log(`  brand: ${product.brand || "(empty)"} -> ${next.brand || "(empty)"}`);
    if (product.color !== next.color) console.log(`  color: ${product.color || "(empty)"} -> ${next.color || "(empty)"}`);
  }
  for (const { option, next } of optionChanges) {
    console.log(`OPTION ${option.category}/${option.type}: ${option.name} -> ${next}`);
  }

  if (!execute) {
    console.log("\nNo changes made. Run with --execute to apply the normalized product data.");
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    let updatedProducts = 0;
    let updatedOptions = 0;
    const skippedOptions: string[] = [];

    for (const { product, next } of productChanges) {
      await tx.product.update({
        where: { id: product.id },
        data: next,
      });
      updatedProducts += 1;
    }

    for (const { option, next } of optionChanges) {
      const duplicate = await tx.catalogOption.findFirst({
        where: { category: option.category, type: option.type, name: next, id: { not: option.id } },
        select: { id: true },
      });
      if (duplicate) {
        skippedOptions.push(`${option.category}/${option.type}/${option.name}`);
        continue;
      }
      await tx.catalogOption.update({ where: { id: option.id }, data: { name: next } });
      updatedOptions += 1;
    }

    return { updatedProducts, updatedOptions, skippedOptions };
  }, { maxWait: 20000, timeout: 120000 });

  console.log("\nProduct catalog normalization applied successfully");
  console.log(`- Products updated: ${result.updatedProducts}`);
  console.log(`- Catalog options updated: ${result.updatedOptions}`);
  console.log(`- Duplicate options skipped safely: ${result.skippedOptions.length}`);
  for (const option of result.skippedOptions) console.log(`  skipped: ${option}`);
}

normalizeProductCatalog()
  .catch((error) => {
    console.error("Product catalog normalization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

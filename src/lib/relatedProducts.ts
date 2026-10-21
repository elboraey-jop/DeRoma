export interface RelatedProductInput {
  id: string;
  name: string;
  category?: string | null;
  brand?: string | null;
  color?: string | null;
  variants?: Array<{ stock: number }>;
}

const KNOWN_BRANDS = [
  "new balance",
  "under armour",
  "adidas",
  "nike",
  "asics",
  "puma",
  "reebok",
  "converse",
  "skechers",
  "vans",
];

const KNOWN_COLORS = [
  "pastel pink",
  "light pink",
  "dark brown",
  "light brown",
  "cream burgundy",
  "burgundy",
  "beige",
  "black",
  "white",
  "brown",
  "pink",
  "red",
  "grey",
  "gray",
  "navy",
  "silver",
  "gold",
  "cream",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
];

const MODEL_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "the",
  "women",
  "womens",
  "woman",
  "men",
  "mens",
  "unisex",
  "shoe",
  "shoes",
  "sneaker",
  "sneakers",
  "footwear",
  "original",
  "mirror",
  "premium",
  "classic",
]);

function normalize(value: string | null | undefined): string {
  return (value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function tokens(value: string | null | undefined): string[] {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function findKnownPhrase(name: string, phrases: string[]): string[] {
  const normalizedName = normalize(name);
  return phrases.filter((phrase) => normalizedName.includes(phrase));
}

function getBrand(product: RelatedProductInput): string {
  return normalize(product.brand) || findKnownPhrase(product.name, KNOWN_BRANDS)[0] || "";
}

function getColorTokens(product: RelatedProductInput): string[] {
  const explicitColor = tokens(product.color);
  const namedColors = findKnownPhrase(product.name, KNOWN_COLORS).flatMap(tokens);
  return unique([...explicitColor, ...namedColors]);
}

function removePhraseTokens(source: string[], phrase: string): string[] {
  const phraseTokens = tokens(phrase);
  if (!phraseTokens.length) return source;

  const result: string[] = [];
  for (let index = 0; index < source.length; index += 1) {
    const matches = phraseTokens.every((token, offset) => source[index + offset] === token);
    if (matches) {
      index += phraseTokens.length - 1;
    } else {
      result.push(source[index]);
    }
  }
  return result;
}

function getModelTokens(product: RelatedProductInput): string[] {
  let modelTokens = tokens(product.name);
  const brand = getBrand(product);
  modelTokens = removePhraseTokens(modelTokens, brand);

  for (const color of findKnownPhrase(product.name, KNOWN_COLORS)) {
    modelTokens = removePhraseTokens(modelTokens, color);
  }
  for (const token of tokens(product.color)) {
    modelTokens = modelTokens.filter((item) => item !== token);
  }

  return unique(modelTokens.filter((token) => !MODEL_STOP_WORDS.has(token)));
}

function modelSimilarity(left: string[], right: string[]): number {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  const shared = left.filter((token) => rightSet.has(token)).length;
  if (!shared) return 0;

  const leftCoverage = shared / left.length;
  const rightCoverage = shared / right.length;
  return Math.min(leftCoverage, rightCoverage);
}

function hasSameColor(left: RelatedProductInput, right: RelatedProductInput): boolean {
  const leftColors = getColorTokens(left);
  const rightColors = new Set(getColorTokens(right));
  return leftColors.some((color) => rightColors.has(color));
}

function hasSameBrand(left: RelatedProductInput, right: RelatedProductInput): boolean {
  const leftBrand = getBrand(left);
  const rightBrand = getBrand(right);
  return Boolean(leftBrand && rightBrand && leftBrand === rightBrand);
}

function getAvailableStock(product: RelatedProductInput): number {
  if (!product.variants) return 1;
  return product.variants.reduce((total, variant) => total + Math.max(0, Number(variant.stock) || 0), 0);
}

export function getAutoRelatedProducts<T extends RelatedProductInput>(
  product: T,
  products: T[],
  limit = 6,
): T[] {
  return products
    .filter((candidate) => candidate.id !== product.id && getAvailableStock(candidate) > 0)
    .map((candidate) => ({
      candidate,
      modelScore: modelSimilarity(getModelTokens(product), getModelTokens(candidate)),
      colorScore: hasSameColor(product, candidate) ? 1 : 0,
      brandScore: hasSameBrand(product, candidate) ? 1 : 0,
      stockScore: getAvailableStock(candidate),
      categoryScore:
        normalize(product.category) && normalize(product.category) === normalize(candidate.category)
          ? 1
          : 0,
    }))
    .sort((left, right) => {
      if (right.modelScore !== left.modelScore) return right.modelScore - left.modelScore;
      if (right.colorScore !== left.colorScore) return right.colorScore - left.colorScore;
      if (right.brandScore !== left.brandScore) return right.brandScore - left.brandScore;
      if (right.stockScore !== left.stockScore) return right.stockScore - left.stockScore;
      if (right.categoryScore !== left.categoryScore) return right.categoryScore - left.categoryScore;
      return left.candidate.name.localeCompare(right.candidate.name, undefined, { sensitivity: "base" });
    })
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

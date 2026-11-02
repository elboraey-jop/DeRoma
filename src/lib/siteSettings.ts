import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface HeroBanner {
  id: string;
  tag: string;
  title: string;
  desc: string;
  href: string;
  image: string;
  mobileImage: string;
}

export interface HomeReview {
  id: string;
  brand: string;
  initials: string;
  model: string;
  rating: number;
  quote: string;
  name: string;
  detail: string;
}

export interface SiteSettingsData {
  phone: string;
  whatsapp: string;
  instapayAccount: string;
  walletNumber: string;
  walletProvider: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  address: string;
  hours: string;
  aboutTitle: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  aboutImage: string;
  heroBanners: HeroBanner[];
  homeReviews: HomeReview[];
  forYouProductIds: string[];
  bestSellerProductIds: string[];
}

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: "1",
    tag: "THE FEMININE EDIT",
    title: "Soft Sport Icons",
    desc: "Pastel runners and everyday silhouettes for easy comfort, soft colour, and feminine street style.",
    href: "/shop?category=shoes",
    image: "/banners/hero-1-desktop.webp",
    mobileImage: "/banners/hero-1-mobile.webp",
  },
  {
    id: "2",
    tag: "NEW RELEASE",
    title: "Performance Running & Gym",
    desc: "Super-lightweight cushioned trainers from Asics & Nike engineered for gym workouts, daily running, and support.",
    href: "/shop?category=shoes",
    image: "/banners/hero-2-desktop.webp",
    mobileImage: "/banners/hero-2-mobile.webp",
  },
  {
    id: "3",
    tag: "LIFESTYLE DROP",
    title: "Chunky & Platform Soles",
    desc: "Bold elevated profiles combined with soft memory foam footbeds for maximum casual comfort.",
    href: "/shop?category=shoes",
    image: "/banners/hero-3-desktop.webp",
    mobileImage: "/banners/hero-3-mobile.webp",
  },
];

// Reviews are sourced from approved database records only. There is no demo
// or hard-coded review fallback when the database has no reviews.
export const DEFAULT_HOME_REVIEWS: HomeReview[] = [];

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  phone: "+20 102 345 6789",
  whatsapp: "201023456789",
  instapayAccount: "01515205073",
  walletNumber: "01515205073",
  walletProvider: "Vodafone Cash",
  email: "support@deroma.store",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
  address: "Samanoud, Gharbia Governorate, Egypt",
  hours: "24/7 Available All Day",
  aboutTitle: "The DeRoma Story",
  aboutParagraph1: "Founded on the belief that athletic footwear can be as elegant as it is functional, DeRoma curates women's sports sneakers from trusted suppliers. We bring together refined style and everyday performance for active street steps.",
  aboutParagraph2: "Our collection features carefully selected premium imported materials, supportive designs, and ultra-lightweight cushioned soles to ensure maximum wearability.",
  aboutImage: "/products/deroma-new-balance-9060-pastel-pink.png",
  heroBanners: DEFAULT_HERO_BANNERS,
  homeReviews: DEFAULT_HOME_REVIEWS,
  forYouProductIds: [],
  bestSellerProductIds: [],
};

function sanitizeStoreCopy(value: string): string {
  return value
    .replace(/\bhandcrafted\b/gi, "curated")
    .replace(/\bhandmade\b/gi, "carefully selected")
    .replace(/\bartisanal craftsmanship\b/gi, "curated quality")
    .replace(/\bcraftsmanship\b/gi, "quality")
    .replace(/\bcrafted\b/gi, "selected")
    .replace(/\bcrafting\b/gi, "curating")
    .replace(/المصنوعة\s+يدوي(?:اً|ًا|ا)/g, "المختارة بعناية")
    .replace(/مصنوعة\s+يدوي(?:اً|ًا|ا)/g, "مختارة بعناية")
    .replace(/صُنعت\s+يدوي(?:اً|ًا|ا)/g, "مختارة بعناية")
    .replace(/صُنع\s+بأ?ناقة/g, "اختيرت بأناقة")
    .replace(/صناعة\s+يدوي(?:ة|اً|ًا|ا)/g, "اختيار بعناية")
    .replace(/المصنوعة/g, "المختارة")
    .replace(/مصنوعة/g, "مختارة")
    .replace(/المصنوع/g, "المختار")
    .replace(/مصنوع/g, "مختار")
    .replace(/صُنعت/g, "تم اختيارها")
    .replace(/صُنع/g, "تم اختيار");
}

const getCachedSiteSettings = unstable_cache(
  async () => prisma.siteSettings.findUnique({ where: { id: "default" } }),
  ["deroma-site-settings-v1"],
  { revalidate: 60, tags: ["site-settings"] },
);

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const record = await getCachedSiteSettings();

    if (!record) {
      return DEFAULT_SITE_SETTINGS;
    }

    const rawHeroBanners = (Array.isArray(record.heroBanners) ? record.heroBanners : []) as unknown as HeroBanner[];
    const rawHomeReviews = (Array.isArray(record.homeReviews) ? record.homeReviews : []) as unknown as HomeReview[];
    const sanitizedHeroBanners = rawHeroBanners.map((banner) => ({
      ...banner,
      tag: sanitizeStoreCopy(banner.tag),
      title: sanitizeStoreCopy(banner.title),
      desc: sanitizeStoreCopy(banner.desc),
    }));
    const sanitizedHomeReviews = rawHomeReviews.map((review) => ({
      ...review,
      quote: sanitizeStoreCopy(review.quote),
      detail: sanitizeStoreCopy(review.detail),
    }));

    return {
      phone: record.phone || DEFAULT_SITE_SETTINGS.phone,
      whatsapp: record.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
      instapayAccount: record.instapayAccount || DEFAULT_SITE_SETTINGS.instapayAccount,
      walletNumber: record.walletNumber || DEFAULT_SITE_SETTINGS.walletNumber,
      walletProvider: record.walletProvider || DEFAULT_SITE_SETTINGS.walletProvider,
      email: record.email || DEFAULT_SITE_SETTINGS.email,
      instagram: record.instagram || DEFAULT_SITE_SETTINGS.instagram,
      facebook: record.facebook || DEFAULT_SITE_SETTINGS.facebook,
      tiktok: record.tiktok || DEFAULT_SITE_SETTINGS.tiktok,
      address: record.address || DEFAULT_SITE_SETTINGS.address,
      hours: record.hours || DEFAULT_SITE_SETTINGS.hours,
      aboutTitle: sanitizeStoreCopy(record.aboutTitle || DEFAULT_SITE_SETTINGS.aboutTitle),
      aboutParagraph1: sanitizeStoreCopy(record.aboutParagraph1 || DEFAULT_SITE_SETTINGS.aboutParagraph1),
      aboutParagraph2: sanitizeStoreCopy(record.aboutParagraph2 || DEFAULT_SITE_SETTINGS.aboutParagraph2),
      aboutImage: record.aboutImage || DEFAULT_SITE_SETTINGS.aboutImage,
      heroBanners: sanitizedHeroBanners.length > 0 ? sanitizedHeroBanners : DEFAULT_HERO_BANNERS,
      homeReviews: sanitizedHomeReviews,
      forYouProductIds: record.forYouProductIds || [],
      bestSellerProductIds: record.bestSellerProductIds || [],
    };
  } catch (error) {
    console.error("Error loading site settings:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

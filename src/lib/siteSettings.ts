import prisma from "@/lib/prisma";

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

export const DEFAULT_HOME_REVIEWS: HomeReview[] = [
  {
    id: "1",
    brand: "NEW BALANCE",
    initials: "NB",
    model: "530 Beige",
    rating: 5,
    quote: "The fit is perfect and the quality feels even better in person. DeRoma made choosing my everyday pair effortless.",
    name: "Mariam A.",
    detail: "Verified DeRoma customer",
  },
  {
    id: "2",
    brand: "ADIDAS",
    initials: "AD",
    model: "Handball Spezial",
    rating: 4,
    quote: "Exactly the pair I was looking for. The delivery was quick, the packaging was beautiful, and the shoes are so comfortable.",
    name: "Youssef M.",
    detail: "Verified DeRoma customer",
  },
  {
    id: "3",
    brand: "ASICS",
    initials: "AS",
    model: "Gel-Kayano 14",
    rating: 5,
    quote: "Finally found a stylish running shoe that feels light all day. The sizing guide was spot on.",
    name: "Nour K.",
    detail: "Verified DeRoma customer",
  },
  {
    id: "4",
    brand: "NIKE",
    initials: "NK",
    model: "V2K Run",
    rating: 4,
    quote: "The whole experience feels premium—from browsing the collection to wearing my new favourite sneakers.",
    name: "Omar H.",
    detail: "Verified DeRoma customer",
  },
  {
    id: "5",
    brand: "PUMA",
    initials: "PM",
    model: "Palermo Vintage",
    rating: 3,
    quote: "A beautiful everyday sneaker with a really easy-to-style colourway. I have been wearing it nonstop.",
    name: "Salma R.",
    detail: "Verified DeRoma customer",
  },
  {
    id: "6",
    brand: "ADIDAS",
    initials: "AD",
    model: "Campus 00s",
    rating: 5,
    quote: "The sizing advice helped me choose confidently, and the pair arrived exactly as pictured.",
    name: "Jana E.",
    detail: "Verified DeRoma customer",
  },
  {
    id: "7",
    brand: "NEW BALANCE",
    initials: "NB",
    model: "327 Burgundy",
    rating: 4,
    quote: "Super light, very comfortable, and the burgundy detail makes the whole outfit feel more special.",
    name: "Farah S.",
    detail: "Verified DeRoma customer",
  },
  {
    id: "8",
    brand: "NIKE",
    initials: "NK",
    model: "Court Vision Low",
    rating: 3,
    quote: "Clean design and a comfortable sole for daily wear. The delivery experience was smooth from start to finish.",
    name: "Lina M.",
    detail: "Verified DeRoma customer",
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  phone: "+20 102 345 6789",
  whatsapp: "201023456789",
  email: "support@deromastore.com",
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

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const record = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

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
      homeReviews: sanitizedHomeReviews.length > 0 ? sanitizedHomeReviews : DEFAULT_HOME_REVIEWS,
      forYouProductIds: record.forYouProductIds || [],
      bestSellerProductIds: record.bestSellerProductIds || [],
    };
  } catch (error) {
    console.error("Error loading site settings:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { SiteSettingsData } from "@/lib/siteSettings";

export async function updateSiteSettingsAction(data: SiteSettingsData) {
  await requireAdmin();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      phone: data.phone,
      whatsapp: data.whatsapp,
      instapayAccount: data.instapayAccount,
      walletNumber: data.walletNumber,
      walletProvider: data.walletProvider,
      email: data.email,
      instagram: data.instagram,
      facebook: data.facebook,
      tiktok: data.tiktok,
      address: data.address,
      hours: data.hours,
      aboutTitle: data.aboutTitle,
      aboutParagraph1: data.aboutParagraph1,
      aboutParagraph2: data.aboutParagraph2,
      aboutImage: data.aboutImage,
      heroBanners: JSON.parse(JSON.stringify(data.heroBanners)),
      homeReviews: JSON.parse(JSON.stringify(data.homeReviews)),
      forYouProductIds: data.forYouProductIds || [],
      bestSellerProductIds: data.bestSellerProductIds || [],
    },
    update: {
      phone: data.phone,
      whatsapp: data.whatsapp,
      instapayAccount: data.instapayAccount,
      walletNumber: data.walletNumber,
      walletProvider: data.walletProvider,
      email: data.email,
      instagram: data.instagram,
      facebook: data.facebook,
      tiktok: data.tiktok,
      address: data.address,
      hours: data.hours,
      aboutTitle: data.aboutTitle,
      aboutParagraph1: data.aboutParagraph1,
      aboutParagraph2: data.aboutParagraph2,
      aboutImage: data.aboutImage,
      heroBanners: JSON.parse(JSON.stringify(data.heroBanners)),
      homeReviews: JSON.parse(JSON.stringify(data.homeReviews)),
      forYouProductIds: data.forYouProductIds || [],
      bestSellerProductIds: data.bestSellerProductIds || [],
    },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/refund-policy");
  revalidatePath("/admin/website");
}

import "dotenv/config";
import prisma from "../src/lib/prisma";

type Feedback = {
  productId: string;
  customerName: string;
  rating: 4 | 5;
  body: string;
  showOnHome: boolean;
};

// Customer messages supplied for the storefront. Product IDs are limited to
// the live catalog; generic messages are spread across less-used products.
const FEEDBACK: Feedback[] = [
  { productId: "adidas-samba-og-white-navy", customerName: "Menna", rating: 5, body: "الاوردر وصل حلو أوي بجد، والكوتشي طلع تحفة والمقاس مظبوط. شكراً جداً وإن شاء الله مش آخر تعامل 🤍", showOnHome: true },
  { productId: "new-balance-530-beige", customerName: "Sara", rating: 5, body: "الأوردر وصل بسرعة والكوتشي جميل جداً والخامة حلوة، وكمان المندوب كان ذوق جداً. شكراً ليكم 🤍", showOnHome: true },
  { productId: "nike-v2k-run-pink", customerName: "Nour", rating: 5, body: "الشوز تحفة بجد والماتيريال فظيعة، تسلم إيديكوا ومش آخر تعامل طبعاً ❤️", showOnHome: true },
  { productId: "adidas-handball-spezial-burgundy", customerName: "Mariam", rating: 5, body: "الجزمة تحفة بجد والسعر حلو جداً أقل من الكل، ربنا يوفقكم دايماً 💕", showOnHome: true },
  { productId: "new-balance-530-white", customerName: "Jana", rating: 5, body: "الكوتشي تحفة بجد شكراً جداً، وإن شاء الله مش آخر تعامل 🤍", showOnHome: true },
  { productId: "adidas-handball-spezial-cream-burgundy", customerName: "Farah", rating: 5, body: "استلمت الكوتشي والخامة محترمة جداً، والمفاجأة لقيت رباطين معاه. شكراً لذوقكم 🤍", showOnHome: false },
  { productId: "new-balance-327-navy", customerName: "Youssef", rating: 4, body: "بجد مش بيفرق حاجة عن الأورجينال ويمكن أحلى، الخامة والشكل ممتازين والتعامل محترم.", showOnHome: false },
  { productId: "adidas-campus-00s-grey", customerName: "Salma", rating: 5, body: "الشوز تحفة أوي شكراً بجد، خامته جميلة وشكله طالع حلو جداً 💗", showOnHome: true },
  { productId: "adidas-samba-og-white-navy", customerName: "Hager", rating: 5, body: "استلمت الشوز وكلمة تحفة قليلة عليه، مرسي بجد 💕", showOnHome: false },
  { productId: "asics-gel-kayano-14-pink", customerName: "Hana", rating: 5, body: "الأوردر وصل في أقل من المدة اللي قولتيها، والمندوب قمة في الذوق والشوز تحفة بجد.", showOnHome: true },
  { productId: "new-balance-327-navy", customerName: "Malak", rating: 5, body: "الأوردر وصل تحفة أوي ووصل بسرعة، شكراً بجد وأكيد مش آخر تعامل 😍", showOnHome: false },
  { productId: "new-balance-9060-pastel-pink", customerName: "Laila", rating: 5, body: "استلمت الشوز بجد تحفة ولا غلطة، شكراً جداً لذوق حضرتك 🤍💕", showOnHome: true },
  { productId: "nike-v2k-run-pink", customerName: "Nadine", rating: 5, body: "الكوتشي القمر وصلني النهارده، شكراً لذوق حضرتك وشكراً جداً على كل حاجة 🤍", showOnHome: false },
  { productId: "adidas-handball-spezial-cream-burgundy", customerName: "Aya", rating: 4, body: "استلمت وبجد تحفة والكواليتي ممتازة، وإن شاء الله مش آخر تعامل 😍", showOnHome: false },
  { productId: "new-balance-530-white", customerName: "Bassant", rating: 5, body: "الأوردر وصل والشوز تحفة جداً والماتيريال خطيرة، والمندوب ذوق جداً. تسلموا ❤️", showOnHome: true },
  { productId: "adidas-campus-00s-beige", customerName: "Rawan", rating: 5, body: "الشوز وصلني النهارده وحبيته أوي، شكله نفس الحقيقة بالظبط والتعامل ذوق جداً ❤️", showOnHome: true },
  { productId: "asics-gel-kayano-14-pink", customerName: "Yasmin", rating: 5, body: "استلمت الشوز بجد تحفة ولا غلطة، والكواليتي جميلة جداً 😍❤️", showOnHome: false },
  { productId: "nike-v2k-run-brown", customerName: "Dina", rating: 4, body: "الأوردر وصل تحفة أوي وشكراً بجد على تعبك معايا ❤️", showOnHome: false },
  { productId: "adidas-campus-00s-grey", customerName: "Alaa", rating: 5, body: "الأوردر حلو جداً والكواليتي حلوة، وإن شاء الله مش آخر تعامل ❤️", showOnHome: true },
  { productId: "adidas-campus-00s-beige", customerName: "Shahd", rating: 5, body: "تحفة تحفة والكواليتي خطيرة بجد، وشكراً جداً لذوقك معايا 💗", showOnHome: false },
  { productId: "adidas-handball-spezial-burgundy", customerName: "Carmen", rating: 5, body: "وصل والماتيريال تحفة والتعامل برضو ممتاز، ورشحتكم لصحابي كمان 🤍", showOnHome: true },
  { productId: "new-balance-9060-pastel-pink", customerName: "Farida", rating: 5, body: "الحاجات وصلت تحفة وعجبتني أوي أوي ووصلت بسرعة جداً 💗", showOnHome: false },
  { productId: "nike-v2k-run-pink", customerName: "Rana", rating: 5, body: "الأوردر وصلي امبارح، تحفة أوي وعجبني أوي وجاي بسرعة. إن شاء الله مش آخر تعامل ❤️", showOnHome: true },
  { productId: "adidas-samba-og-white-navy", customerName: "Amna", rating: 4, body: "الأوردر وصل تحفة أوي بجد ووصل بسرعة أوي كالعاده ❤️", showOnHome: false },
  { productId: "new-balance-530-silver", customerName: "Mirna", rating: 5, body: "الكوتشي وصل والكواليتي حلوة والمقاس طلع مظبوط الحمد لله، شكراً لذوقك 💗", showOnHome: false },
  { productId: "adidas-handball-spezial-burgundy", customerName: "Ahmed", rating: 5, body: "شكراً جداً على سرعة التوصيل والخامة المحترمة والأسلوب المحترم 💕", showOnHome: false },
  { productId: "new-balance-530-silver", customerName: "Salma Mohamed", rating: 5, body: "الأوردر وصل وما شاء الله تحفة، وشكراً على سرعة التوصيل 🤍", showOnHome: false },
  { productId: "adidas-samba-og-white-navy", customerName: "Omar", rating: 4, body: "الأوردر وصل بسرعة جداً وما شاء الله حلو أوي والمقاس مظبوط وانتوا ناس ذوق ❤️", showOnHome: false },
  { productId: "new-balance-530-beige", customerName: "Mariam Ali", rating: 5, body: "الجزمة وصلت تحفة والكواليتي جميلة جداً والبكجينج كويس وكل حاجة بيرفكت، شكراً بجد.", showOnHome: true },
  { productId: "new-balance-327-burgundy", customerName: "Lojain", rating: 5, body: "تحفة أوي والماتيريال عسولة ونفس اللي في الصورة 😍", showOnHome: false },
  { productId: "new-balance-327-burgundy", customerName: "Karim", rating: 4, body: "وصل تاني يوم بالظبط، شكله تحفة ومقاسه مظبوط وكل حاجة تمام خالص ♥️", showOnHome: false },
];

// The current production database still contains the legacy S#### SKUs. Keep
// this compatibility map so reviews attach to real products in that catalog.
const PRODUCT_ALIASES: Record<string, string> = {
  "adidas-samba-og-white-navy": "s0061",
  "new-balance-530-beige": "s0047",
  "nike-v2k-run-pink": "s0013",
  "adidas-handball-spezial-burgundy": "s0069",
  "new-balance-530-white": "s0050",
  "adidas-handball-spezial-cream-burgundy": "s0004",
  "new-balance-327-navy": "s0054",
  "adidas-campus-00s-grey": "s0009",
  "asics-gel-kayano-14-pink": "s0015",
  "new-balance-9060-pastel-pink": "s0006",
  "adidas-campus-00s-beige": "s0008",
  "nike-v2k-run-brown": "s0012",
  "new-balance-530-silver": "s0046",
  "new-balance-327-burgundy": "s0051",
};

async function main() {
  const catalogProducts = await prisma.product.findMany({
    select: { id: true, name: true, sku: true },
  });
  const byCatalogKey = new Map(
    catalogProducts.flatMap((product) => {
      const skuKey = product.sku?.replace(/^DR-/i, "").toLowerCase();
      return skuKey ? [[skuKey, product.id] as const] : [];
    }),
  );
  for (const product of catalogProducts) byCatalogKey.set(product.id, product.id);
  const missing = FEEDBACK.filter((review) => !byCatalogKey.has(PRODUCT_ALIASES[review.productId] || review.productId));
  if (missing.length) {
    console.error("Available products:", catalogProducts.map((product) => `${product.sku || product.id}=${product.name}`).join(" | "));
    throw new Error(`Feedback references missing products: ${missing.map((review) => review.productId).join(", ")}`);
  }
  const resolvedFeedback = FEEDBACK.map((review) => ({
    ...review,
    productId: byCatalogKey.get(PRODUCT_ALIASES[review.productId] || review.productId)!,
  }));

  await prisma.$transaction(async (tx) => {
    await tx.review.deleteMany({});
    await tx.review.createMany({
      data: resolvedFeedback.map((review, index) => ({
        id: `customer-feedback-${String(index + 1).padStart(2, "0")}`,
        productId: review.productId,
        customerName: review.customerName,
        rating: review.rating,
        body: review.body,
        status: "approved",
        verifiedPurchase: true,
        showOnHome: review.showOnHome,
      })),
    });

    await tx.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", homeReviews: [] },
      update: { homeReviews: [] },
    });

    await tx.product.updateMany({ data: { rating: 0, reviewsCount: 0 } });
    const aggregates = await tx.review.groupBy({
      by: ["productId"],
      where: { status: "approved" },
      _avg: { rating: true },
      _count: { _all: true },
    });
    for (const aggregate of aggregates) {
      await tx.product.update({
        where: { id: aggregate.productId },
        data: {
          rating: aggregate._avg.rating ?? 0,
          reviewsCount: aggregate._count._all,
        },
      });
    }
  });

  console.log(`Replaced reviews with ${FEEDBACK.length} supplied customer feedback entries.`);
  console.log(`Homepage entries: ${FEEDBACK.filter((review) => review.showOnHome).length}.`);
  for (const product of catalogProducts) {
    const catalogKey = product.sku?.replace(/^DR-/i, "").toLowerCase() || product.id;
    const reviews = FEEDBACK.filter((review) => (PRODUCT_ALIASES[review.productId] || review.productId) === catalogKey);
    const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
    console.log(`${product.name}: ${reviews.length} reviews, rating ${average.toFixed(2)}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

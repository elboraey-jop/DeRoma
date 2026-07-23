import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
});

const mockProducts = [
  {
    name: 'سنيكرز أديداس كاجوال',
    description: 'حذاء رياضي كاجوال مريح جداً ومناسب للمشاوير اليومية والعمل، بتصميم عصري وألوان محايدة سهلة التنسيق.',
    price: 1200,
    compareAtPrice: 1500,
    category: 'sneakers',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80', // White
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', // Beige/Brown
    ],
    variants: [
      { size: '37', color: 'أبيض', stock: 12 },
      { size: '38', color: 'أبيض', stock: 15 },
      { size: '39', color: 'أبيض', stock: 8 },
      { size: '40', color: 'أبيض', stock: 2 },
      { size: '41', color: 'أبيض', stock: 0 }, // Out of stock
      { size: '37', color: 'بيج', stock: 5 },
      { size: '38', color: 'بيج', stock: 10 },
      { size: '39', color: 'بيج', stock: 9 },
      { size: '40', color: 'بيج', stock: 4 },
    ]
  },
  {
    name: 'حذاء كعب ستان كلاسيك',
    description: 'حذاء كعب عالي بتصميم مدبب أنيق مغطى بالستان الناعم المفعم بالأنوثة، مريح للارتداء لساعات طويلة في السهرات والاحتفالات.',
    price: 1800,
    compareAtPrice: 2200,
    category: 'heels',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', // Blueish/Teal Black
      'https://images.unsplash.com/photo-1596702990264-b6c89115d970?w=600&auto=format&fit=crop&q=80', // Red Velvet
    ],
    variants: [
      { size: '37', color: 'أسود', stock: 5 },
      { size: '38', color: 'أسود', stock: 8 },
      { size: '39', color: 'أسود', stock: 10 },
      { size: '40', color: 'أسود', stock: 3 },
      { size: '37', color: 'أحمر', stock: 4 },
      { size: '38', color: 'أحمر', stock: 6 },
      { size: '39', color: 'أحمر', stock: 3 },
      { size: '40', color: 'أحمر', stock: 0 }, // Out of stock
    ]
  },
  {
    name: 'صندل صيفي بنعل مرن',
    description: 'صندل صيفي خفيف ومريح للغاية بنعل مرن ومقاوم للانزلاق، حزام خلفي قابل للتعديل لمقاس مثالي.',
    price: 750,
    compareAtPrice: 950,
    category: 'sandals',
    images: [
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80', // Gold/Sparkly
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80', // Beige
    ],
    variants: [
      { size: '37', color: 'ذهبي', stock: 6 },
      { size: '38', color: 'ذهبي', stock: 12 },
      { size: '39', color: 'ذهبي', stock: 15 },
      { size: '40', color: 'ذهبي', stock: 4 },
      { size: '37', color: 'بيج', stock: 8 },
      { size: '38', color: 'بيج', stock: 8 },
      { size: '39', color: 'بيج', stock: 10 },
      { size: '40', color: 'بيج', stock: 5 },
    ]
  },
  {
    name: 'حذاء فلات جلد طبيعي',
    description: 'حذاء فلات أنيق وراقٍ مصنوع يدوياً من الجلد الطبيعي الممتاز، يحتوي على نعل داخلي مبطن بالكامل للراحة القصوى والارتداء اليومي.',
    price: 950,
    compareAtPrice: null,
    category: 'flats',
    images: [
      'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&auto=format&fit=crop&q=80', // Black
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&auto=format&fit=crop&q=80', // Beige/Brown leather
    ],
    variants: [
      { size: '37', color: 'أسود', stock: 10 },
      { size: '38', color: 'أسود', stock: 14 },
      { size: '39', color: 'أسود', stock: 9 },
      { size: '40', color: 'أسود', stock: 6 },
      { size: '41', color: 'أسود', stock: 3 },
      { size: '37', color: 'بيج', stock: 8 },
      { size: '38', color: 'بيج', stock: 12 },
      { size: '39', color: 'بيج', stock: 11 },
      { size: '40', color: 'بيج', stock: 4 },
    ]
  },
  {
    name: 'بوت شتوي قطيفة هيلز',
    description: 'بوت كاحل شتوي أنيق ذو كعب عريض ومريح ومتوسط الارتفاع، قماش قطيفة فاخر مقاوم للماء ومثالي لإكمال إطلالتك في الشتاء.',
    price: 2100,
    compareAtPrice: 2500,
    category: 'boots',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80', // Black
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', // Brown
    ],
    variants: [
      { size: '38', color: 'أسود', stock: 8 },
      { size: '39', color: 'أسود', stock: 10 },
      { size: '40', color: 'أسود', stock: 5 },
      { size: '41', color: 'أسود', stock: 2 },
      { size: '38', color: 'بني', stock: 4 },
      { size: '39', color: 'بني', stock: 6 },
      { size: '40', color: 'بني', stock: 5 },
      { size: '41', color: 'بني', stock: 1 },
    ]
  },
  {
    name: 'سنيكرز رياضي مرن وخفيف',
    description: 'حذاء سنيكرز للجري والأنشطة الرياضية خفيف الوزن، يوفر تهوية ممتازة وامتصاص عالي للصدمات أثناء الحركة والوقوف الطويل.',
    price: 1400,
    compareAtPrice: 1700,
    category: 'sneakers',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', // White/Color details
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&auto=format&fit=crop&q=80', // Blue/Pink details
    ],
    variants: [
      { size: '37', color: 'أبيض', stock: 10 },
      { size: '38', color: 'أبيض', stock: 15 },
      { size: '39', color: 'أبيض', stock: 8 },
      { size: '40', color: 'أبيض', stock: 4 },
      { size: '41', color: 'أبيض', stock: 2 },
      { size: '37', color: 'وردي', stock: 6 },
      { size: '38', color: 'وردي', stock: 10 },
      { size: '39', color: 'وردي', stock: 5 },
      { size: '40', color: 'وردي', stock: 1 },
    ]
  }
];

async function main() {
  console.log('Clearing existing products and variants...');
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  console.log('Seeding products...');
  for (const p of mockProducts) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        category: p.category,
        images: p.images,
        status: 'active'
      }
    });

    console.log(`Created product: ${product.name}`);

    // Create variants
    for (const v of p.variants) {
      const sku = `DR-${product.id.slice(0, 4).toUpperCase()}-${v.color.slice(0, 2).toUpperCase()}-${v.size}`;
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: v.size,
          color: v.color,
          stock: v.stock,
          sku: sku
        }
      });
    }
  }

  console.log('Seeding complete! Database successfully populated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

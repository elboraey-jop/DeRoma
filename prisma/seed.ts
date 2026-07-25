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
    name: 'Adidas Casual Sneakers',
    description: 'Extremely comfortable casual sneakers perfect for daily commuting and work, with a modern design and easy-to-match neutral colors.',
    price: 1200,
    compareAtPrice: 1500,
    category: 'sneakers',
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80', // White
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', // Beige/Brown
    ],
    variants: [
      { size: '37', color: 'White', stock: 12 },
      { size: '38', color: 'White', stock: 15 },
      { size: '39', color: 'White', stock: 8 },
      { size: '40', color: 'White', stock: 2 },
      { size: '41', color: 'White', stock: 0 }, // Out of stock
      { size: '37', color: 'Beige', stock: 5 },
      { size: '38', color: 'Beige', stock: 10 },
      { size: '39', color: 'Beige', stock: 9 },
      { size: '40', color: 'Beige', stock: 4 },
    ]
  },
  {
    name: 'Classic Satin Heels',
    description: 'High heel shoes with an elegant pointed design covered in soft feminine satin, comfortable for long wear at evening events and parties.',
    price: 1800,
    compareAtPrice: 2200,
    category: 'heels',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', // Blueish/Teal Black
      'https://images.unsplash.com/photo-1596702990264-b6c89115d970?w=600&auto=format&fit=crop&q=80', // Red Velvet
    ],
    variants: [
      { size: '37', color: 'Black', stock: 5 },
      { size: '38', color: 'Black', stock: 8 },
      { size: '39', color: 'Black', stock: 10 },
      { size: '40', color: 'Black', stock: 3 },
      { size: '37', color: 'Red', stock: 4 },
      { size: '38', color: 'Red', stock: 6 },
      { size: '39', color: 'Red', stock: 3 },
      { size: '40', color: 'Red', stock: 0 }, // Out of stock
    ]
  },
  {
    name: 'Flexible Sole Summer Sandals',
    description: 'Lightweight and comfortable summer sandals with a flexible slip-resistant sole, featuring an adjustable back strap for a perfect fit.',
    price: 750,
    compareAtPrice: 950,
    category: 'sandals',
    images: [
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80', // Gold/Sparkly
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80', // Beige
    ],
    variants: [
      { size: '37', color: 'Gold', stock: 6 },
      { size: '38', color: 'Gold', stock: 12 },
      { size: '39', color: 'Gold', stock: 15 },
      { size: '40', color: 'Gold', stock: 4 },
      { size: '37', color: 'Beige', stock: 8 },
      { size: '38', color: 'Beige', stock: 8 },
      { size: '39', color: 'Beige', stock: 10 },
      { size: '40', color: 'Beige', stock: 5 },
    ]
  },
  {
    name: 'Genuine Leather Flats',
    description: 'Elegant and sophisticated flats handcrafted from premium genuine leather, featuring a fully cushioned insole for ultimate comfort and daily wear.',
    price: 950,
    compareAtPrice: null,
    category: 'flats',
    images: [
      'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&auto=format&fit=crop&q=80', // Black
      'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&auto=format&fit=crop&q=80', // Beige/Brown leather
    ],
    variants: [
      { size: '37', color: 'Black', stock: 10 },
      { size: '38', color: 'Black', stock: 14 },
      { size: '39', color: 'Black', stock: 9 },
      { size: '40', color: 'Black', stock: 6 },
      { size: '41', color: 'Black', stock: 3 },
      { size: '37', color: 'Beige', stock: 8 },
      { size: '38', color: 'Beige', stock: 12 },
      { size: '39', color: 'Beige', stock: 11 },
      { size: '40', color: 'Beige', stock: 4 },
    ]
  },
  {
    name: 'Velvet Winter Heeled Boots',
    description: 'Elegant winter ankle boots with a comfortable block mid-heel, crafted from premium water-resistant velvet fabric to perfect your winter look.',
    price: 2100,
    compareAtPrice: 2500,
    category: 'boots',
    images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&auto=format&fit=crop&q=80', // Black
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&auto=format&fit=crop&q=80', // Brown
    ],
    variants: [
      { size: '38', color: 'Black', stock: 8 },
      { size: '39', color: 'Black', stock: 10 },
      { size: '40', color: 'Black', stock: 5 },
      { size: '41', color: 'Black', stock: 2 },
      { size: '38', color: 'Brown', stock: 4 },
      { size: '39', color: 'Brown', stock: 6 },
      { size: '40', color: 'Brown', stock: 5 },
      { size: '41', color: 'Brown', stock: 1 },
    ]
  },
  {
    name: 'Light & Flexible Sporty Sneakers',
    description: 'Lightweight running and athletic sneakers, offering excellent breathability and high shock absorption for active movement and long standing.',
    price: 1400,
    compareAtPrice: 1700,
    category: 'sneakers',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80', // White/Color details
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&auto=format&fit=crop&q=80', // Blue/Pink details
    ],
    variants: [
      { size: '37', color: 'White', stock: 10 },
      { size: '38', color: 'White', stock: 15 },
      { size: '39', color: 'White', stock: 8 },
      { size: '40', color: 'White', stock: 4 },
      { size: '41', color: 'White', stock: 2 },
      { size: '37', color: 'Pink', stock: 6 },
      { size: '38', color: 'Pink', stock: 10 },
      { size: '39', color: 'Pink', stock: 5 },
      { size: '40', color: 'Pink', stock: 1 },
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

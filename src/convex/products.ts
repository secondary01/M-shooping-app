import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Mock products for when database is empty
const MOCK_PRODUCTS = [
  {
    _id: "mock_001" as any,
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling headphones with 30hr battery life",
    price: 1299,
    originalPrice: 2999,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop",
    sizes: [] as string[],
    inStock: true,
    rating: 4.5,
    reviewCount: 1234,
  },
  {
    _id: "mock_002" as any,
    name: "Cotton Casual T-Shirt",
    description: "100% cotton comfortable everyday wear t-shirt",
    price: 399,
    originalPrice: 799,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    rating: 4.2,
    reviewCount: 856,
  },
  {
    _id: "mock_003" as any,
    name: "Smart Watch Pro",
    description: "Fitness tracking, heart rate monitor, GPS enabled",
    price: 2499,
    originalPrice: 4999,
    category: "electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop",
    sizes: [] as string[],
    inStock: true,
    rating: 4.7,
    reviewCount: 2341,
  },
  {
    _id: "mock_004" as any,
    name: "Running Shoes",
    description: "Lightweight athletic shoes with cushioning technology",
    price: 1599,
    originalPrice: 2999,
    category: "shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
    sizes: ["7", "8", "9", "10"],
    inStock: true,
    rating: 4.4,
    reviewCount: 1567,
  },
  {
    _id: "mock_005" as any,
    name: "Laptop Backpack",
    description: "Waterproof backpack with USB charging port",
    price: 899,
    originalPrice: 1999,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
    sizes: [] as string[],
    inStock: true,
    rating: 4.3,
    reviewCount: 923,
  },
  {
    _id: "mock_006" as any,
    name: "Sunglasses UV400",
    description: "Polarized sunglasses with UV protection",
    price: 499,
    originalPrice: 999,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop",
    sizes: [] as string[],
    inStock: true,
    rating: 4.1,
    reviewCount: 678,
  },
  {
    _id: "mock_007" as any,
    name: "Denim Jacket",
    description: "Classic denim jacket with modern fit",
    price: 2499,
    originalPrice: 3499,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    rating: 4.6,
    reviewCount: 445,
  },
  {
    _id: "mock_008" as any,
    name: "Leather Wallet",
    description: "Genuine leather bifold wallet with RFID blocking",
    price: 799,
    originalPrice: 1499,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=500&fit=crop",
    sizes: [] as string[],
    inStock: true,
    rating: 4.4,
    reviewCount: 567,
  },
  {
    _id: "mock_009" as any,
    name: "Kurti Set",
    description: "Embroidered cotton kurti with palazzo pants",
    price: 1199,
    originalPrice: 2499,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    rating: 4.3,
    reviewCount: 789,
  },
  {
    _id: "mock_010" as any,
    name: "Sports Shoes",
    description: "Comfortable sports shoes for daily wear",
    price: 999,
    originalPrice: 1999,
    category: "shoes",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop",
    sizes: ["6", "7", "8", "9", "10"],
    inStock: true,
    rating: 4.2,
    reviewCount: 1123,
  },
  {
    _id: "mock_011" as any,
    name: "Handbag",
    description: "Stylish handbag with multiple compartments",
    price: 1499,
    originalPrice: 2999,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop",
    sizes: [] as string[],
    inStock: true,
    rating: 4.5,
    reviewCount: 345,
  },
  {
    _id: "mock_012" as any,
    name: "Saree Collection",
    description: "Beautiful silk saree with blouse piece",
    price: 1899,
    originalPrice: 3999,
    category: "clothing",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop",
    sizes: [] as string[],
    inStock: true,
    rating: 4.7,
    reviewCount: 678,
  },
];

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.category) {
      results = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      results = await ctx.db.query("products").collect();
    }

    // If database is empty, use mock products
    if (results.length === 0) {
      results = MOCK_PRODUCTS;
    }

    let filtered = results;

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filtered = results.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower),
      );
    }

    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

export const get = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (product) return product;

    // Check mock products
    return MOCK_PRODUCTS.find((p) => p._id === args.productId) ?? null;
  },
});

export const getByUrl = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const dbMatch = products.find(
      (p) =>
        p.image === args.url || p.images?.some((img) => img === args.url),
    );
    if (dbMatch) return dbMatch;

    // Check mock products
    return MOCK_PRODUCTS.find(
      (p) => p.image === args.url,
    ) ?? null;
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").first();
    if (existing) return "already_seeded";

    const products = [
      {
        name: "Minimal Cotton Tee",
        description: "Premium organic cotton t-shirt with a clean, relaxed fit.",
        price: 899,
        originalPrice: 1299,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
        sizes: ["XS", "S", "M", "L", "XL"],
        inStock: true,
        rating: 4.5,
        reviewCount: 128,
      },
      {
        name: "Classic Denim Jacket",
        description: "Timeless denim jacket with a modern silhouette.",
        price: 2499,
        originalPrice: 3499,
        category: "clothing",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
        sizes: ["S", "M", "L", "XL"],
        inStock: true,
        rating: 4.7,
        reviewCount: 89,
      },
      {
        name: "Running Sneakers",
        description: "Lightweight performance sneakers with responsive cushioning.",
        price: 3999,
        originalPrice: 5499,
        category: "shoes",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
        sizes: ["6", "7", "8", "9", "10", "11"],
        inStock: true,
        rating: 4.3,
        reviewCount: 256,
      },
      {
        name: "Canvas Backpack",
        description: "Durable canvas backpack with padded laptop compartment.",
        price: 1799,
        originalPrice: 2499,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
        inStock: true,
        rating: 4.6,
        reviewCount: 178,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return "seeded";
  },
});

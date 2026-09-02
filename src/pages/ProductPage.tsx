import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ALL_PRODUCTS: Record<string, any> = {
  "1": { id: "1", name: "Wireless Headphones Pro", price: 1299, originalPrice: 2499, rating: 4.5, reviewCount: 2341, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop", category: "electronics", description: "Premium wireless headphones with active noise cancellation, 40-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.", sizes: [] },
  "2": { id: "2", name: "Cotton T-Shirt Premium", price: 399, originalPrice: 799, rating: 4.2, reviewCount: 5678, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop", category: "clothing", description: "100% premium cotton t-shirt with a comfortable regular fit. Available in multiple colors. Machine washable.", sizes: ["S", "M", "L", "XL", "XXL"] },
  "3": { id: "3", name: "Smart Watch Series 5", price: 2499, originalPrice: 4999, rating: 4.7, reviewCount: 1890, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop", category: "electronics", description: "Feature-packed smartwatch with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water resistant up to 50m.", sizes: [] },
  "4": { id: "4", name: "Running Shoes Ultra", price: 1599, originalPrice: 3299, rating: 4.4, reviewCount: 3210, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop", category: "shoes", description: "Lightweight running shoes with responsive cushioning and breathable mesh upper. Ideal for daily runs and gym sessions.", sizes: ["7", "8", "9", "10", "11"] },
  "5": { id: "5", name: "Travel Backpack 40L", price: 899, originalPrice: 1799, rating: 4.3, reviewCount: 1567, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop", category: "accessories", description: "Spacious 40L travel backpack with laptop compartment, multiple pockets, and padded straps. Perfect for travel and daily use.", sizes: [] },
  "6": { id: "6", name: "Polarized Sunglasses", price: 499, originalPrice: 1299, rating: 4.1, reviewCount: 890, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop", category: "accessories", description: "Stylish polarized sunglasses with UV400 protection. Lightweight frame with scratch-resistant lenses.", sizes: [] },
  "7": { id: "7", name: "Denim Jacket Classic", price: 2499, originalPrice: 4499, rating: 4.6, reviewCount: 2100, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&h=600&fit=crop", category: "clothing", description: "Classic denim jacket with a modern slim fit. Made from premium cotton denim with brass buttons.", sizes: ["S", "M", "L", "XL"] },
  "8": { id: "8", name: "Leather Wallet Slim", price: 799, originalPrice: 1599, rating: 4.0, reviewCount: 1234, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop", category: "accessories", description: "Slim genuine leather wallet with RFID blocking. Multiple card slots and a coin pocket.", sizes: [] },
  "9": { id: "9", name: "Kurti Set Traditional", price: 1199, originalPrice: 2499, rating: 4.5, reviewCount: 3456, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop", category: "clothing", description: "Beautiful traditional kurti set with intricate embroidery. Comfortable fabric perfect for festivals and occasions.", sizes: ["S", "M", "L", "XL"] },
  "10": { id: "10", name: "Sports Shoes Pro", price: 999, originalPrice: 2199, rating: 4.3, reviewCount: 2789, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop", category: "shoes", description: "Versatile sports shoes with excellent grip and cushioning. Suitable for running, gym, and casual wear.", sizes: ["7", "8", "9", "10", "11"] },
  "11": { id: "11", name: "Leather Handbag", price: 1499, originalPrice: 2999, rating: 4.4, reviewCount: 987, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop", category: "accessories", description: "Elegant leather handbag with spacious interior and multiple compartments. Perfect for work and outings.", sizes: [] },
  "12": { id: "12", name: "Silk Saree Elegant", price: 1899, originalPrice: 3999, rating: 4.8, reviewCount: 4567, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop", category: "clothing", description: "Pure silk saree with beautiful border and pallu design. Includes matching blouse piece.", sizes: [] },
};

export default function ProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const product = productId ? ALL_PRODUCTS[productId] : null;

  // Load cart from localStorage
  const getCart = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("shop_cart") || "[]");
    } catch {
      return [];
    }
  }, []);

  const saveCart = useCallback((items: any[]) => {
    localStorage.setItem("shop_cart", JSON.stringify(items));
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    const cart = getCart();
    const existingIdx = cart.findIndex(
      (item: any) => item.id === product.id && item.size === (selectedSize || undefined),
    );

    if (existingIdx >= 0) {
      cart[existingIdx].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.originalPrice,
        image: product.image,
        quantity: 1,
        size: selectedSize || undefined,
      });
    }

    saveCart(cart);
    toast.success("Added to cart!");
    navigate("/dashboard/cart");
  };

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 pb-24">
        <p className="text-sm text-muted-foreground">Product not found</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-2">
          Go back
        </Button>
      </div>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Back Button */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>

      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
      </div>

      {/* Product Info */}
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{product.name}</h1>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-foreground">₹{product.price}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                  <span className="rounded-full bg-green-500/10 text-green-500 px-2 py-0.5 text-[10px] font-medium">
                    {discountPct}% off
                  </span>
                </>
              )}
            </div>
          </div>
          {product.rating && (
            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
              <Star className="h-3 w-3 fill-current text-amber-500" />
              <span className="text-xs font-medium">{product.rating}</span>
              <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

        <div className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">
          {product.category}
        </div>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[48px] rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:border-foreground/50",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add to Cart Bar */}
      <div className="sticky bottom-0 z-[60] bg-background border-t border-border px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">₹{product.price}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
            )}
          </div>
          {hasDiscount && (
            <p className="text-[10px] text-green-500 font-medium">
              You save ₹{product.originalPrice! - product.price} ({discountPct}% off)
            </p>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          className="bg-[var(--meesho-pink)] text-white hover:bg-[var(--meesho-pink)]/90 px-6 h-11 font-medium shrink-0 meesho-btn"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

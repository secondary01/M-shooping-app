import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Truck,
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  original_price: number;
  image: string;
  quantity: number;
  size?: string;
}

const MOCK_CART_ITEMS: CartItem[] = [
  { id: "1", name: "Wireless Headphones Pro", price: 1299, originalPrice: 2499, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", quantity: 1, original_price: 2499 },
  { id: "2", name: "Cotton T-Shirt Premium", price: 399, originalPrice: 799, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop", quantity: 2, size: "M", original_price: 799 },
];

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem("shop_cart");
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_CART_ITEMS;
}

function saveCart(items: CartItem[]) {
  localStorage.setItem("shop_cart", JSON.stringify(items));
}

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = items.reduce((sum, item) => sum + item.original_price * item.quantity, 0);
  const totalDiscount = originalTotal - total;
  const deliveryCharge = total >= 499 ? 0 : 49;
  const orderTotal = total + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-background border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-lg font-bold">My Cart</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold">Cart is empty</h2>
          <p className="text-sm text-muted-foreground mt-1">Add items to get started</p>
          <Button
            onClick={() => navigate("/dashboard/search")}
            className="mt-6 bg-[var(--meesho-pink)] text-white"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold">My Cart</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {items.reduce((s, i) => s + i.quantity, 0)} item{items.length !== 1 ? "s" : ""} in cart
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Address Selection */}
        <div className="meesho-card p-4 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-[var(--meesho-pink)]/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-[var(--meesho-pink)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Add delivery address</p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Select an address before checkout
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/dashboard/addresses")}
              variant="outline"
              size="sm"
              className="border-border text-foreground shrink-0 ml-2"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="meesho-card p-4 border border-border bg-card">
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                  {item.size && (
                    <span className="meesho-pill bg-muted text-muted-foreground mt-1 inline-block text-[10px]">
                      Size: {item.size}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="meesho-price">₹{item.price}</span>
                    {item.original_price > item.price && (
                      <>
                        <span className="meesho-mrp">₹{item.original_price}</span>
                        <span className="meesho-discount">
                          {Math.round(((item.original_price - item.price) / item.original_price) * 100)}% Off
                        </span>
                      </>
                    )}
                  </div>
                  {item.original_price > item.price && (
                    <span className="meesho-pill bg-[var(--meesho-green)]/10 text-[var(--meesho-green)] mt-1.5 inline-block">
                      ₹{item.original_price - item.price} Less today
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity + Delete */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-[var(--meesho-red)] hover:bg-[var(--meesho-red)]/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-xl p-3">
          <Truck className="h-4 w-4 text-[var(--meesho-green)]" />
          <span>
            {deliveryCharge === 0
              ? "Free delivery on this order"
              : `Delivery charge: ₹${deliveryCharge}`}
          </span>
        </div>

        {/* Price Details */}
        <div className="meesho-card p-4 border border-border bg-card">
          <h3 className="text-sm font-semibold mb-3">Price details</h3>
          {totalDiscount > 0 && (
            <div className="bg-[var(--meesho-green)]/10 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--meesho-green)] font-medium">
                  Total discount: ₹{totalDiscount}
                </span>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Product Price</span>
              <span>₹{originalTotal}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-[var(--meesho-green)]">- ₹{totalDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className={deliveryCharge === 0 ? "text-[var(--meesho-green)] font-medium" : ""}>
                {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-sm font-semibold">Order total</span>
                <span className="text-sm font-bold text-[var(--meesho-pink)]">₹{orderTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={() => navigate("/dashboard/checkout")}
          className="w-full h-12 bg-[var(--meesho-pink)] text-white hover:bg-[var(--meesho-pink)]/90 font-medium meesho-btn"
        >
          Place Order — ₹{orderTotal}
        </Button>
      </div>
    </div>
  );
}

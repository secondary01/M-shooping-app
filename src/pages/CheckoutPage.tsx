import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle,
  Loader2,
  ShoppingCart,
  Shield,
  Truck,
  Tag,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type CheckoutStep = "cart" | "address" | "payment" | "done";

const STEP_LABELS: Record<string, string> = {
  cart: "Cart",
  address: "Address",
  payment: "Payment",
};

const MOCK_CART = {
  items: [
    { id: "1", name: "Wireless Headphones Pro", price: 1299, original_price: 2499, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", quantity: 1 },
    { id: "2", name: "Cotton T-Shirt Premium", price: 399, original_price: 799, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop", quantity: 2, size: "M" },
  ],
  total: 2097,
  total_quantity: 3,
  original_price: 3997,
  total_discount: 1900,
  delivery_charge: 0,
  supplier_discount: 1500,
  first_order_discount: 400,
};

const MOCK_ADDRESSES = [
  {
    id: "addr_1",
    name: "Rahul Kumar",
    house_number: "123, Main Street",
    area: "Sector 15",
    city: "New Delhi",
    pin: "110001",
    address_type: "Home",
    mobile: "9876543210",
  },
];

const PAYMENT_OPTIONS = [
  { type: "cod", display_name: "Cash on Delivery", description: "Pay when you receive", icon: Banknote, color: "var(--meesho-yellow)" },
  { type: "upi", display_name: "UPI / QR Code", description: "GPay, PhonePe, Paytm", icon: Smartphone, color: "var(--meesho-green)" },
  { type: "card", display_name: "Credit / Debit Card", description: "Visa, Mastercard, RuPay", icon: CreditCard, color: "var(--meesho-blue)" },
  { type: "wallet", display_name: "Wallet", description: "Paytm, PhonePe Wallet", icon: Wallet, color: "var(--meesho-pink)" },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("addr_1");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cart = MOCK_CART;
  const addresses = MOCK_ADDRESSES;
  const activeAddress = addresses.find((a) => a.id === selectedAddressId);
  const items = cart.items;
  const total = cart.total;

  // ─── Step Progress Bar ─────────────────────────────────────
  const StepProgress = () => {
    const steps = ["cart", "address", "payment"];
    const currentIdx = steps.indexOf(step);

    return (
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    i < currentIdx
                      ? "bg-[var(--meesho-green)] text-white"
                      : i === currentIdx
                        ? "bg-[var(--meesho-pink)] text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentIdx ? "✓" : i + 1}
                </div>
                <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 -mt-3">
                  <div
                    className={`h-full rounded-full transition-colors ${
                      i < currentIdx ? "bg-[var(--meesho-green)]" : "bg-muted"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Place Order Handler ───────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!activeAddress) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);

    // Simulate API calls
    await new Promise((r) => setTimeout(r, 1500));

    const orderNum = `ORD${Date.now().toString(36).toUpperCase()}`;
    setOrderResult({
      order_num: orderNum,
      order_status: "ordered",
      payment_mode: paymentMethod,
    });
    setStep("done");
    setIsProcessing(false);
    toast.success("Order placed successfully!");
  };

  // ─── Loading State ─────────────────────────────────────────
  // ─── Done ──────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 pb-24 min-h-screen">
        <div className="w-20 h-20 rounded-full bg-[var(--meesho-green)]/10 flex items-center justify-center mb-5 animate-fade-in-scale">
          <CheckCircle className="h-10 w-10 text-[var(--meesho-green)]" />
        </div>
        <h2 className="text-lg font-semibold animate-fade-in" style={{ animationDelay: "100ms" }}>
          Order Placed Successfully!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs animate-fade-in" style={{ animationDelay: "200ms" }}>
          Order #{orderResult?.order_num}
        </p>

        <div className="flex items-center gap-6 mt-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <div className="flex flex-col items-center gap-1">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Tracked</span>
          </div>
        </div>

        <Button
          onClick={() => navigate("/dashboard/orders")}
          className="mt-8 bg-[var(--meesho-pink)] text-white"
        >
          View Orders
        </Button>
        <Button
          onClick={() => navigate("/dashboard/search")}
          variant="ghost"
          className="mt-2"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MAIN CHECKOUT FLOW
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => {
              if (step === "payment") setStep("address");
              else if (step === "address") setStep("cart");
              else navigate(-1);
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === "payment" ? "Back" : step === "address" ? "Cart" : ""}
          </button>
          <h1 className="ml-4 text-base font-semibold">
            {step === "cart" && "My Cart"}
            {step === "address" && "Delivery Address"}
            {step === "payment" && "Payment"}
          </h1>
        </div>
        <StepProgress />
      </div>

      {/* ═══ CART STEP ═══════════════════════════════════════ */}
      {step === "cart" && (
        <div className="px-4 pt-4 space-y-4">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="meesho-card p-3 bg-card border border-border">
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg bg-muted shrink-0 overflow-hidden">
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
                    <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="meesho-card p-4 bg-card border border-border">
            <h3 className="text-sm font-semibold mb-3">Price details</h3>
            {cart.total_discount > 0 && (
              <div className="flex items-center gap-2 bg-[var(--meesho-green)]/10 text-[var(--meesho-green)] rounded-lg px-3 py-2 mb-3">
                <Tag className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Total discount: ₹{cart.total_discount}</span>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product Price</span>
                <span>₹{cart.original_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-[var(--meesho-green)] font-medium">FREE</span>
              </div>
              <div className="border-t border-dashed border-border pt-3 mt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-[var(--meesho-pink)]">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setStep("address")}
            className="w-full h-12 bg-[var(--meesho-pink)] text-white hover:bg-[var(--meesho-pink)]/90 meesho-btn"
          >
            Continue — ₹{total}
          </Button>
        </div>
      )}

      {/* ═══ ADDRESS STEP ═══════════════════════════════════ */}
      {step === "address" && (
        <div className="px-4 pt-4 space-y-4">
          <div className="space-y-2">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  selectedAddressId === addr.id
                    ? "border-[var(--meesho-pink)] bg-[var(--meesho-pink)]/5 ring-1 ring-[var(--meesho-pink)]/20"
                    : "border-border hover:border-[var(--meesho-pink)]/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="meesho-pill bg-[var(--meesho-pink)]/10 text-[var(--meesho-pink)]">
                    {addr.address_type}
                  </span>
                  {selectedAddressId === addr.id && (
                    <div className="h-2 w-2 rounded-full bg-[var(--meesho-pink)]" />
                  )}
                </div>
                <p className="text-sm font-medium mt-2">{addr.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {addr.house_number}, {addr.area}, {addr.city} - {addr.pin}
                </p>
              </button>
            ))}
          </div>

          <Button
            onClick={() => setStep("payment")}
            className="w-full h-12 bg-[var(--meesho-pink)] text-white meesho-btn"
          >
            Continue to Payment
          </Button>
        </div>
      )}

      {/* ═══ PAYMENT STEP ═══════════════════════════════════ */}
      {step === "payment" && (
        <div className="px-4 pt-4 space-y-4">
          {/* Address Card */}
          {activeAddress && (
            <div className="meesho-card p-3 bg-card border border-border flex items-center justify-between">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <MapPin className="h-4 w-4 text-[var(--meesho-pink)] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{activeAddress.name}</p>
                    <span className="meesho-pill bg-[var(--meesho-pink)]/10 text-[var(--meesho-pink)] text-[9px]">
                      {activeAddress.address_type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {activeAddress.house_number}, {activeAddress.area}, {activeAddress.city} - {activeAddress.pin}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep("address")}
                className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 shrink-0 ml-2"
              >
                Change
              </button>
            </div>
          )}

          {/* Price Summary */}
          <div className="meesho-card p-4 bg-card border border-border">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({cart.total_quantity})</span>
                <span>₹{cart.original_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-[var(--meesho-green)]">- ₹{cart.total_discount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-[var(--meesho-green)]">FREE</span>
              </div>
              <div className="border-t border-dashed border-border pt-3 mt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-[var(--meesho-pink)]">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Select payment method</p>
            {PAYMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  onClick={() => setPaymentMethod(opt.type)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    paymentMethod === opt.type
                      ? "border-[var(--meesho-pink)] bg-[var(--meesho-pink)]/5 ring-1 ring-[var(--meesho-pink)]/20"
                      : "border-border hover:border-[var(--meesho-pink)]/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${opt.color}15` }}>
                      <Icon className="h-5 w-5" style={{ color: opt.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{opt.display_name}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">₹{total}</p>
                    </div>
                    {paymentMethod === opt.type && (
                      <div className="h-2 w-2 rounded-full bg-[var(--meesho-pink)] shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handlePlaceOrder}
            className="w-full h-12 bg-[var(--meesho-pink)] text-white hover:bg-[var(--meesho-pink)]/90 meesho-btn"
            disabled={isProcessing || !paymentMethod}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Place Order — ₹{total}
          </Button>
        </div>
      )}
    </div>
  );
}

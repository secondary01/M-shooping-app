import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle,
  Loader2,
  Clock,
  Truck,
  Tag,
  X,
  ShoppingCart,
  Shield,
  RotateCcw,
  Zap,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type CheckoutStep = "cart" | "address" | "payment" | "qr" | "verifying" | "done" | "failed";

const STEP_LABELS: Record<string, string> = {
  cart: "Cart",
  address: "Address",
  payment: "Payment",
};

export default function CheckoutPage() {
  const navigate = useNavigate();

  // ─── mcheckout API calls ────────────────────────────────────
  const cart = useQuery(api.mcheckout.getCart, {});
  const addresses = useQuery(api.mcheckout.getAddresses);
  const paymentOptions = useQuery(api.mcheckout.listPaymentOptions, {
    totalAmount: cart?.total ?? 0,
  });

  // ─── Mutations ─────────────────────────────────────────────
  const setCartLocation = useMutation(api.mcheckout.setCartLocation);
  const setPaymentInfo = useMutation(api.mcheckout.setPaymentInfo);
  const createPreorder = useMutation(api.mcheckout.createPreorder);
  const startTransaction = useAction(api.mcheckout.startTransaction);
  const finalizeOrder = useMutation(api.mcheckout.finalizeOrder);

  // ─── State ─────────────────────────────────────────────────
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [orderResult, setOrderResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Derived state ─────────────────────────────────────────
  const activeAddress = addresses?.find((a) => a.id === selectedAddressId);
  const items = cart?.items ?? [];
  const total = cart?.total ?? 0;
  const priceBreakUp = cart?.price_break_up ?? [];

  // ─── Step Progress Bar ─────────────────────────────────────
  const StepProgress = () => {
    const steps = ["cart", "address", "payment"];
    const currentIdx = steps.indexOf(step === "qr" || step === "verifying" ? "payment" : step);

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
                        : "bg-[var(--meesho-grey-base)] text-[var(--muted-foreground)]"
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
                      i < currentIdx ? "bg-[var(--meesho-green)]" : "bg-[var(--meesho-grey-base)]"
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
    try {
      // Step 1: Set payment info (mcheckout/api/1.0/cart/paymentinfo)
      const paymentType = paymentMethod === "cod" ? "COD" : "UPI";
      await setPaymentInfo({
        paymentMethodType: paymentType,
        paymentMethod: paymentMethod,
      });

      // Step 2: Create preorder (mcheckout/api/4.0/preorders)
      const preorder = await createPreorder({
        addressId: activeAddress.id as any,
        paymentMethod,
        totalAmount: total,
      });

      // Step 3: Start transaction (mcheckout/api/juspay/txns)
      if (paymentMethod !== "cod") {
        const txnResult = await startTransaction({
          orderNum: preorder.order_num,
          preOrderId: preorder.pre_order_id,
          paymentMethod,
          totalAmount: total,
        });

        if (txnResult.status === "PENDING_VBV") {
          // Show QR/UPI screen
          setOrderResult({ ...preorder, txn: txnResult });
          setStep("qr");
          setIsProcessing(false);
          return;
        }
      }

      // Step 4: Finalize order (mcheckout/api/3.0/order)
      const orderResult = await finalizeOrder({
        orderNum: preorder.order_num,
        preOrderId: preorder.pre_order_id,
        addressId: activeAddress.id as any,
        paymentMethod,
        totalAmount: total,
        priceBreakUp,
      });

      setOrderResult(orderResult);
      setStep("done");
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("[Checkout] Order failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Loading State ─────────────────────────────────────────
  if (cart === undefined || addresses === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--meesho-pink)]" />
      </div>
    );
  }

  // ─── Empty Cart ────────────────────────────────────────────
  if (items.length === 0 && step === "cart") {
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
          <div className="flex flex-col items-center gap-1">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Returns</span>
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

  // ─── Failed ────────────────────────────────────────────────
  if (step === "failed") {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 pb-24 min-h-screen">
        <div className="w-20 h-20 rounded-full bg-[var(--meesho-yellow)]/10 flex items-center justify-center mb-5">
          <Clock className="h-10 w-10 text-[var(--meesho-yellow)]" />
        </div>
        <h2 className="text-lg font-semibold">Payment Pending</h2>
        <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs">
          Your payment is being verified. Check Orders for updates.
        </p>
        <Button onClick={() => navigate("/dashboard/orders")} className="mt-6 bg-[var(--meesho-pink)] text-white">
          Check Orders
        </Button>
      </div>
    );
  }

  // ─── QR / UPI Screen ───────────────────────────────────────
  if (step === "qr") {
    return (
      <div className="flex flex-col items-center px-4 py-8 pb-24 min-h-screen">
        <div className="w-full max-w-sm">
          <button
            onClick={() => setStep("payment")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="text-center mb-6">
            <h2 className="text-base font-semibold">Scan to Pay</h2>
            <p className="text-3xl font-bold mt-2 text-[var(--meesho-pink)]">₹{total}</p>
          </div>

          <div className="w-56 h-56 mx-auto rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-white">
            <div className="grid grid-cols-7 gap-px p-4">
              {Array.from({ length: 49 }).map((_, i) => {
                const row = Math.floor(i / 7);
                const col = i % 7;
                const isCorner = (row < 3 && col < 3) || (row < 3 && col > 3) || (row > 3 && col < 3);
                const isCenter = row === 3 && col === 3;
                const pattern = (row * 7 + col) % 3 === 0 || isCorner || isCenter;
                return <div key={i} className={`h-4 w-4 ${pattern ? "bg-[#353543]" : "bg-white"}`} />;
              })}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Scan with your UPI app</p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            After completing payment, click verify below
          </p>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={async () => {
                setIsProcessing(true);
                try {
                  const preorder = orderResult;
                  if (preorder) {
                    const result = await finalizeOrder({
                      orderNum: preorder.order_num,
                      preOrderId: preorder.pre_order_id,
                      addressId: activeAddress?.id as any,
                      paymentMethod: "online",
                      totalAmount: total,
                      priceBreakUp,
                    });
                    setOrderResult(result);
                    setStep("done");
                    toast.success("Payment verified!");
                  }
                } catch (err) {
                  toast.error("Verification failed");
                } finally {
                  setIsProcessing(false);
                }
              }}
              className="flex-1 bg-[var(--meesho-green)] text-white h-12"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              I've Paid
            </Button>
            <Button onClick={() => setStep("payment")} variant="outline" className="flex-1 h-12">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Verifying ─────────────────────────────────────────────
  if (step === "verifying") {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 pb-24 min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--meesho-pink)] mb-4" />
        <p className="text-sm font-medium">Processing payment...</p>
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

          {/* Price Summary — from server */}
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
              {cart.supplier_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Supplier Discount</span>
                  <span className="text-[var(--meesho-green)]">- ₹{cart.supplier_discount}</span>
                </div>
              )}
              {cart.first_order_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">1st Order Discount</span>
                  <span className="text-[var(--meesho-green)]">- ₹{cart.first_order_discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={cart.delivery_charge === 0 ? "text-[var(--meesho-green)] font-medium" : ""}>
                  {cart.delivery_charge === 0 ? "FREE" : `₹${cart.delivery_charge}`}
                </span>
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
            <Zap className="mr-2 h-4 w-4" />
            Continue — ₹{total}
          </Button>
        </div>
      )}

      {/* ═══ ADDRESS STEP ═══════════════════════════════════ */}
      {step === "address" && (
        <div className="px-4 pt-4 space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-border">
              <MapPin className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No saved addresses</p>
              <Button onClick={() => navigate("/dashboard/addresses")} variant="outline" className="mt-3">
                Add Address
              </Button>
            </div>
          ) : (
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
          )}

          <Button
            onClick={() => {
              if (!selectedAddressId && addresses.length > 0) {
                setSelectedAddressId(addresses[0].id);
              }
              setStep("payment");
            }}
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
              {cart.total_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-[var(--meesho-green)]">- ₹{cart.total_discount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className={cart.delivery_charge === 0 ? "text-[var(--meesho-green)]" : ""}>
                  {cart.delivery_charge === 0 ? "FREE" : `₹${cart.delivery_charge}`}
                </span>
              </div>
              <div className="border-t border-dashed border-border pt-3 mt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-[var(--meesho-pink)]">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods — from API */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Select payment method</p>
            {paymentOptions?.options.map((opt) => (
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
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    opt.type === "cod" ? "bg-[var(--meesho-yellow)]/10" :
                    opt.type === "upi" ? "bg-[var(--meesho-green)]/10" :
                    opt.type === "card" ? "bg-[var(--meesho-blue)]/10" :
                    "bg-[var(--meesho-pink)]/10"
                  }`}>
                    {opt.type === "cod" && <Banknote className="h-5 w-5 text-[var(--meesho-yellow)]" />}
                    {opt.type === "upi" && <Smartphone className="h-5 w-5 text-[var(--meesho-green)]" />}
                    {opt.type === "card" && <CreditCard className="h-5 w-5 text-[var(--meesho-blue)]" />}
                    {opt.type === "wallet" && <Wallet className="h-5 w-5 text-[var(--meesho-pink)]" />}
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
            ))}
          </div>

          <Button
            onClick={handlePlaceOrder}
            className="w-full h-12 bg-[var(--meesho-pink)] text-white hover:bg-[var(--meesho-pink)]/90 meesho-btn"
            disabled={isProcessing || !paymentMethod}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            Place Order — ₹{total}
          </Button>
        </div>
      )}
    </div>
  );
}

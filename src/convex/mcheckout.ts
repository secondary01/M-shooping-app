import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════════════
// CART API — 8.0 Pricing Engine Pattern
// Server-authoritative: re-prices after every mutation
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /mcheckout/api/8.0/cart
 * The pricing engine — returns full cart state with price breakup.
 * Called after every cart/address/payment change to re-price.
 */
export const getCart = query({
  args: {
    addressId: v.optional(v.id("addresses")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { items: [], price_break_up: [], total: 0, total_quantity: 0 };

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      return { items: [], price_break_up: [], total: 0, total_quantity: 0 };
    }

    // Fetch product details for each cart item
    const items = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;
        return {
          id: item._id,
          product_id: item.productId,
          name: product.name,
          image: product.image,
          size: item.size,
          quantity: item.quantity,
          // Server-authoritative pricing
          price: product.price,
          original_price: product.originalPrice ?? product.price,
          in_stock: product.inStock,
        };
      }),
    );

    const validItems = items.filter(Boolean) as NonNullable<(typeof items)[number]>[];

    // Calculate pricing — server-side, not client-side
    const productPriceTotal = validItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const originalPriceTotal = validItems.reduce(
      (sum, item) => sum + item.original_price * item.quantity,
      0
    );

    // First order discount
    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const isFirstOrder = !existingOrders;
    const firstOrderDiscount = isFirstOrder ? 120 : 0;
    const supplierDiscount = originalPriceTotal - productPriceTotal;
    const totalDiscount = supplierDiscount + firstOrderDiscount;

    // Delivery
    const deliveryCharge = productPriceTotal >= 499 ? 0 : 49;
    const total = productPriceTotal + deliveryCharge - firstOrderDiscount;

    // Price breakup — matches Meesho's format
    const price_break_up = [
      {
        type: "PRODUCT_PRICE",
        value: originalPriceTotal,
        details: validItems.map((item) => ({
          type: "PRODUCT_PRICE",
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          value: item.original_price,
        })),
      },
      {
        type: "DISCOUNT",
        value: -supplierDiscount,
        details: [
          { type: "SUPPLIER_DISCOUNT", value: -supplierDiscount },
        ],
      },
      ...(firstOrderDiscount > 0
        ? [
            {
              type: "DISCOUNT",
              value: -firstOrderDiscount,
              details: [
                { type: "FIRST_ORDER_DISCOUNT", value: -firstOrderDiscount },
              ],
            },
          ]
        : []),
      {
        type: "DELIVERY_CHARGE",
        value: deliveryCharge,
        details: [],
      },
    ];

    return {
      items: validItems,
      price_break_up,
      total_quantity: validItems.reduce((sum, item) => sum + item.quantity, 0),
      product_price: productPriceTotal,
      original_price: originalPriceTotal,
      supplier_discount: supplierDiscount,
      first_order_discount: firstOrderDiscount,
      total_discount: totalDiscount,
      delivery_charge: deliveryCharge,
      total: Math.max(total, 0),
      effective_total: total,
      is_first_order: isFirstOrder,
      address_id: args.addressId ?? null,
    };
  },
});

/**
 * POST /mcheckout/api/1.0/cart/minview
 * Lightweight cart badge count
 */
export const getCartMinView = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { count: 0 };

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return {
      count: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════
// ADDRESS API — 3.0 Pattern
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /mcheckout/api/3.0/addresses
 */
export const getAddresses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return addresses.map((addr) => ({
      id: addr._id,
      name: addr.fullName,
      mobile: addr.phone,
      pin: addr.pinCode,
      city: addr.city,
      state: addr.state,
      house_number: addr.houseNumber,
      area: addr.area,
      landmark: addr.landmark,
      address_type: addr.label,
      is_default: addr.isDefault,
      coordinates: null, // Would be populated from geocoding in production
    }));
  },
});

/**
 * POST /mcheckout/api/1.0/cart/location
 * Binds address to cart, triggers re-pricing
 */
export const setCartLocation = mutation({
  args: {
    addressId: v.id("addresses"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    // Return the address with location info for re-pricing
    return {
      address_id: args.addressId,
      pin: address.pinCode,
      city: address.city,
      state: address.state,
      // In production, this would trigger shipping re-calculation
      shipping_available: true,
      estimated_delivery_days: 7,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════
// PAYMENT API — Juspay Integration Pattern
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /mcheckout/api/v1/list/payment-options
 * Lists payment methods available for the order total.
 * In production, this would call Juspay's API.
 */
export const listPaymentOptions = query({
  args: {
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { options: [], client_auth_token: null };

    // Payment options available based on order total
    const options = [
      {
        type: "cod",
        display_name: "Cash On Delivery",
        description: "Pay when your order arrives",
        enabled: args.totalAmount <= 5000, // COD limit
        icon: "cod",
        min_amount: 0,
        max_amount: 5000,
      },
      {
        type: "upi",
        display_name: "UPI",
        description: "Pay via any UPI app",
        enabled: true,
        icon: "upi",
        min_amount: 1,
        max_amount: 100000,
        sub_options: [
          { type: "upi_intent", display_name: "UPI App", description: "Open your UPI app" },
          { type: "upi_qr", display_name: "UPI QR", description: "Scan QR code" },
          { type: "upi_collect", display_name: "UPI Collect", description: "Enter UPI ID" },
        ],
      },
      {
        type: "card",
        display_name: "Credit / Debit Card",
        description: "Visa, Mastercard, RuPay",
        enabled: true,
        icon: "card",
        min_amount: 1,
        max_amount: 500000,
      },
      {
        type: "wallet",
        display_name: "Wallets",
        description: "PhonePe, GPay, Paytm",
        enabled: true,
        icon: "wallet",
        min_amount: 1,
        max_amount: 100000,
      },
    ];

    // In production: POST to Juspay to get client_auth_token
    // const juspayToken = await callJuspayAuth(userId, args.totalAmount);

    return {
      options: options.filter((o) => args.totalAmount >= o.min_amount && args.totalAmount <= o.max_amount),
      client_auth_token: `mock_token_${userId}`, // Replace with real Juspay token
      merchant_id: "meesho",
      currency: "INR",
    };
  },
});

/**
 * POST /mcheckout/api/1.0/cart/paymentinfo
 * Sets the chosen payment instrument
 */
export const setPaymentInfo = mutation({
  args: {
    paymentMethodType: v.string(), // "UPI", "CARD", "WALLET", "COD"
    paymentMethod: v.string(),     // "upi_qr", "upi_intent", "card", "cod"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Store payment selection in audit log
    await ctx.db.insert("auditLogs", {
      userId,
      event: "payment_info_set",
      details: {
        payment_method_type: args.paymentMethodType,
        payment_method: args.paymentMethod,
      },
      createdAt: Date.now(),
    });

    return {
      payment_method_type: args.paymentMethodType,
      payment_method: args.paymentMethod,
      status: "selected",
    };
  },
});

/**
 * POST /mcheckout/api/4.0/preorders
 * Creates pre-order with Juspay transaction params
 */
export const createPreorder = mutation({
  args: {
    addressId: v.id("addresses"),
    paymentMethod: v.string(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found");
    }

    // Generate order number
    const orderNum = `ORD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // In production, this would call Juspay to create transaction params
    const juspayTransactionParams = {
      request_id: `req_${Date.now()}`,
      order_id: orderNum,
      client_auth_token: `auth_${userId}_${Date.now()}`,
      merchant_id: "meesho",
      amount: args.totalAmount,
      currency: "INR",
    };

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      event: "preorder_created",
      details: {
        order_num: orderNum,
        payment_method: args.paymentMethod,
        total_amount: args.totalAmount,
        address_id: args.addressId,
      },
      createdAt: Date.now(),
    });

    return {
      order_num: orderNum,
      pre_order_id: `pre_${orderNum}`,
      juspay_transaction_params: juspayTransactionParams,
      status: "created",
    };
  },
});

/**
 * POST /mcheckout/api/juspay/txns
 * Starts Juspay transaction — returns UPI intent / redirect URL
 */
export const startTransaction = action({
  args: {
    orderNum: v.string(),
    preOrderId: v.string(),
    paymentMethod: v.string(),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    // In production, this would call Juspay's transaction API
    // POST https://api.juspay.in/txns with the order params

    if (args.paymentMethod === "cod") {
      return {
        status: "COD_PENDING",
        order_id: args.orderNum,
        message: "Cash on Delivery order created",
      };
    }

    // UPI intent URL format
    const upiIntent = `upi://pay?pa=meesho@ybl&pn=Meesho&am=${args.totalAmount}&tr=${args.orderNum}&mode=22`;

    return {
      status: "PENDING_VBV",
      order_id: args.orderNum,
      pgIntentUrl: upiIntent,
      authentication: {
        url: `https://meesho.com/payment/checkout?order=${args.orderNum}`,
      },
      payment_method: args.paymentMethod,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════
// ORDER API — 3.0 Finalization Pattern
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /mcheckout/api/3.0/order
 * Finalizes the order — creates order record, clears cart
 */
export const finalizeOrder = mutation({
  args: {
    orderNum: v.string(),
    preOrderId: v.optional(v.string()),
    addressId: v.id("addresses"),
    paymentMethod: v.string(),
    totalAmount: v.number(),
    priceBreakUp: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Fetch address
    const address = await ctx.db.get(args.addressId);
    if (!address || address.userId !== userId) {
      throw new Error("Address not found or unauthorized");
    }

    // Fetch cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty — cannot place order");
    }

    // Build order items with server-verified prices
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        return {
          productId: item.productId,
          name: product.name,
          image: product.image,
          price: product.price, // Server-authoritative price
          size: item.size,
          quantity: item.quantity,
        };
      })
    );

    // Calculate totals server-side
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // First order discount check
    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const discountApplied = !existingOrders ? 120 : 0;
    const finalTotal = totalAmount - discountApplied;

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      userId,
      items: orderItems,
      addressId: args.addressId,
      addressSnapshot: {
        fullName: address.fullName,
        phone: address.phone,
        pinCode: address.pinCode,
        city: address.city,
        state: address.state,
        houseNumber: address.houseNumber,
        area: address.area,
        landmark: address.landmark,
        label: address.label,
      },
      paymentMethod: args.paymentMethod as "cash" | "online",
      paymentStatus: args.paymentMethod === "cod" ? "paid" : "pending",
      totalAmount: finalTotal,
      discountApplied: discountApplied > 0 ? discountApplied : undefined,
      status: "placed",
      createdAt: Date.now(),
    });

    // Clear the cart
    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      event: "order_placed",
      details: {
        order_id: orderId,
        order_num: args.orderNum,
        total: finalTotal,
        items_count: orderItems.length,
        payment_method: args.paymentMethod,
      },
      createdAt: Date.now(),
    });

    // Return format matching Meesho's API response
    return {
      order_num: args.orderNum,
      order_id: orderId,
      order_status: "ordered",
      order_status_message: "We have received your order",
      total_quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      effective_total: finalTotal,
      sender: {
        id: userId,
        name: address.fullName,
        phone: address.phone,
      },
      address: {
        id: address._id,
        name: address.fullName,
        mobile: address.phone,
        pin: address.pinCode,
        city: address.city,
        state: address.state,
        address_type: address.label,
      },
      payment_modes: [
        {
          type: args.paymentMethod === "cod" ? "cod" : "online",
          selected: true,
          display_name: args.paymentMethod === "cod" ? "Cash On Delivery" : "Online Payment",
        },
      ],
      price_break_up: args.priceBreakUp,
      orders: [
        {
          order_num: args.orderNum,
          order_details: orderItems.map((item) => ({
            product_id: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            size: item.size,
            quantity: item.quantity,
          })),
        },
      ],
    };
  },
});

/**
 * GET /mcheckout/api/order-animation
 * Returns Lottie animation config for success screen
 */
export const getOrderAnimation = query({
  args: {},
  handler: async () => {
    // In production, this would return the actual Lottie JSON URL
    return {
      animation_url: null, // Would be a CDN URL for the Lottie file
      type: "confetti",
      duration_ms: 3000,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════
// USER PROFILE — 1.0 Pattern
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /mcheckout/api/1.0/user-profile
 * Returns logged-in user info
 */
export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Get linked accounts for phone
    const linkedAccounts = await ctx.db
      .query("linkedAccounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const primaryPhone = linkedAccounts.find((a) => a.status === "verified")?.phone;

    return {
      userId,
      name: user.name,
      email: user.email,
      phone: primaryPhone,
      is_anonymous: user.isAnonymous,
      feature_toggles: {
        price_unbundling: true,
        lottie_animations: true,
        cod_enabled: true,
        upi_enabled: true,
      },
    };
  },
});

/**
 * GET /mcheckout/api/1.0/config
 * Client feature flags
 */
export const getConfig = query({
  args: {},
  handler: async () => {
    return {
      price_unbundling_variant: "v2",
      lottie_animation_url: null,
      cod_enabled: true,
      upi_enabled: true,
      card_enabled: true,
      wallet_enabled: true,
      max_cod_amount: 5000,
      free_delivery_threshold: 499,
    };
  },
});

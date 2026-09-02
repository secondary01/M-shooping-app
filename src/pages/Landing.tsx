import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Search,
  ShoppingCart,
  Package,
  Truck,
  Shield,
  CreditCard,
  Star,
  Zap,
  TrendingUp,
  Gift,
  ChevronRight,
} from "lucide-react";

const CATEGORIES = [
  {
    name: "Fashion",
    desc: "Trendy styles for everyone",
    gradient: "from-pink-500 to-rose-500",
    icon: "👗",
  },
  {
    name: "Electronics",
    desc: "Latest gadgets & devices",
    gradient: "from-blue-500 to-cyan-500",
    icon: "📱",
  },
  {
    name: "Home & Kitchen",
    desc: "Modern living essentials",
    gradient: "from-emerald-500 to-teal-500",
    icon: "🏠",
  },
  {
    name: "Beauty",
    desc: "Skincare & wellness",
    gradient: "from-purple-500 to-violet-500",
    icon: "✨",
  },
  {
    name: "Footwear",
    desc: "Step in style",
    gradient: "from-orange-500 to-amber-500",
    icon: "👟",
  },
  {
    name: "Accessories",
    desc: "Complete your look",
    gradient: "from-indigo-500 to-blue-500",
    icon: "💎",
  },
];

const FEATURES = [
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "On orders over ₹499",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "100% safe checkout",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: CreditCard,
    title: "COD Available",
    desc: "Pay when you receive",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    desc: "Get it in 3-5 days",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const DEALS = [
  {
    title: "Mega Fashion Sale",
    discount: "Up to 80% OFF",
    gradient: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
    tag: "Trending",
  },
  {
    title: "Electronics Bonanza",
    discount: "Starting ₹299",
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
    tag: "Hot Deal",
  },
  {
    title: "New User Special",
    discount: "Extra ₹120 OFF",
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
    tag: "First Order",
  },
];

const STATS = [
  { value: "10M+", label: "Happy Customers" },
  { value: "50K+", label: "Products" },
  { value: "500+", label: "Categories" },
  { value: "4.8", label: "App Rating" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShopHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/search")}
              className="hidden sm:flex"
            >
              <Search className="h-4 w-4 mr-2" />
              Browse
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25"
            >
              Sign In
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                <Zap className="h-3 w-3" />
                Over 10 Million Happy Customers
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1]"
            >
              Discover the
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Best Deals
              </span>
              Online
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground leading-relaxed"
            >
              Shop from thousands of products across fashion, electronics, home
              & more. Get the lowest prices with free delivery on orders over
              ₹499.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl shadow-blue-500/25 h-14 px-8 text-base"
              >
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                onClick={() => navigate("/dashboard/search")}
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base border-border/50"
              >
                Browse Products
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid grid-cols-4 gap-4"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deals Banner */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Hot Deals</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Limited time offers you don't want to miss
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard/search")}
              className="hidden sm:flex"
            >
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEALS.map((deal, i) => (
              <motion.div
                key={deal.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => navigate("/auth")}
                className={`relative cursor-pointer rounded-2xl bg-gradient-to-br ${deal.gradient} border ${deal.border} p-6 hover:scale-[1.02] transition-transform`}
              >
                <span className="inline-block px-2 py-0.5 rounded-full bg-foreground/10 text-[10px] font-semibold uppercase tracking-wider mb-3">
                  {deal.tag}
                </span>
                <h3 className="text-lg font-bold">{deal.title}</h3>
                <p className="text-2xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {deal.discount}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400 mb-2">
              Shop by Category
            </p>
            <h2 className="text-2xl font-bold">Find What You Love</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => navigate("/auth")}
                className="group cursor-pointer"
              >
                <div
                  className={`relative rounded-2xl bg-gradient-to-br ${cat.gradient} p-6 text-center hover:scale-[1.03] transition-all duration-200 shadow-lg`}
                >
                  <span className="text-4xl mb-3 block">{cat.icon}</span>
                  <p className="text-sm font-bold text-white">{cat.name}</p>
                  <p className="text-[11px] text-white/70 mt-0.5">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-400 mb-2">
              Why Choose Us
            </p>
            <h2 className="text-2xl font-bold">Trusted by Millions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                stars: 5,
                title: "Amazing Selection",
                text: "Over 50,000 products across all categories. Always find what you need.",
                author: "Priya M.",
              },
              {
                stars: 5,
                title: "Fast & Free Delivery",
                text: "Free delivery on orders over ₹499. Most orders arrive in 3-5 days.",
                author: "Rahul K.",
              },
              {
                stars: 5,
                title: "Easy Returns",
                text: "7-day easy returns on all products. No questions asked.",
                author: "Anita S.",
              },
            ].map((review, i) => (
              <motion.div
                key={review.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border/50"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm font-semibold">{review.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {review.text}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {review.author[0]}
                    </span>
                  </div>
                  <p className="text-xs font-medium">{review.author}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 border border-blue-500/20 p-12 md:p-16"
          >
            <div className="absolute top-6 right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
            <div className="absolute bottom-6 left-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                <Gift className="h-3 w-3" />
                Get ₹120 OFF on First Order
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Shopping?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                Join millions of happy customers and discover amazing deals on
                thousands of products. Sign up now and get ₹120 off!
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => navigate("/auth")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-xl shadow-blue-500/25 h-14 px-10 text-base"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Free delivery • Easy returns • Secure payments
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold">ShopHub</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your one-stop destination for the best deals on fashion,
                electronics, and more.
              </p>
            </div>

            {[
              {
                title: "Shop",
                links: ["Fashion", "Electronics", "Home", "Beauty"],
              },
              {
                title: "Support",
                links: ["Help Center", "Returns", "Contact Us", "FAQs"],
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Blog", "Press"],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-muted-foreground">
              © 2026 ShopHub. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

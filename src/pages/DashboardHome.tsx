import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  ShoppingBag,
  Target,
  Smartphone,
  Gift,
  TrendingUp,
  Search,
  ArrowRight,
  Zap,
  Tag,
  Star,
} from "lucide-react";

const CATEGORIES = [
  { name: "Fashion", icon: "👗", color: "from-[#9F2089] to-[#D9A6D0]" },
  { name: "Electronics", icon: "📱", color: "from-[#5585f8] to-[#ADC6FF]" },
  { name: "Home", icon: "🏠", color: "from-[#038D63] to-[#91e5bd]" },
  { name: "Beauty", icon: "✨", color: "from-[#9F2089] to-[#EEDEFF]" },
  { name: "Footwear", icon: "👟", color: "from-[#EE7212] to-[#FFE8CD]" },
  { name: "Accessories", icon: "💎", color: "from-[#5585f8] to-[#e7eeff]" },
];

const DEALS_OF_DAY = [
  {
    title: "Mega Fashion Sale",
    discount: "Up to 80% OFF",
    gradient: "from-[#9F2089]/20 to-[#D9A6D0]/10",
    border: "border-[#9F2089]/20",
  },
  {
    title: "Electronics Deals",
    discount: "Starting ₹299",
    gradient: "from-[#5585f8]/20 to-[#ADC6FF]/10",
    border: "border-[#5585f8]/20",
  },
  {
    title: "New User Special",
    discount: "Extra ₹120 OFF",
    gradient: "from-[#038D63]/20 to-[#91e5bd]/10",
    border: "border-[#038D63]/20",
  },
];

export default function DashboardHome() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const ensureWallet = useMutation(api.wallet.ensure);
  const wallet = useQuery(api.wallet.get);
  const linkedAccounts = useQuery(api.linkedAccounts.list);
  const offerHunts = useQuery(api.offerHunts.list);
  const products = useQuery(api.products.list, {});

  useEffect(() => {
    if (isAuthenticated) ensureWallet();
  }, [ensureWallet, isAuthenticated]);

  const activeAccount = linkedAccounts?.find(
    (a) => a.status === "verified",
  );
  const recentHunt = offerHunts?.[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 glass border-b border-border/50">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[var(--meesho-pink)] flex items-center justify-center shadow-lg shadow-[var(--meesho-pink)]/20">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {activeAccount?.phone
                  ? `+91 ${activeAccount.phone}`
                  : user?.email || "Guest"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard/search")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--meesho-pink)]/10 text-[var(--meesho-pink)] text-sm font-medium hover:bg-[var(--meesho-pink)]/15 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/account")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/15 transition-colors"
            >
              <span className="text-xs">💰</span>
              ₹{wallet?.balance ?? 0}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Welcome Banner */}
        <div className="animate-fade-in relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--meesho-pink)]/10 via-[var(--meesho-pink-light)]/5 to-transparent border border-[var(--meesho-pink)]/10 p-5">
          <div className="relative z-10">
            <p className="text-xs text-[var(--meesho-pink-light)] font-medium uppercase tracking-wider mb-1">
              Welcome back
            </p>
            <h2 className="text-lg font-bold">
              {user?.name || "Explorer"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Find the best deals and discounts
            </p>
          </div>
          <div className="absolute top-3 right-3 w-16 h-16 rounded-full bg-[var(--meesho-pink)]/10 blur-xl" />
        </div>

        {/* Search Bar */}
        <button
          onClick={() => navigate("/dashboard/search")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-left hover:border-border transition-colors"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Search for products...
          </span>
        </button>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shop by Category
            </p>
            <button
              onClick={() => navigate("/dashboard/search")}
              className="text-xs text-[var(--meesho-pink)] hover:text-[var(--meesho-pink-light)]"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate("/dashboard/search")}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-xl">{cat.icon}</span>
                </div>
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Deals of the Day */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--meesho-yellow)]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Deals of the Day
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {DEALS_OF_DAY.map((deal) => (
              <button
                key={deal.title}
                onClick={() => navigate("/dashboard/search")}
                className={`w-full rounded-xl bg-gradient-to-r ${deal.gradient} border ${deal.border} p-4 text-left hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{deal.title}</p>
                    <p className="text-lg font-bold mt-1 text-[var(--meesho-pink)]">
                      {deal.discount}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--meesho-pink)]" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Quick Actions
          </p>
          <div className="stagger-children grid grid-cols-2 gap-3">
            {[
              {
                label: "Add Account",
                desc: "Link & earn bonus",
                icon: Smartphone,
                color: "pink",
                path: "/dashboard/add-account",
              },
              {
                label: "Offer Hunt",
                desc: "Find max discount",
                icon: Target,
                color: "green",
                path: "/dashboard/offer-hunt",
              },
              {
                label: "My Orders",
                desc: "Track deliveries",
                icon: TrendingUp,
                color: "orange",
                path: "/dashboard/orders",
              },
              {
                label: "Refer & Earn",
                desc: "Share your link",
                icon: Gift,
                color: "yellow",
                path: "/dashboard/refer",
              },
            ].map((action) => {
              const colorMap: Record<
                string,
                { bg: string; text: string; glow: string }
              > = {
                pink: {
                  bg: "bg-[#9F2089]/10",
                  text: "text-[#9F2089]",
                  glow: "shadow-[#9F2089]/5",
                },
                green: {
                  bg: "bg-[#038D63]/10",
                  text: "text-[#038D63]",
                  glow: "shadow-[#038D63]/5",
                },
                orange: {
                  bg: "bg-[#EE7212]/10",
                  text: "text-[#EE7212]",
                  glow: "shadow-[#EE7212]/5",
                },
                yellow: {
                  bg: "bg-[#F4B619]/10",
                  text: "text-[#F4B619]",
                  glow: "shadow-[#F4B619]/5",
                },
              };
              const colors = colorMap[action.color];
              const Icon = action.icon;
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`relative group bg-card rounded-2xl p-4 border border-border/50 text-left hover:border-border transition-all duration-200 hover:shadow-lg ${colors.glow}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {action.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trending Products */}
        {products && products.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--meesho-pink)]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trending Now
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/search")}
                className="text-xs text-[var(--meesho-pink)] hover:text-[var(--meesho-pink-light)]"
              >
                View All
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {products.slice(0, 6).map((product) => (
                <button
                  key={product._id}
                  onClick={() =>
                    navigate(`/dashboard/product/${product._id}`)
                  }
                  className="flex-shrink-0 w-32 rounded-xl bg-card border border-border/50 overflow-hidden text-left hover:border-border transition-all"
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-2">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs font-bold">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="flex items-center gap-0.5 mt-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] text-muted-foreground">
                          {product.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Account Status */}
        {linkedAccounts && linkedAccounts.length > 0 && (
          <div className="animate-fade-in bg-card rounded-2xl p-4 border border-border/50">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Linked Accounts
            </p>
            <div className="space-y-2">
              {linkedAccounts.slice(0, 3).map((acc) => (
                <div
                  key={acc._id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        acc.status === "verified"
                          ? "bg-[#038D63] shadow-sm shadow-[#038D63]/50"
                          : acc.status === "pending"
                            ? "bg-[#F4B619]"
                            : "bg-[#E11900]"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium capitalize">
                        {acc.platform}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        •••{acc.phone.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-medium capitalize px-2 py-0.5 rounded-full ${
                      acc.status === "verified"
                        ? "bg-[#038D63]/10 text-[#038D63]"
                        : acc.status === "pending"
                          ? "bg-[#F4B619]/10 text-[#F4B619]"
                          : "bg-[#E11900]/10 text-[#E11900]"
                    }`}
                  >
                    {acc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Hunt */}
        {recentHunt && (
          <button
            onClick={() => navigate("/dashboard/offer-hunt")}
            className="w-full animate-fade-in bg-card rounded-2xl p-4 border border-border/50 text-left hover:border-border transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Latest Offer Hunt
                </p>
                <p className="text-sm font-medium">
                  Target: ₹{recentHunt.targetDiscount} · Best:
                  ₹{recentHunt.bestDiscount}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  recentHunt.status === "success"
                    ? "bg-[#038D63]/10 text-[#038D63]"
                    : recentHunt.status === "fallback"
                      ? "bg-[#F4B619]/10 text-[#F4B619]"
                      : "bg-[#9F2089]/10 text-[#9F2089]"
                }`}
              >
                {recentHunt.status}
              </span>
            </div>
          </button>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 stagger-children pb-4">
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#038D63]/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-[#038D63]" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Wallet Balance
              </p>
            </div>
            <p className="text-xl font-bold">
              ₹{wallet?.balance ?? 0}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#9F2089]/10 flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-[#9F2089]" />
              </div>
              <p className="text-[11px] text-muted-foreground">Accounts</p>
            </div>
            <p className="text-xl font-bold">
              {linkedAccounts?.length ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

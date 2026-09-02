import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Link } from "lucide-react";

const ALL_PRODUCTS = [
  { id: "1", name: "Wireless Headphones Pro", price: 1299, originalPrice: 2499, rating: 4.5, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", category: "electronics" },
  { id: "2", name: "Cotton T-Shirt Premium", price: 399, originalPrice: 799, rating: 4.2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop", category: "clothing" },
  { id: "3", name: "Smart Watch Series 5", price: 2499, originalPrice: 4999, rating: 4.7, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop", category: "electronics" },
  { id: "4", name: "Running Shoes Ultra", price: 1599, originalPrice: 3299, rating: 4.4, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop", category: "shoes" },
  { id: "5", name: "Travel Backpack 40L", price: 899, originalPrice: 1799, rating: 4.3, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop", category: "accessories" },
  { id: "6", name: "Polarized Sunglasses", price: 499, originalPrice: 1299, rating: 4.1, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop", category: "accessories" },
  { id: "7", name: "Denim Jacket Classic", price: 2499, originalPrice: 4499, rating: 4.6, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300&h=300&fit=crop", category: "clothing" },
  { id: "8", name: "Leather Wallet Slim", price: 799, originalPrice: 1599, rating: 4.0, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&h=300&fit=crop", category: "accessories" },
  { id: "9", name: "Kurti Set Traditional", price: 1199, originalPrice: 2499, rating: 4.5, image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=300&fit=crop", category: "clothing" },
  { id: "10", name: "Sports Shoes Pro", price: 999, originalPrice: 2199, rating: 4.3, image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop", category: "shoes" },
  { id: "11", name: "Leather Handbag", price: 1499, originalPrice: 2999, rating: 4.4, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop", category: "accessories" },
  { id: "12", name: "Silk Saree Elegant", price: 1899, originalPrice: 3999, rating: 4.8, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop", category: "clothing" },
  { id: "13", name: "Bluetooth Speaker Mini", price: 699, originalPrice: 1499, rating: 4.2, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop", category: "electronics" },
  { id: "14", name: "Yoga Mat Premium", price: 599, originalPrice: 1299, rating: 4.1, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop", category: "accessories" },
  { id: "15", name: "Formal Shirt Slim Fit", price: 699, originalPrice: 1399, rating: 4.0, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop", category: "clothing" },
  { id: "16", name: "Wireless Earbuds Pro", price: 899, originalPrice: 1999, rating: 4.6, image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=300&h=300&fit=crop", category: "electronics" },
  { id: "17", name: "Ceramic Coffee Mug Set", price: 449, originalPrice: 899, rating: 4.3, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop", category: "home" },
  { id: "18", name: "Face Wash Premium", price: 299, originalPrice: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300&h=300&fit=crop", category: "beauty" },
];

const RECENT_SEARCHES = ["Shoes", "Watch", "Headphones", "Saree", "T-Shirt", "Bottle", "Bag"];

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "link">("search");
  const [linkUrl, setLinkUrl] = useState("");

  const filteredProducts = useMemo(() => {
    if (!query) return ALL_PRODUCTS;
    const q = query.toLowerCase();
    return ALL_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [query]);

  const handleFetchLink = () => {
    if (!linkUrl) return;
    // In production, this would call an API to fetch product details from the URL
    setLinkUrl("");
    navigate("/dashboard/cart");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold">Search</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Search/Link Toggle */}
        <div className="flex gap-2 p-1 bg-[#2a2a2a] rounded-xl">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "search"
                ? "bg-[var(--meesho-pink)] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          <button
            onClick={() => setActiveTab("link")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "link"
                ? "bg-[var(--meesho-pink)] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Link className="h-4 w-4" />
            By Link
          </button>
        </div>

        {/* Search Input */}
        {activeTab === "search" && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        )}

        {/* Link Input */}
        {activeTab === "link" && (
          <div className="flex gap-2">
            <Input
              placeholder="Paste product link..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleFetchLink}
              disabled={!linkUrl}
              className="bg-[var(--meesho-pink)] hover:bg-[var(--meesho-pink)]/90 text-white"
            >
              Fetch
            </Button>
          </div>
        )}

        {/* Trending Tags */}
        {!query && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { label: "Trending", icon: "🔥", color: "bg-orange-500/20 text-orange-400" },
              { label: "Deals", icon: "🏷️", color: "bg-red-500/20 text-red-400" },
              { label: "New", icon: "✨", color: "bg-purple-500/20 text-purple-400" },
              { label: "Sarees", icon: "👘", color: "bg-pink-500/20 text-pink-400" },
            ].map((tag) => (
              <button
                key={tag.label}
                onClick={() => setQuery(tag.label)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${tag.color}`}
              >
                {tag.icon} {tag.label}
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {!query && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">Recent searches</p>
              <button className="text-xs text-red-400 hover:text-red-300">🗑️ Clear</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {RECENT_SEARCHES.map((item) => (
                <button
                  key={item}
                  onClick={() => setQuery(item)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#2a2a2a] text-sm text-gray-300 hover:bg-[#3a3a3a] transition-colors"
                >
                  🕐 {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <p className="text-sm text-gray-400 mb-3">
            {query
              ? `${filteredProducts.length} results for "${query}"`
              : `All Products (${filteredProducts.length})`}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => navigate(`/dashboard/product/${product.id}`)}
                className="bg-[#2a2a2a] rounded-xl overflow-hidden text-left hover:bg-[#3a3a3a] transition-colors"
              >
                <div className="aspect-square bg-[#1a1a1a]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-white line-clamp-2">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-white">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs text-gray-400">{product.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

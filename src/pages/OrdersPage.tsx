import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "placed" | "shipped" | "delivered" | "cancelled";

const MOCK_ORDERS: any[] = [];

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Ordered", value: "placed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  placed: { label: "Ordered", color: "text-blue-400 bg-blue-500/20", icon: Clock },
  shipped: { label: "Shipped", color: "text-purple-400 bg-purple-500/20", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-400 bg-green-500/20", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-500/20", icon: XCircle },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredOrders = MOCK_ORDERS.filter(
    (order) => activeFilter === "all" || order.status === activeFilter,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold">My Orders</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeFilter === filter.value
                  ? "bg-[var(--meesho-pink)] text-white"
                  : "bg-[#2a2a2a] text-gray-400 hover:text-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-white">No orders yet</p>
          <p className="text-sm text-gray-400 mt-1">Start shopping to see your orders here</p>
          <Button
            onClick={() => navigate("/dashboard/search")}
            className="mt-6 bg-[var(--meesho-pink)] hover:bg-[var(--meesho-pink)]/90 text-white"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import React, { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import "./index.css";

// Lazy load route components
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const DashboardHome = lazy(() => import("./pages/DashboardHome.tsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.tsx"));
const ProductPage = lazy(() => import("./pages/ProductPage.tsx"));
const CartPage = lazy(() => import("./pages/CartPage.tsx"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage.tsx"));
const OrdersPage = lazy(() => import("./pages/OrdersPage.tsx"));
const AccountPage = lazy(() => import("./pages/AccountPage.tsx"));
const AddressesPage = lazy(() => import("./pages/AddressesPage.tsx"));
const OfferHuntPage = lazy(() => import("./pages/OfferHuntPage.tsx"));
const AddAccountPage = lazy(() => import("./pages/AddAccountPage.tsx"));
const ReferPage = lazy(() => import("./pages/ReferPage.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
    </div>
  );
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Unknown error" };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md text-center">
            <p className="text-sm font-semibold text-foreground">Something went wrong</p>
            <p className="mt-2 text-xs text-muted-foreground">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-xs text-[var(--meesho-pink)] underline"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/auth"
              element={<AuthPage redirectAfterAuth="/dashboard" />}
            />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="home" element={<DashboardHome />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="product/:productId" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
              <Route path="orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="refer" element={<RequireAuth><ReferPage /></RequireAuth>} />
              <Route path="account" element={<RequireAuth><AccountPage /></RequireAuth>} />
              <Route path="offer-hunt" element={<RequireAuth><OfferHuntPage /></RequireAuth>} />
              <Route path="add-account" element={<RequireAuth><AddAccountPage /></RequireAuth>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </RootErrorBoundary>
  </StrictMode>,
);

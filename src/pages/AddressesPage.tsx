import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, MapPin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  pinCode: string;
  city: string;
  state: string;
  houseNumber: string;
  area: string;
  landmark: string;
  label: "home" | "work" | "other";
  isDefault: boolean;
}

const MOCK_ADDRESSES: Address[] = [
  {
    id: "addr_1",
    fullName: "Rahul Kumar",
    phone: "9876543210",
    pinCode: "110001",
    city: "New Delhi",
    state: "Delhi",
    houseNumber: "123, Main Street",
    area: "Sector 15",
    landmark: "Near Park",
    label: "home",
    isDefault: true,
  },
];

function loadAddresses(): Address[] {
  try {
    const raw = localStorage.getItem("shop_addresses");
    if (raw) return JSON.parse(raw);
  } catch {}
  return MOCK_ADDRESSES;
}

function saveAddresses(addrs: Address[]) {
  localStorage.setItem("shop_addresses", JSON.stringify(addrs));
}

export default function AddressesPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>(loadAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    pinCode: "",
    city: "",
    state: "",
    houseNumber: "",
    area: "",
    landmark: "",
    label: "home" as "home" | "work" | "other",
  });

  useEffect(() => {
    saveAddresses(addresses);
  }, [addresses]);

  const handleSubmit = () => {
    if (!form.fullName || !form.phone || !form.pinCode || !form.city || !form.state || !form.houseNumber || !form.area) {
      toast.error("Please fill all required fields");
      return;
    }

    const newAddr: Address = {
      ...form,
      id: `addr_${Date.now()}`,
      isDefault: addresses.length === 0,
    };

    setAddresses((prev) => [...prev, newAddr]);
    setShowForm(false);
    setForm({ fullName: "", phone: "", pinCode: "", city: "", state: "", houseNumber: "", area: "", landmark: "", label: "home" });
    toast.success("Address added!");
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/10">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="ml-4 text-lg font-bold">My Addresses</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-[var(--meesho-pink)]/50 text-[var(--meesho-pink)] hover:bg-[var(--meesho-pink)]/10 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add New Address</span>
        </button>

        {showForm && (
          <div className="bg-[#2a2a2a] rounded-xl p-4 border border-white/10 space-y-3">
            <h3 className="text-sm font-semibold text-white">New Address</h3>
            <Input placeholder="Full Name *" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />
            <Input placeholder="Phone Number *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="PIN Code *" value={form.pinCode} onChange={(e) => setForm({ ...form, pinCode: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />
              <Input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />
            </div>
            <Input placeholder="State *" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />
            <Input placeholder="House/Flat Number *" value={form.houseNumber} onChange={(e) => setForm({ ...form, houseNumber: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />
            <Input placeholder="Area/Street *" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />
            <Input placeholder="Landmark (optional)" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} className="bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500" />

            <div className="flex gap-2">
              {(["home", "work", "other"] as const).map((label) => (
                <button
                  key={label}
                  onClick={() => setForm({ ...form, label })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                    form.label === label ? "bg-[var(--meesho-pink)] text-white" : "bg-[#1a1a1a] text-gray-400 hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 border-white/20 text-gray-400">Cancel</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-[var(--meesho-pink)] hover:bg-[var(--meesho-pink)]/90 text-white">Save Address</Button>
            </div>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No saved addresses</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className={cn("bg-[#2a2a2a] rounded-xl p-4 border", addr.isDefault ? "border-[var(--meesho-pink)]/50" : "border-white/10")}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{addr.fullName}</p>
                    <span className="text-xs bg-[var(--meesho-pink)]/20 text-[var(--meesho-pink)] px-2 py-0.5 rounded uppercase">{addr.label}</span>
                  </div>
                  {addr.isDefault && <span className="text-xs text-[var(--meesho-green)]">★ Default</span>}
                </div>
                <p className="text-xs text-gray-400 mt-2">{addr.houseNumber}, {addr.area}, {addr.city} - {addr.pinCode}</p>
                <p className="text-xs text-gray-500 mt-1">📞 {addr.phone}</p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                  <Button onClick={() => handleDelete(addr.id)} variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

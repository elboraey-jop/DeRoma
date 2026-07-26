"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, Package, User, MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("Farida Ahmed");
  const [email, setEmail] = useState("farida.ahmed@example.com");

  useEffect(() => {
    // Re-verify login status
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    // Set custom storage values if present
    const savedName = localStorage.getItem("customerName");
    const savedEmail = localStorage.getItem("customerEmail");
    if (savedName) setName(savedName);
    if (savedEmail) setEmail(savedEmail);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("customerName");
    localStorage.removeItem("customerEmail");
    
    // Notify navbar to refresh dynamically
    window.dispatchEvent(new Event("auth-change"));
    
    router.push("/");
  };

  const mockOrders = [
    {
      id: "DR-9082",
      date: "2026-07-21",
      product: "Nike Air Zoom Runner",
      category: "Running & Gym",
      size: "38",
      color: "White / Coral Pink",
      price: 4500,
      status: "In Transit",
      statusColor: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      id: "DR-8924",
      date: "2026-07-15",
      product: "New Balance 530 Retro",
      category: "Classic & Retro",
      size: "37.5",
      color: "Grey / Silver",
      price: 3200,
      status: "Delivered",
      statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit py-12 px-4 sm:px-6 lg:px-8" dir="ltr">
      <div className="max-w-[1000px] mx-auto space-y-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#942E3A] hover:text-[#942E3A] transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-[#942E3A]/40 hover:bg-[#FFF9EB]/40 px-4 py-2 text-xs font-bold text-[#942E3A] hover:text-[#942E3A] transition-all w-fit"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Heading */}
        <section className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#942E3A]">My Dashboard</span>
          <h1 className="text-3xl sm:text-4xl font-black font-playfair tracking-tight text-[#942E3A]">
            Welcome back, {name.split(" ")[0]}!
          </h1>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Account details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#FFF9EB]/20 border border-[#942E3A]/30 rounded-3xl p-6 shadow-xs space-y-5">
              <h2 className="text-lg font-bold font-playfair border-b border-[#942E3A]/20 pb-3 flex items-center gap-2">
                <User className="w-4.5 h-4.5 text-[#942E3A]" />
                <span>Account Info</span>
              </h2>

              <div className="space-y-4 text-xs">
                
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Full Name</p>
                    <p className="font-semibold text-sm mt-0.5">{name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Email Address</p>
                    <p className="font-semibold text-sm mt-0.5">{email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Contact Phone</p>
                    <p className="font-semibold text-sm mt-0.5">+20 102 345 6789</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#942E3A] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Default Shipping Address</p>
                    <p className="font-semibold leading-relaxed mt-0.5">12 El-Galaa St, Mansoura, Egypt</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#FFF9EB]/20 border border-[#942E3A]/30 rounded-3xl p-6 shadow-xs space-y-5">
              <h2 className="text-lg font-bold font-playfair border-b border-[#942E3A]/20 pb-3 flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-[#942E3A]" />
                <span>My Orders</span>
              </h2>

              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="bg-white border border-[#942E3A]/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#942E3A]">{order.product}</span>
                        <span className="text-[10px] font-bold text-stone-500 uppercase">({order.category})</span>
                      </div>
                      <div className="text-[11px] text-[#6B1F2A]/80 space-x-3">
                        <span><strong>Size:</strong> {order.size}</span>
                        <span>•</span>
                        <span><strong>Color:</strong> {order.color}</span>
                        <span>•</span>
                        <span><strong>Total:</strong> {order.price} EGP</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-stone-500">
                        <Clock className="w-3 h-3" />
                        <span>Order Date: {order.date}</span>
                        <span>•</span>
                        <span className="font-bold">ID: {order.id}</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${order.statusColor}`}>
                        {order.status}
                      </span>
                      {order.status === "In Transit" && (
                        <Link
                          href={`/track?order=${order.id}`}
                          className="text-[10px] font-bold text-[#942E3A] hover:underline"
                        >
                          Track Shipment &rarr;
                        </Link>
                      )}
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

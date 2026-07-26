"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !fullName) {
      setError("Please enter your full name.");
      return;
    }
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate auth request delay
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("isLoggedIn", "true");
      
      // Set customer info
      const nameToSave = isRegister ? fullName : (localStorage.getItem("customerName") || "Farida Ahmed");
      localStorage.setItem("customerName", nameToSave);
      localStorage.setItem("customerEmail", email);
      
      // Dispatch event to update navbar instantly
      window.dispatchEvent(new Event("auth-change"));
      
      router.push("/profile");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EB] text-[#942E3A] font-outfit flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative" dir="ltr">
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#942E3A] hover:text-[#942E3A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <h1 className="text-4xl font-black font-playfair tracking-tight text-[#942E3A]">
          DeRoma
        </h1>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">
          Women's Premium Sneakers
        </p>
      </div>

      <motion.div 
        key={isRegister ? "register" : "login"}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-[#FFF9EB]/20 border border-[#942E3A]/30 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold font-playfair text-[#942E3A]">
               {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-stone-600 font-light">
              {isRegister ? "Sign up to start tracking orders and customizing your profile" : "Sign in to track orders and manage your profile"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name Field (Only in Register mode) */}
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#942E3A]/80 block">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#942E3A]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Farida Ahmed"
                    className="block w-full pl-9 pr-3 py-2.5 text-xs text-[#942E3A] bg-[#FFF9EB] border border-[#942E3A]/30 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#942E3A] focus:border-[#942E3A] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#942E3A]/80 block">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#942E3A]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs text-[#942E3A] bg-[#FFF9EB] border border-[#942E3A]/30 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#942E3A] focus:border-[#942E3A] transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#942E3A]/80 block">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#942E3A]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 text-xs text-[#942E3A] bg-[#FFF9EB] border border-[#942E3A]/30 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#942E3A] focus:border-[#942E3A] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-[#942E3A] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200/50 rounded-lg p-2.5 text-center">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-full border border-transparent bg-[#942E3A] hover:bg-[#942E3A] text-[#FFF9EB] text-xs font-bold shadow-md focus:outline-none transition-all active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (isRegister ? "Creating account..." : "Signing in...") : (isRegister ? "Create Account" : "Sign In")}
              </button>
            </div>

          </form>

          {/* Toggle Link */}
          <div className="text-center text-xs pt-2">
            {isRegister ? (
              <span className="text-stone-500 font-light">
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError("");
                  }}
                  className="font-bold text-[#942E3A] hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span className="text-stone-500 font-light">
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError("");
                  }}
                  className="font-bold text-[#942E3A] hover:underline"
                >
                  Register Now
                </button>
              </span>
            )}
          </div>

        </div>
      </motion.div>

    </div>
  );
}

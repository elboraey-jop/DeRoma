"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { loginAdminAction } from "@/app/admin/actions";

const initialState = { error: "" };

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#942E3A] px-4 py-10 text-[#FFF9EB]">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to storefront
        </Link>
        <div className="rounded-[2rem] border border-[#D8B46A]/35 bg-[#FFF9EB] p-6 text-[#942E3A] shadow-2xl sm:p-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8B46A]">DeRoma back office</p>
          <h1 className="mt-3 font-playfair text-3xl font-black">Welcome back</h1>
          <p className="mt-2 text-xs leading-relaxed text-[#6B1F2A]/70">Sign in to manage products, orders, stock, and your store team.</p>

          <form action={formAction} className="mt-7 space-y-4">
            <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">Admin email</span><span className="relative block"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" /><input name="email" type="email" autoComplete="email" required placeholder="admin@deroma.com" className="w-full rounded-xl border border-[#942E3A]/15 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#942E3A]" /></span></label>
            <label className="block"><span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">Password</span><span className="relative block"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D8B46A]" /><input name="password" type="password" autoComplete="current-password" required placeholder="Your password" className="w-full rounded-xl border border-[#942E3A]/15 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#942E3A]" /></span></label>
            {state.error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">{state.error}</p>}
            <button type="submit" disabled={isPending} className="w-full rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] transition-colors hover:bg-[#802832] disabled:cursor-wait disabled:opacity-60">{isPending ? "Signing in..." : "Sign in to Admin"}</button>
          </form>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, UserPlus, X } from "lucide-react";
import { createTeamMemberAction } from "@/app/admin/team/actions";

export default function AdminCreateTeamMemberModal() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] shadow-sm transition hover:bg-[#7e2732]">
        <UserPlus className="h-4 w-4 text-[#D8B46A]" /> Add team member
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1018]/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D8B46A]">Workspace access</p><h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">Add team member</h2><p className="mt-1 text-xs text-[#6B1F2A]/60">Create a new account with access to the DeRoma back office.</p></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 text-[#942E3A] hover:bg-[#942E3A]/10" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <form action={createTeamMemberAction} className="mt-6 space-y-3">
              <label className="block"><span className="field-label">Name</span><input name="name" className="admin-input" placeholder="Full name" /></label>
              <label className="block"><span className="field-label">Email *</span><input required name="email" type="email" className="admin-input" placeholder="name@deroma.com" /></label>
              <label className="block"><span className="field-label">Temporary password *</span><div className="relative"><input required name="password" type={showPassword ? "text" : "password"} minLength={8} className="admin-input pr-11" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#942E3A]/60 transition hover:bg-[#942E3A]/10 hover:text-[#942E3A]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></label>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-[#942E3A]/15 bg-white px-5 py-3 text-xs font-bold text-[#942E3A]">Cancel</button><button type="submit" className="rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB]">Create admin account</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

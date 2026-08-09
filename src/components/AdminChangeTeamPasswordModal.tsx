"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { changeTeamMemberPasswordAction } from "@/app/admin/team/actions";
import { useAdminI18n } from "@/providers/AdminI18nContext";

export default function AdminChangeTeamPasswordModal({
  memberId,
  memberName,
}: {
  memberId: string;
  memberName: string;
}) {
  const { lang, t } = useAdminI18n();
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRtl = lang === "ar";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] transition hover:bg-[#7e2732]"
      >
        <KeyRound className="h-4 w-4 text-[#D8B46A]" />
        <span>{t("team.changePassword")}</span>
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c1018]/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#D8B46A]/35 bg-[#FFFDFC] p-5 shadow-2xl sm:p-7 text-right">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D8B46A]">
                  {isRtl ? "أمان الحساب" : "Account security"}
                </p>
                <h2 className="mt-1 font-playfair text-2xl font-black text-[#942E3A]">
                  {t("team.changePassword")}
                </h2>
                <p className="mt-1 text-xs text-[#6B1F2A]/60">
                  {isRtl ? `تعيين كلمة سر جديدة للعضو ${memberName}.` : `Set a new password for ${memberName}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-[#942E3A] hover:bg-[#942E3A]/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={changeTeamMemberPasswordAction} className="mt-6 space-y-3">
              <input type="hidden" name="id" value={memberId} />
              <label className="block">
                <span className="field-label">{isRtl ? "كلمة السر الجديدة *" : "New password *"}</span>
                <div className="relative">
                  <input
                    required
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    className={`admin-input ${isRtl ? "pl-11 pr-3 text-right" : "pr-11 pl-3 text-left"}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className={`absolute top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#942E3A]/60 transition hover:bg-[#942E3A]/10 hover:text-[#942E3A] ${
                      isRtl ? "left-2" : "right-2"
                    }`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="field-label">{isRtl ? "تأكيد كلمة السر *" : "Confirm password *"}</span>
                <div className="relative">
                  <input
                    required
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    className={`admin-input ${isRtl ? "text-right" : "text-left"}`}
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[#942E3A]/15 bg-white px-5 py-3 text-xs font-bold text-[#942E3A]"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#942E3A] px-5 py-3 text-xs font-bold text-[#FFF9EB]"
                >
                  {t("common.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

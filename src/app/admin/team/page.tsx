import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ShieldCheck, UserPlus, Users } from "lucide-react";
import {
  changeAdminPasswordAction,
  createTeamMemberAction,
  removeTeamMemberAction,
} from "@/app/admin/team/actions";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const current = await requireAdmin();
  let members: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: Date;
  }> = [];
  try {
    members = await prisma.user.findMany({
      where: { role: "admin" },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, createdAt: true },
    });
  } catch (error) {
    console.warn("Unable to load team", error);
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Workspace access
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">
          Team & admins
        </h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          Create and manage the people who can operate the DeRoma back office.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">Add team member</h2>
          </div>
          <form action={createTeamMemberAction} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Name
              </span>
              <input
                name="name"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Email
              </span>
              <input
                required
                name="email"
                type="email"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Temporary password
              </span>
              <input
                required
                name="password"
                type="password"
                minLength={8}
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB]"
            >
              Create admin account
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">Admin access</h2>
          </div>
          <div className="mt-5 space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-[#942E3A]/10 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#942E3A] text-xs font-bold text-[#FFF9EB]">
                    {(member.name || member.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#942E3A]">
                      {member.name || "Unnamed admin"}
                      {member.id === current.id && (
                        <span className="ml-2 rounded-full bg-[#fff7df] px-2 py-1 text-[9px] text-[#942E3A]">
                          You
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-[#6B1F2A]/60">
                      {member.email}
                    </p>
                  </div>
                </div>
                <form action={removeTeamMemberAction}>
                  <input type="hidden" name="id" value={member.id} />
                  <button
                    type="submit"
                    disabled={member.id === current.id}
                    className="text-left text-[10px] font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Remove access
                  </button>
                </form>
              </div>
            ))}
            {members.length === 0 && (
              <p className="py-10 text-center text-xs text-[#6B1F2A]/60">
                No admin accounts found.
              </p>
            )}
            <div className="flex items-start gap-2 rounded-xl bg-[#FFF9EB] p-3 text-[10px] leading-relaxed text-[#6B1F2A]/70">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#D8B46A]" />
              Passwords are hashed before storage. Use the secure form below to
              change your own password.
            </div>
          </div>
        </section>
      </div>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold">
            Change my password
          </h2>
        </div>
        <form
          action={changeAdminPasswordAction}
          className="mt-5 grid gap-3 sm:grid-cols-3"
        >
          <label>
            <span className="field-label">Current password</span>
            <input
              required
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              className="admin-input"
            />
          </label>
          <label>
            <span className="field-label">New password</span>
            <input
              required
              name="newPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              className="admin-input"
            />
          </label>
          <label>
            <span className="field-label">Confirm password</span>
            <input
              required
              name="confirmPassword"
              type="password"
              minLength={8}
              autoComplete="new-password"
              className="admin-input"
            />
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB] sm:col-start-3"
          >
            Update password
          </button>
        </form>
      </section>
    </div>
  );
}

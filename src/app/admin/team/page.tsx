import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ArrowRight, CalendarDays, ShieldCheck, Users, UserRoundPlus } from "lucide-react";
import AdminCreateTeamMemberModal from "@/components/AdminCreateTeamMemberModal";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const current = await requireAdmin();
  const members = await prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  });
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const joinedThisMonth = members.filter((member) => member.createdAt >= thisMonth).length;
  const owner = members[0];

  const statCards = [
    { label: "Total accounts", mobileLabel: "Total", value: members.length, icon: Users },
    { label: "Active access", mobileLabel: "Active", value: members.length, icon: ShieldCheck },
    { label: "Joined this month", mobileLabel: "This month", value: joinedThisMonth, icon: CalendarDays },
    { label: "Workspace owner", mobileLabel: "Owner", value: owner ? "1" : "0", icon: UserRoundPlus },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Workspace access
          </p>
          <h1 className="mt-0.5 sm:mt-1 font-playfair text-2xl sm:text-3xl font-black text-[#942E3A]">
            Team & admins
          </h1>
          <p className="mt-1 hidden sm:block text-xs text-[#6B1F2A]/65 max-w-xl">
            A clear overview of the people who can operate the DeRoma back office.
          </p>
        </div>

        <AdminCreateTeamMemberModal />
      </div>

      {/* Summary Stat Cards - 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        {statCards.map(({ label, mobileLabel, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl sm:rounded-3xl border border-[#942E3A]/10 bg-white p-3 sm:p-5 shadow-xs min-w-0"
          >
            <div className="flex items-center justify-between gap-1">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B1F2A]/55 truncate">
                <span className="sm:hidden">{mobileLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </p>
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D8B46A] shrink-0" />
            </div>
            <p className="mt-1 sm:mt-3 font-playfair text-xl sm:text-3xl font-black text-[#942E3A]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Team Members List */}
      <section className="rounded-2xl sm:rounded-3xl border border-[#942E3A]/10 bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-[#942E3A]/10 pb-3 sm:pb-4">
          <div>
            <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#942E3A]">Team members</h2>
            <p className="mt-0.5 hidden sm:block text-xs text-[#6B1F2A]/60">
              Select an account to view its details and security controls.
            </p>
          </div>
          <span className="rounded-full bg-[#FFF9EB] px-2.5 py-1 text-[10px] font-bold text-[#942E3A] border border-[#D8B46A]/30 shrink-0">
            {members.length} accounts
          </span>
        </div>

        <div className="mt-3 sm:mt-5 grid gap-2.5 sm:gap-3 lg:grid-cols-2">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/admin/team/${member.id}`}
              className="group flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-[#942E3A]/10 p-3 sm:p-4 transition hover:-translate-y-0.5 hover:border-[#D8B46A]/60 hover:shadow-md bg-[#FFF9EB]/30"
            >
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#942E3A] font-playfair text-sm sm:text-lg font-bold text-[#FFF9EB]">
                  {(member.name || member.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="truncate text-xs sm:text-sm font-bold text-[#942E3A]">
                      {member.name || "Unnamed admin"}
                    </p>
                    {member.id === current.id && (
                      <span className="rounded-full bg-[#fff7df] border border-[#D8B46A]/30 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold text-[#942E3A] shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[10px] sm:text-[11px] text-[#6B1F2A]/60">{member.email}</p>
                  <p className="mt-0.5 text-[9px] sm:text-[10px] text-[#6B1F2A]/45">
                    Added {member.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[#D8B46A] transition group-hover:translate-x-1" />
            </Link>
          ))}
          {members.length === 0 && (
            <div className="py-10 text-center text-xs text-[#6B1F2A]/60 lg:col-span-2">
              No admin accounts found.
            </div>
          )}
        </div>
      </section>

      {/* Security info banner */}
      <div className="flex items-start gap-2 rounded-xl sm:rounded-2xl bg-[#FFF9EB] p-3 sm:p-4 text-[10px] sm:text-[11px] leading-relaxed text-[#6B1F2A]/70 border border-[#D8B46A]/20">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#D8B46A] mt-0.5" />
        <p>
          Passwords are hashed before storage. Account-level security controls are available inside each admin profile.
        </p>
      </div>
    </div>
  );
}

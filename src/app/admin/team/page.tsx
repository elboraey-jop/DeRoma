import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { ArrowRight, CalendarDays, ShieldCheck, Users, UserRoundPlus } from "lucide-react";
import AdminCreateTeamMemberModal from "@/components/AdminCreateTeamMemberModal";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const current = await requireAdmin();
  const members = await prisma.user.findMany({ where: { role: "admin" }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } });
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
  const joinedThisMonth = members.filter((member) => member.createdAt >= thisMonth).length;
  const owner = members[0];
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Workspace access</p><h1 className="mt-1 font-playfair text-3xl font-black">Team & admins</h1><p className="mt-1 text-xs text-[#6B1F2A]/65">A clear overview of the people who can operate the DeRoma back office.</p></div><AdminCreateTeamMemberModal /></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[{ label: "Total accounts", value: members.length, icon: Users }, { label: "Active access", value: members.length, icon: ShieldCheck }, { label: "Joined this month", value: joinedThisMonth, icon: CalendarDays }, { label: "Workspace owner", value: owner ? "1" : "0", icon: UserRoundPlus }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B1F2A]/55">{label}</p><Icon className="h-4 w-4 text-[#D8B46A]" /></div><p className="mt-3 font-playfair text-3xl font-black text-[#942E3A]">{value}</p></div>)}
    </div>
    <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="font-playfair text-xl font-bold">Team members</h2><p className="mt-1 text-xs text-[#6B1F2A]/60">Select an account to view its details and security controls.</p></div><span className="rounded-full bg-[#FFF9EB] px-3 py-1.5 text-[10px] font-bold text-[#942E3A]">{members.length} accounts</span></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{members.map((member) => <Link key={member.id} href={`/admin/team/${member.id}`} className="group flex items-center justify-between gap-3 rounded-2xl border border-[#942E3A]/10 p-4 transition hover:-translate-y-0.5 hover:border-[#D8B46A]/60 hover:shadow-md"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#942E3A] font-playfair text-lg font-bold text-[#FFF9EB]">{(member.name || member.email).slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#942E3A]">{member.name || "Unnamed admin"}{member.id === current.id && <span className="ml-2 rounded-full bg-[#fff7df] px-2 py-1 text-[9px] text-[#942E3A]">You</span>}</p><p className="truncate text-[11px] text-[#6B1F2A]/60">{member.email}</p><p className="mt-1 text-[10px] text-[#6B1F2A]/45">Added {member.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</p></div></div><ArrowRight className="h-4 w-4 shrink-0 text-[#D8B46A] transition group-hover:translate-x-1" /></Link>)}{members.length === 0 && <div className="py-12 text-center text-xs text-[#6B1F2A]/60 lg:col-span-2">No admin accounts found.</div>}</div></section>
    <div className="flex items-start gap-2 rounded-2xl bg-[#FFF9EB] p-4 text-[11px] leading-relaxed text-[#6B1F2A]/70"><ShieldCheck className="h-4 w-4 shrink-0 text-[#D8B46A]" /><p>Passwords are hashed before storage. Account-level security controls are available inside each admin profile.</p></div>
  </div>;
}

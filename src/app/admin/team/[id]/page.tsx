import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Mail, ShieldCheck, UserRound } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminChangeTeamPasswordModal from "@/components/AdminChangeTeamPasswordModal";

export const dynamic = "force-dynamic";

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const member = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true } });
  if (!member || member.role !== "admin") notFound();
  const displayName = member.name || "Unnamed admin";
  return <div className="space-y-6"><div className="flex items-center gap-3"><Link href="/admin/team" className="rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A] transition hover:border-[#D8B46A]" aria-label="Back to team"><ArrowLeft className="h-4 w-4" /></Link><div><p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">Team account</p><h1 className="mt-1 font-playfair text-3xl font-black">{displayName}</h1><p className="mt-1 text-xs text-[#6B1F2A]/65">Review account details and manage access security.</p></div></div>
    <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#942E3A] font-playfair text-2xl font-bold text-[#FFF9EB]">{(member.name || member.email).slice(0, 1).toUpperCase()}</div><div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf7ef] px-2.5 py-1 text-[10px] font-bold text-[#257348]"><ShieldCheck className="h-3.5 w-3.5" /> Active admin</span><h2 className="mt-2 font-playfair text-2xl font-bold text-[#942E3A]">{displayName}</h2><p className="mt-1 text-xs text-[#6B1F2A]/60">{member.email}</p></div></div><AdminChangeTeamPasswordModal memberId={member.id} memberName={displayName} /></div><div className="mt-7 grid gap-3 border-t border-[#942E3A]/10 pt-5 sm:grid-cols-2"><div className="rounded-2xl bg-[#FFF9EB] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55"><Mail className="h-3.5 w-3.5 text-[#D8B46A]" /> Email address</p><p className="mt-2 text-sm font-semibold text-[#942E3A]">{member.email}</p></div><div className="rounded-2xl bg-[#FFF9EB] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55"><UserRound className="h-3.5 w-3.5 text-[#D8B46A]" /> Access role</p><p className="mt-2 text-sm font-semibold capitalize text-[#942E3A]">{member.role}</p></div><div className="rounded-2xl bg-[#FFF9EB] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55"><CalendarDays className="h-3.5 w-3.5 text-[#D8B46A]" /> Account created</p><p className="mt-2 text-sm font-semibold text-[#942E3A]">{member.createdAt.toLocaleDateString("en-US", { dateStyle: "long" })}</p></div><div className="rounded-2xl bg-[#FFF9EB] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55"><CalendarDays className="h-3.5 w-3.5 text-[#D8B46A]" /> Last updated</p><p className="mt-2 text-sm font-semibold text-[#942E3A]">{member.updatedAt.toLocaleDateString("en-US", { dateStyle: "long" })}</p></div></div></section>
  </div>;
}

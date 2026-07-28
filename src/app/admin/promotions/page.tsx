import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { Megaphone, Percent, Plus, Trash2 } from "lucide-react";
import {
  createAnnouncementAction,
  createPromotionAction,
  deletePromotionAction,
  togglePromotionAction,
} from "@/app/admin/promotions/actions";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  await requireAdmin();
  let promotions: Awaited<ReturnType<typeof prisma.promotion.findMany>> = [];
  let announcement: Awaited<
    ReturnType<typeof prisma.announcementBar.findFirst>
  > = null;
  try {
    [promotions, announcement] = await Promise.all([
      prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.announcementBar.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);
  } catch (error) {
    console.warn("Unable to load promotions", error);
  }
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
          Growth tools
        </p>
        <h1 className="mt-1 font-playfair text-3xl font-black">
          Promotions & announcements
        </h1>
        <p className="mt-1 text-xs text-[#6B1F2A]/65">
          Create coupon codes, targeted discounts, free-shipping rules, and
          storefront announcement bars.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">New promotion</h2>
          </div>
          <form action={createPromotionAction} className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Name
                </span>
                <input
                  required
                  name="name"
                  placeholder="Summer offer"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Code
                </span>
                <input
                  name="code"
                  placeholder="SUMMER20"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs uppercase outline-none"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Discount type
                </span>
                <select
                  name="type"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                  <option value="free_shipping">Free shipping</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Value
                </span>
                <input
                  name="value"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue="0"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Applies to
                </span>
                <select
                  name="scope"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
                >
                  <option value="order">Entire order</option>
                  <option value="category">Category</option>
                  <option value="product">Product</option>
                  <option value="color">Color</option>
                  <option value="material">Material</option>
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                  Target value
                </span>
                <input
                  name="targetValue"
                  placeholder="Optional"
                  className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide">
                Minimum order value
              </span>
              <input
                name="minimumOrderValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="Optional"
                className="w-full rounded-xl border border-[#942E3A]/15 bg-[#FFF9EB]/50 px-3 py-3 text-xs outline-none"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label>
                <span className="field-label">Usage limit</span>
                <input
                  name="usageLimit"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Unlimited"
                  className="admin-input"
                />
              </label>
              <label>
                <span className="field-label">Starts at</span>
                <input
                  name="startsAt"
                  type="datetime-local"
                  className="admin-input"
                />
              </label>
              <label>
                <span className="field-label">Ends at</span>
                <input
                  name="endsAt"
                  type="datetime-local"
                  className="admin-input"
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB]"
            >
              Save promotion
            </button>
          </form>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-[#D8B46A]" />
            <h2 className="font-playfair text-xl font-bold">
              Promotion library
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {promotions.map((promotion) => (
              <div
                key={promotion.id}
                className="rounded-2xl border border-[#942E3A]/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-playfair text-lg font-bold">
                      {promotion.name}
                    </h3>
                    <p className="mt-1 text-[10px] text-[#6B1F2A]/65">
                      {promotion.code || "No code"} · {promotion.scope}
                    </p>
                  </div>
                  <form action={togglePromotionAction}>
                    <input type="hidden" name="id" value={promotion.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={String(promotion.active)}
                    />
                    <button
                      type="submit"
                      className={`rounded-full px-2 py-1 text-[9px] font-bold ${promotion.active ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}
                    >
                      {promotion.active ? "Active" : "Paused"}
                    </button>
                  </form>
                </div>
                <p className="mt-3 text-xs font-bold text-[#942E3A]">
                  {promotion.type === "percentage"
                    ? `${promotion.value}% off`
                    : promotion.type === "fixed"
                      ? `${promotion.value} EGP off`
                      : "Free shipping"}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 text-[9px] text-[#6B1F2A]/55">
                  <span>
                    {promotion.usedCount}
                    {promotion.usageLimit
                      ? ` / ${promotion.usageLimit}`
                      : ""}{" "}
                    uses
                    {promotion.endsAt
                      ? ` · Ends ${promotion.endsAt.toLocaleDateString("en-US")}`
                      : ""}
                  </span>
                  <form action={deletePromotionAction}>
                    <input type="hidden" name="id" value={promotion.id} />
                    <button
                      type="submit"
                      aria-label={`Delete ${promotion.name}`}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {promotions.length === 0 && (
              <p className="rounded-2xl bg-[#FFF9EB] p-6 text-center text-xs text-[#6B1F2A]/60">
                No promotions yet.
              </p>
            )}
          </div>
        </section>
      </div>
      <section className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-[#942E3A]" />
          <div>
            <h2 className="font-playfair text-xl font-bold">
              Announcement bar
            </h2>
            <p className="text-[10px] text-[#6B1F2A]/65">
              Only one announcement is active at a time.
            </p>
          </div>
        </div>
        <form
          action={createAnnouncementAction}
          className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto]"
        >
          <input
            name="text"
            required
            defaultValue={announcement?.text || ""}
            placeholder="Free shipping on orders over 2500 EGP"
            className="rounded-xl border border-[#942E3A]/15 bg-white px-3 py-3 text-xs outline-none"
          />
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-bold">
            BG{" "}
            <input
              name="backgroundColor"
              type="color"
              defaultValue={announcement?.backgroundColor || "#942E3A"}
              className="h-6 w-8"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-bold">
            Text{" "}
            <input
              name="textColor"
              type="color"
              defaultValue={announcement?.textColor || "#FFF9EB"}
              className="h-6 w-8"
            />
          </label>
          <label className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[10px] font-bold">
            <input
              name="moving"
              type="checkbox"
              defaultChecked={announcement?.moving || false}
            />{" "}
            Moving
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[#942E3A] px-4 py-3 text-xs font-bold text-[#FFF9EB]"
          >
            Publish
          </button>
        </form>
      </section>
    </div>
  );
}

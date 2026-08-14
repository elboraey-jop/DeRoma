import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { formatCurrency } from "@/lib/utils";
import AdminStatusSelect from "@/components/AdminStatusSelect";
import AdminBackButton from "@/components/AdminBackButton";
import AdminCopyButton from "@/components/AdminCopyButton";
import { confirmOrderPaymentAction } from "@/app/admin/orders/actions";

const statusMessages: Record<string, string> = {
  pending:
    "Hello {name}, your DeRoma order {order} has been confirmed and is being prepared.",
  pending_payment:
    "Hello {name}, your DeRoma order {order} is awaiting payment confirmation.",
  paid:
    "Hello {name}, payment for your DeRoma order {order} was received and it is being prepared.",
  confirmed:
    "Hello {name}, your DeRoma order {order} has been confirmed and is being prepared.",
  preparing:
    "Hello {name}, your DeRoma order {order} is being prepared.",
  shipped:
    "Hello {name}, your DeRoma order {order} is on its way with the courier.",
  delivered:
    "Hello {name}, your DeRoma order {order} has been delivered. Thank you for choosing DeRoma!",
  cancelled:
    "Hello {name}, we are sorry to let you know that your DeRoma order {order} was cancelled.",
};

function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 11)
    return `20${digits.slice(1)}`;
  if (digits.startsWith("20")) return digits;
  return digits;
}

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { images: true } },
        },
      },
    },
  });
  if (!order) notFound();
  const whatsappText = (order.status === "pending_payment" && order.paymentMethod !== "cod"
    ? `Hello ${order.customerName}, please send the transfer screenshot for your DeRoma order ${order.orderNumber} here.`
    : statusMessages[order.status] || statusMessages.pending)
    .replace("{name}", order.customerName)
    .replace("{order}", order.orderNumber);
  const whatsappHref = `https://wa.me/${whatsappNumber(order.customerPhone)}?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="mx-auto max-w-5xl space-y-5 print:max-w-none">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <AdminBackButton fallbackHref="/admin/orders" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
              Order details
            </p>
            <h1 className="mt-1 font-playfair text-3xl font-black">
              {order.orderNumber}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-xs font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 border-b border-[#942E3A]/10 pb-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                Customer
              </p>
              <Link href={`/admin/customers/${encodeURIComponent(order.customerPhone)}`} className="mt-1 block font-playfair text-2xl font-bold hover:underline">{order.customerName}</Link>
              <span className="mt-1 inline-flex items-center gap-1.5"><a href={`tel:${order.customerPhone}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#942E3A]"><Phone className="h-3.5 w-3.5 text-[#D8B46A]" />{order.customerPhone}</a><AdminCopyButton value={order.customerPhone} /></span>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden"><span className="text-[10px] font-bold uppercase tracking-wide text-[#6B1F2A]/55">Status</span><AdminStatusSelect orderId={order.id} status={order.status} paymentMethod={order.paymentMethod} />{order.status === "pending_payment" && order.paymentMethod !== "cod" && <form action={confirmOrderPaymentAction}><input type="hidden" name="orderId" value={order.id} /><button type="submit" className="rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-700">Confirm payment</button></form>}</div>
          </div>
          <div className="mt-5 grid gap-3 text-xs sm:grid-cols-2">
            <div className="rounded-2xl bg-[#FFF9EB] p-3">
              <p className="font-bold text-[#942E3A]">Shipping address</p>
              <p className="mt-1 text-[#6B1F2A]/75">
                {order.governorate}, {order.city}
                <br />
                {order.address}
              </p>
            </div>
            <div className="rounded-2xl bg-[#FFF9EB] p-3">
              <p className="font-bold text-[#942E3A]">Order notes</p>
              <p className="mt-1 text-[#6B1F2A]/75">
                {order.notes || "No notes added."}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="flex items-center gap-2 font-playfair text-xl font-bold">
              <ShoppingBag className="h-4 w-4 text-[#D8B46A]" /> Items
            </h3>
            <div className="mt-3 divide-y divide-[#942E3A]/10">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#942E3A]/10 bg-[#FFF9EB]">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-[#D8B46A]">
                          DeRoma
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                    <p className="text-xs font-bold text-[#942E3A]">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-[10px] text-[#6B1F2A]/65">
                      Color: {item.color} · Size: {item.size} · Qty:{" "}
                      {item.quantity}
                    </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-[#942E3A]">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="space-y-5">
          <div className="rounded-3xl border border-[#D8B46A]/35 bg-[#fff7df] p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
              Payment summary
            </p>
            <div className="mt-4 space-y-3 text-xs text-[#6B1F2A]">
              <p className="flex justify-between gap-3"><span>Payment method</span><strong className="uppercase">{order.paymentMethod === "instapay" ? "InstaPay" : order.paymentMethod === "wallet" ? "Wallet" : "COD"}</strong></p>
              {order.paymentMethod !== "cod" && <p className="flex justify-between gap-3"><span>Payment proof</span><strong className={order.paymentProofStatus === "verified" ? "text-emerald-700" : "text-amber-700"}>{order.paymentProofStatus === "verified" ? "Verified" : "Awaiting WhatsApp"}</strong></p>}
              {order.paymentSenderPhone && <p className="flex justify-between gap-3"><span>Transfer from</span><strong>{order.paymentSenderPhone}</strong></p>}
              <p className="flex justify-between gap-3">
                <span>Subtotal</span>
                <strong>{formatCurrency(Number(order.subtotalPrice))}</strong>
              </p>
              {Number(order.discountAmount) > 0 && (
                <p className="flex justify-between gap-3 text-emerald-700">
                  <span>Discount</span>
                  <strong>
                    -{formatCurrency(Number(order.discountAmount))}
                  </strong>
                </p>
              )}
              <p className="flex justify-between gap-3">
                <span>Shipping</span>
                <strong>{formatCurrency(Number(order.shippingCost))}</strong>
              </p>
              <p className="flex justify-between gap-3 border-t border-[#942E3A]/10 pt-3 text-base font-black text-[#942E3A]">
                <span>Total</span>
                <strong>{formatCurrency(Number(order.totalPrice))}</strong>
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-[#D8B46A]" />
              <div>
                <h3 className="font-playfair text-lg font-bold">Fulfillment</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#6B1F2A]/70">
                  Created {new Date(order.createdAt).toLocaleString("en-US")}.
                  Keep this reference ready for the customer.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

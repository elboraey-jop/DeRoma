import { Resend } from "resend";

interface OrderEmailItem {
  productName: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerPhone2?: string | null;
  governorate: string;
  city: string;
  address: string;
  notes?: string | null;
  subtotalPrice: number;
  shippingCost: number;
  totalPrice: number;
  paymentMethod?: string;
  paymentSenderPhone?: string | null;
  paymentProofStatus?: string;
  items: OrderEmailItem[];
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] || character);
}

function formatMoney(value: number) {
  return `EGP ${value.toLocaleString("en-EG", { maximumFractionDigits: 2 })}`;
}

function infoCard(label: string, value: string) {
  return `<td style="width:50%;padding:0 6px 12px 0;vertical-align:top"><div style="background:#FAF8FF;border:1px solid #E8E2F4;border-radius:12px;padding:13px 14px"><div style="color:#8277A8;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${label}</div><div style="color:#2D264B;font-size:13px;font-weight:700;line-height:1.55;margin-top:5px">${value}</div></div></td>`;
}

/** Sends exactly one branded email per order, addressed only to the store owner. */
export async function sendOrderOwnerEmail(order: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY;
  const ownerEmail = process.env.OWNER_EMAIL?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !ownerEmail || !fromEmail) {
    console.warn("Order email skipped: RESEND_API_KEY, OWNER_EMAIL, and RESEND_FROM_EMAIL are required.");
    return;
  }

  const itemsHtml = order.items.map((item) => `
    <tr>
      <td style="padding:16px 12px;border-bottom:1px solid #E8E2F4;color:#2D264B;font-size:14px;font-weight:700">${escapeHtml(item.productName)}</td>
      <td style="padding:16px 8px;border-bottom:1px solid #E8E2F4;color:#6B608D;text-align:center;font-size:13px">${escapeHtml(item.color || "-")}</td>
      <td style="padding:16px 8px;border-bottom:1px solid #E8E2F4;color:#6B608D;text-align:center;font-size:13px">${escapeHtml(item.size || "-")}</td>
      <td style="padding:16px 8px;border-bottom:1px solid #E8E2F4;color:#5F5598;text-align:center;font-size:14px;font-weight:800">${item.quantity}</td>
      <td style="padding:16px 12px;border-bottom:1px solid #E8E2F4;color:#2D264B;text-align:right;white-space:nowrap;font-size:13px;font-weight:700">${formatMoney(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  const emailHtml = `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New DeRoma Order</title></head>
<body style="margin:0;padding:0;background:#F8F5FF;color:#2D264B;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5FF;padding:28px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border:1px solid #E8E2F4;border-radius:22px;overflow:hidden;box-shadow:0 14px 45px rgba(95,85,152,.1)">
    <tr><td style="background:linear-gradient(135deg,#8B7CC7 0%,#796AB5 100%);background-color:#8B7CC7;padding:30px 34px 28px"><table role="presentation" width="100%"><tr>
      <td><div style="color:#D8B46A;font-size:11px;font-weight:800;letter-spacing:.28em">DEROMA</div><div style="color:#FFF9EC;font-family:Georgia,serif;font-size:28px;font-weight:700;margin-top:8px">New order received</div><div style="color:#EAE5F8;font-size:13px;margin-top:7px">A new order is waiting for your attention.</div></td>
      <td align="right" valign="top"><span style="border:1px solid rgba(216,180,106,.8);background:rgba(216,180,106,0.18);border-radius:999px;color:#FFEBBF;font-size:11px;font-weight:800;padding:8px 14px;white-space:nowrap">NEW ORDER</span></td>
    </tr></table></td></tr>
    <tr><td style="padding:26px 34px 8px"><table role="presentation" width="100%"><tr>
      <td><div style="color:#8277A8;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Order number</div><div style="color:#5F5598;font-size:22px;font-weight:800;margin-top:5px">#${escapeHtml(order.orderNumber)}</div></td>
      <td align="right"><div style="color:#8277A8;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Payment</div><div style="color:#2D264B;font-size:14px;font-weight:700;margin-top:7px">${escapeHtml(order.paymentMethod === "instapay" ? "InstaPay" : order.paymentMethod === "wallet" ? "Mobile Wallet" : "Cash on delivery")}</div></td>
    </tr></table></td></tr>
    <tr><td style="padding:20px 34px 6px"><div style="color:#5F5598;font-family:Georgia,serif;font-size:20px;font-weight:700">Customer details</div></td></tr>
    <tr><td style="padding:10px 28px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>${infoCard("Customer", escapeHtml(order.customerName))}${infoCard("Phone", escapeHtml(order.customerPhone))}</tr>
      <tr>${infoCard("Location", `${escapeHtml(order.city)}, ${escapeHtml(order.governorate)}`)}${infoCard("Address", escapeHtml(order.address))}</tr>
      ${order.customerPhone2 ? `<tr>${infoCard("Alternative phone", escapeHtml(order.customerPhone2))}<td></td></tr>` : ""}
    </table></td></tr>
    ${order.notes ? `<tr><td style="padding:8px 34px 14px"><div style="border:1px solid #F1E5C6;border-left:4px solid #D8B46A;background:#FFFDF7;border-radius:10px;padding:13px 15px;color:#4E4366;font-size:13px;line-height:1.6"><strong style="color:#5F5598">Order note:</strong> ${escapeHtml(order.notes)}</div></td></tr>` : ""}
    ${order.paymentSenderPhone ? `<tr><td style="padding:8px 34px 14px"><div style="border:1px solid #C8EED7;border-left:4px solid #16834A;background:#EFFCF4;border-radius:10px;padding:13px 15px;color:#27543A;font-size:13px;line-height:1.6"><strong style="color:#16834A">Transfer phone:</strong> ${escapeHtml(order.paymentSenderPhone)}</div></td></tr>` : ""}
    <tr><td style="padding:18px 34px 10px"><div style="color:#5F5598;font-family:Georgia,serif;font-size:20px;font-weight:700">Order summary</div></td></tr>
    <tr><td style="padding:8px 24px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E2F4;border-radius:14px;overflow:hidden;background:#ffffff">
      <thead><tr style="background:#F6F3FC"><th style="padding:12px;color:#8277A8;font-size:10px;text-align:left;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Product</th><th style="padding:12px 8px;color:#8277A8;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Color</th><th style="padding:12px 8px;color:#8277A8;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Size</th><th style="padding:12px 8px;color:#8277A8;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Qty</th><th style="padding:12px;color:#8277A8;font-size:10px;text-align:right;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table></td></tr>
    <tr><td style="padding:4px 34px 30px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#5F5598 0%,#4D447D 100%);background-color:#5F5598;border-radius:16px;box-shadow:0 8px 24px rgba(95,85,152,.18)">
      <tr><td style="padding:20px 22px;color:#E2DDFA;font-size:13px;line-height:2">Payment method<br>Subtotal<br>Delivery · ${escapeHtml(order.governorate)}</td><td align="right" style="padding:20px 22px;color:#FFF9EC;font-size:13px;line-height:2;white-space:nowrap;font-weight:700">${escapeHtml(order.paymentMethod === "instapay" ? "InstaPay · Pending payment" : order.paymentMethod === "wallet" ? "Wallet · Pending payment" : "Cash on delivery")}<br>${formatMoney(order.subtotalPrice)}<br>${formatMoney(order.shippingCost)}</td></tr>
      <tr><td colspan="2" style="padding:0 22px"><div style="border-top:1px solid rgba(255,255,255,.18)"></div></td></tr>
      <tr><td style="padding:15px 22px 20px;color:#D8B46A;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:.05em">Order total</td><td align="right" style="padding:15px 22px 20px;color:#FFF9EC;font-family:Georgia,serif;font-size:24px;font-weight:700;white-space:nowrap">${formatMoney(order.totalPrice)}</td></tr>
    </table></td></tr>
    <tr><td style="background:#F6F3FC;border-top:1px solid #E8E2F4;padding:19px 30px;text-align:center;color:#8277A8;font-size:11px;line-height:1.6">This notification was sent automatically to the DeRoma store owner.<br><span style="color:#5F5598;font-weight:800;letter-spacing:.2em">DEROMA</span></td></tr>
  </table>
</td></tr></table>
</body></html>`;

  try {
    await new Resend(apiKey).emails.send({
      from: fromEmail,
      to: ownerEmail,
      subject: `New DeRoma order #${order.orderNumber}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send order email to the owner via Resend:", error);
  }
}

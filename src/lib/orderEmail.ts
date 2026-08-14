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
  return `<td style="width:50%;padding:0 6px 12px 0;vertical-align:top"><div style="background:#fffaf5;border:1px solid #eee9e2;border-radius:12px;padding:13px 14px"><div style="color:#9a8586;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${label}</div><div style="color:#24191a;font-size:13px;font-weight:700;line-height:1.55;margin-top:5px">${value}</div></div></td>`;
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
      <td style="padding:16px 12px;border-bottom:1px solid #eee9e2;color:#24191a;font-size:14px;font-weight:700">${escapeHtml(item.productName)}</td>
      <td style="padding:16px 8px;border-bottom:1px solid #eee9e2;color:#76686a;text-align:center;font-size:13px">${escapeHtml(item.color || "-")}</td>
      <td style="padding:16px 8px;border-bottom:1px solid #eee9e2;color:#76686a;text-align:center;font-size:13px">${escapeHtml(item.size || "-")}</td>
      <td style="padding:16px 8px;border-bottom:1px solid #eee9e2;color:#942e3a;text-align:center;font-size:14px;font-weight:800">${item.quantity}</td>
      <td style="padding:16px 12px;border-bottom:1px solid #eee9e2;color:#24191a;text-align:right;white-space:nowrap;font-size:13px;font-weight:700">${formatMoney(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  const emailHtml = `
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New DeRoma Order</title></head>
<body style="margin:0;padding:0;background:#f4efe9;color:#24191a;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe9;padding:28px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 14px 45px rgba(72,37,31,.1)">
    <tr><td style="background:#681e2a;padding:30px 34px 28px"><table role="presentation" width="100%"><tr>
      <td><div style="color:#d8b46a;font-size:11px;font-weight:700;letter-spacing:.28em">DEROMA</div><div style="color:#fff9eb;font-family:Georgia,serif;font-size:28px;font-weight:700;margin-top:8px">New order received</div><div style="color:#f4dfe0;font-size:13px;margin-top:7px">A new order is waiting for your attention.</div></td>
      <td align="right" valign="top"><span style="border:1px solid rgba(216,180,106,.7);border-radius:999px;color:#f4dca8;font-size:11px;font-weight:700;padding:8px 12px;white-space:nowrap">NEW ORDER</span></td>
    </tr></table></td></tr>
    <tr><td style="padding:26px 34px 8px"><table role="presentation" width="100%"><tr>
      <td><div style="color:#9a8586;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Order number</div><div style="color:#681e2a;font-size:22px;font-weight:800;margin-top:5px">#${escapeHtml(order.orderNumber)}</div></td>
      <td align="right"><div style="color:#9a8586;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">Payment</div><div style="color:#24191a;font-size:14px;font-weight:700;margin-top:7px">Cash on delivery</div></td>
    </tr></table></td></tr>
    <tr><td style="padding:20px 34px 6px"><div style="color:#681e2a;font-family:Georgia,serif;font-size:20px;font-weight:700">Customer details</div></td></tr>
    <tr><td style="padding:10px 28px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>${infoCard("Customer", escapeHtml(order.customerName))}${infoCard("Phone", escapeHtml(order.customerPhone))}</tr>
      <tr>${infoCard("Location", `${escapeHtml(order.city)}, ${escapeHtml(order.governorate)}`)}${infoCard("Address", escapeHtml(order.address))}</tr>
      ${order.customerPhone2 ? `<tr>${infoCard("Alternative phone", escapeHtml(order.customerPhone2))}<td></td></tr>` : ""}
    </table></td></tr>
    ${order.notes ? `<tr><td style="padding:8px 34px 14px"><div style="border-right:3px solid #d8b46a;background:#fffaf5;border-radius:10px;padding:13px 15px;color:#59494a;font-size:13px;line-height:1.6"><strong style="color:#681e2a">Order note:</strong> ${escapeHtml(order.notes)}</div></td></tr>` : ""}
    ${order.paymentSenderPhone ? `<tr><td style="padding:8px 34px 14px"><div style="border-right:3px solid #25d366;background:#effcf4;border-radius:10px;padding:13px 15px;color:#27543a;font-size:13px;line-height:1.6"><strong style="color:#16834a">Transfer phone:</strong> ${escapeHtml(order.paymentSenderPhone)}</div></td></tr>` : ""}
    <tr><td style="padding:18px 34px 10px"><div style="color:#681e2a;font-family:Georgia,serif;font-size:20px;font-weight:700">Order summary</div></td></tr>
    <tr><td style="padding:8px 24px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee9e2;border-radius:14px;overflow:hidden">
      <thead><tr style="background:#faf5ef"><th style="padding:12px;color:#9a8586;font-size:10px;text-align:left;text-transform:uppercase;letter-spacing:.06em">Product</th><th style="padding:12px 8px;color:#9a8586;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:.06em">Color</th><th style="padding:12px 8px;color:#9a8586;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:.06em">Size</th><th style="padding:12px 8px;color:#9a8586;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:.06em">Qty</th><th style="padding:12px;color:#9a8586;font-size:10px;text-align:right;text-transform:uppercase;letter-spacing:.06em">Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table></td></tr>
    <tr><td style="padding:4px 34px 30px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#681e2a;border-radius:16px">
      <tr><td style="padding:20px 22px;color:#f4dfe0;font-size:13px;line-height:2">Payment method<br>Subtotal<br>Delivery · ${escapeHtml(order.governorate)}</td><td align="right" style="padding:20px 22px;color:#fff9eb;font-size:13px;line-height:2;white-space:nowrap">${escapeHtml(order.paymentMethod === "instapay" ? "InstaPay · Pending payment" : order.paymentMethod === "wallet" ? "Wallet · Pending payment" : "Cash on delivery")}<br>${formatMoney(order.subtotalPrice)}<br>${formatMoney(order.shippingCost)}</td></tr>
      <tr><td colspan="2" style="padding:0 22px"><div style="border-top:1px solid rgba(255,255,255,.2)"></div></td></tr>
      <tr><td style="padding:15px 22px 20px;color:#f4dca8;font-size:14px;font-weight:700">Order total</td><td align="right" style="padding:15px 22px 20px;color:#fff9eb;font-family:Georgia,serif;font-size:24px;font-weight:700;white-space:nowrap">${formatMoney(order.totalPrice)}</td></tr>
    </table></td></tr>
    <tr><td style="background:#faf5ef;padding:19px 30px;text-align:center;color:#9a8586;font-size:11px;line-height:1.6">This notification was sent automatically to the DeRoma store owner.<br><span style="color:#681e2a;font-weight:700;letter-spacing:.18em">DEROMA</span></td></tr>
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

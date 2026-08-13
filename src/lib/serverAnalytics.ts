import { createHash } from "node:crypto";

type ServerAnalyticsItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

type CustomerData = {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
};

type MetaEventInput = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  value?: number;
  currency?: string;
  orderNumber?: string;
  items?: ServerAnalyticsItem[];
  customer: CustomerData;
};

const DEFAULT_CURRENCY = "EGP";

function sha256(value?: string | null) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;

  return createHash("sha256").update(normalized).digest("hex");
}

function normalizeEgyptPhone(phone?: string | null) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "").replace(/^20/, "");
  if (!digits) return undefined;

  return digits.startsWith("01") ? `20${digits}` : digits;
}

function buildMetaUserData(customer: CustomerData) {
  const userData: Record<string, string> = {};
  const normalizedPhone = normalizeEgyptPhone(customer.phone);

  const emailHash = sha256(customer.email);
  const phoneHash = sha256(normalizedPhone);
  const firstNameHash = sha256(customer.firstName);
  const lastNameHash = sha256(customer.lastName);
  const cityHash = sha256(customer.city);
  const stateHash = sha256(customer.state);
  const countryHash = sha256(customer.country || "eg");

  if (emailHash) userData.em = emailHash;
  if (phoneHash) userData.ph = phoneHash;
  if (firstNameHash) userData.fn = firstNameHash;
  if (lastNameHash) userData.ln = lastNameHash;
  if (cityHash) userData.ct = cityHash;
  if (stateHash) userData.st = stateHash;
  if (countryHash) userData.country = countryHash;
  if (customer.clientIpAddress) userData.client_ip_address = customer.clientIpAddress;
  if (customer.clientUserAgent) userData.client_user_agent = customer.clientUserAgent;
  if (customer.fbp) userData.fbp = customer.fbp;
  if (customer.fbc) userData.fbc = customer.fbc;

  return userData;
}

export function getGoogleEnhancedConversionData(input: {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}) {
  return {
    sha256_email_address: sha256(input.email),
    sha256_phone_number: sha256(normalizeEgyptPhone(input.phone)),
    address: {
      sha256_first_name: sha256(input.firstName),
      sha256_last_name: sha256(input.lastName),
      city: input.city || undefined,
      region: input.state || undefined,
      country: input.country || "EG",
    },
  };
}

export async function sendMetaServerEvent(input: MetaEventInput) {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const apiVersion = process.env.META_GRAPH_API_VERSION || "v23.0";
  const endpoint = `https://graph.facebook.com/${apiVersion}/${pixelId}/events`;
  const contents = (input.items || []).map((item) => ({
    id: item.productId,
    quantity: item.quantity,
    item_price: item.price,
  }));

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: buildMetaUserData(input.customer),
        custom_data: {
          currency: input.currency || DEFAULT_CURRENCY,
          value: input.value,
          order_id: input.orderNumber,
          content_type: "product",
          content_ids: (input.items || []).map((item) => item.productId),
          contents,
        },
      },
    ],
  };

  if (process.env.META_CONVERSIONS_API_TEST_EVENT_CODE) {
    body.test_event_code = process.env.META_CONVERSIONS_API_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, access_token: accessToken }),
    });

    if (!response.ok) {
      console.error("Meta Conversions API error:", await response.text());
    }
  } catch (error) {
    console.error("Failed to send Meta Conversions API event:", error);
  }
}

"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerToken,
  getCustomerSession,
} from "@/lib/userAuth";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  phone2?: string;
  governorate?: string;
  city?: string;
  address?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name: string;
  phone?: string;
  phone2?: string;
  governorate?: string;
  city?: string;
  address?: string;
}

export async function registerCustomerAction(input: RegisterInput) {
  try {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();

    if (!email || !input.password || !name) {
      return { success: false, error: "Please fill in all required fields." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: "customer",
      },
    });

    if (input.phone && input.phone.trim()) {
      const cleanPhone = input.phone.trim();
      const parts = name.split(" ");
      const firstName = parts[0] || name;
      const lastName = parts.slice(1).join(" ") || "";

      await prisma.customer.upsert({
        where: { phone: cleanPhone },
        create: {
          firstName,
          lastName,
          name,
          email,
          phone: cleanPhone,
          phone2: input.phone2?.trim() || null,
          governorate: input.governorate?.trim() || "Cairo",
          city: input.city?.trim() || "Cairo",
          address: input.address?.trim() || "Default Address",
        },
        update: {
          firstName,
          lastName,
          name,
          email,
          phone2: input.phone2?.trim() || null,
          governorate: input.governorate?.trim() || undefined,
          city: input.city?.trim() || undefined,
          address: input.address?.trim() || undefined,
        },
      });
    }

    const token = createCustomerToken(user);
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error("Error in registerCustomerAction:", error);
    return { success: false, error: "Failed to register. Please try again." };
  }
}

export async function loginCustomerAction(input: LoginInput) {
  try {
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password) {
      return { success: false, error: "Please enter your email and password." };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Invalid email or password." };
    }

    const token = createCustomerToken(user);
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error("Error in loginCustomerAction:", error);
    return { success: false, error: "Failed to log in. Please try again." };
  }
}

export async function logoutCustomerAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(CUSTOMER_SESSION_COOKIE, "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return { success: true };
  } catch (error) {
    console.error("Error in logoutCustomerAction:", error);
    return { success: false };
  }
}

export async function getCustomerProfileAction() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Attempt to locate associated Customer details
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ email: user.email }, { name: user.name || undefined }],
      },
      orderBy: { updatedAt: "desc" },
    });

    // Find orders matching userId OR customer phone OR customer email
    const orderWhere: Record<string, unknown>[] = [{ userId: user.id }];
    if (customer?.phone) {
      orderWhere.push({ customerPhone: customer.phone });
    }
    if (user.email) {
      // Find orders linked via customer phone or name
      if (user.name) {
        orderWhere.push({ customerName: user.name });
      }
    }

    const rawOrders = await prisma.order.findMany({
      where: { OR: orderWhere },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    // Automatically associate unlinked orders to this userId
    const unlinkedOrderIds = rawOrders.filter((o) => !o.userId).map((o) => o.id);
    if (unlinkedOrderIds.length > 0) {
      await prisma.order.updateMany({
        where: { id: { in: unlinkedOrderIds } },
        data: { userId: user.id },
      });
    }

    const orders = rawOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      totalPrice: Number(o.totalPrice),
      shippingCost: Number(o.shippingCost),
      subtotalPrice: Number(o.subtotalPrice),
      discountAmount: Number(o.discountAmount),
      paymentMethod: o.paymentMethod,
      governorate: o.governorate,
      city: o.city,
      address: o.address,
      items: o.items.map((it) => ({
        id: it.id,
        productName: it.productName,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
        price: Number(it.price),
      })),
    }));

    return {
      success: true,
      profile: {
        id: user.id,
        name: user.name || customer?.name || "DeRoma Customer",
        email: user.email,
        phone: customer?.phone || "",
        phone2: customer?.phone2 || "",
        governorate: customer?.governorate || "",
        city: customer?.city || "",
        address: customer?.address || "",
        orders,
      },
    };
  } catch (error) {
    console.error("Error in getCustomerProfileAction:", error);
    return { success: false, error: "Failed to fetch profile" };
  }
}

export async function updateCustomerProfileAction(input: UpdateProfileInput) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const name = input.name.trim();
    if (!name) {
      return { success: false, error: "Name cannot be empty" };
    }

    const user = await prisma.user.update({
      where: { id: session.sub },
      data: { name },
    });

    if (input.phone && input.phone.trim()) {
      const cleanPhone = input.phone.trim();
      const parts = name.split(" ");
      const firstName = parts[0] || name;
      const lastName = parts.slice(1).join(" ") || "";

      await prisma.customer.upsert({
        where: { phone: cleanPhone },
        create: {
          firstName,
          lastName,
          name,
          email: user.email,
          phone: cleanPhone,
          phone2: input.phone2?.trim() || null,
          governorate: input.governorate?.trim() || "Cairo",
          city: input.city?.trim() || "Cairo",
          address: input.address?.trim() || "Default Address",
        },
        update: {
          firstName,
          lastName,
          name,
          email: user.email,
          phone2: input.phone2?.trim() || null,
          governorate: input.governorate?.trim() || undefined,
          city: input.city?.trim() || undefined,
          address: input.address?.trim() || undefined,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateCustomerProfileAction:", error);
    return { success: false, error: "Failed to update profile." };
  }
}

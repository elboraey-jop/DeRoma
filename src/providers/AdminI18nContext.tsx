"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AdminLang, adminTranslations } from "@/lib/i18n/admin/translations";

interface AdminI18nContextType {
  lang: AdminLang;
  dir: "rtl" | "ltr";
  setLang: (lang: AdminLang) => void;
  toggleLang: () => void;
  t: (path: string, fallback?: string) => string;
  formatPrice: (amount: number | string) => string;
  formatNumber: (value: number | string) => string;
  formatDate: (date: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
}

const STORAGE_KEY = "deroma_admin_lang";

// Legacy screens are translated after render while they are being migrated to
// the structured dictionary below. Keep the original DOM values so changing
// back to English restores the exact UI instead of leaving a mixed language.
const LEGACY_ORIGINAL_TEXT = new WeakMap<Text, { original: string; localized: string }>();
const LEGACY_ORIGINAL_ATTRIBUTES = new WeakMap<HTMLElement, Map<string, string | null>>();

// A small compatibility dictionary for legacy admin screens that still contain
// literal English labels instead of calling t(). It is applied only in Arabic
// mode, so the English workspace keeps its original copy.
const LEGACY_ARABIC_LABELS: Record<string, string> = {
  "Back to storefront": "العودة إلى المتجر",
  "DeRoma back office": "لوحة تحكم DeRoma",
  "Welcome back": "مرحبًا بعودتك",
  "Catalog intelligence": "إدارة الكتالوج",
  "Control center": "لوحة الإدارة",
  "Add product": "إضافة منتج",
  "Library builder": "إدارة الخيارات",
  "Add an option": "إضافة خيار",
  "Create a reusable value for this category.": "أضف قيمة يمكن استخدامها مرة أخرى داخل هذا القسم.",
  "Option group": "مجموعة الخيارات",
  "Display name": "اسم العرض",
  "Manage the values your team can select while creating products.": "أدر القيم التي يمكن لفريقك اختيارها أثناء إضافة المنتجات.",
  "Catalog connection": "المنتجات المرتبطة بهذا الخيار",
  "No products connected yet": "لا توجد منتجات مرتبطة بهذا الخيار حتى الآن",
  "Products using this option will appear here once their details match this value.": "ستظهر هنا المنتجات التي تطابق تفاصيلها هذه القيمة.",
  "Apply Range": "تطبيق الفترة",
  "Su": "الأحد",
  "Mo": "الاثنين",
  "Tu": "الثلاثاء",
  "We": "الأربعاء",
  "Th": "الخميس",
  "Fr": "الجمعة",
  "Sa": "السبت",
  "available to products": "متاحة للمنتجات",
  "options per group": "خيارات لكل مجموعة",
  "across all categories": "عبر جميع الأقسام",
  "Editing": "تعديل",
  "Option library": "مكتبة الخيارات",
  "Scope:": "النطاق:",
  "Match All System Counts": "مطابقة كل الكميات مع النظام",
  "Finalize & Apply Adjustments": "حفظ التعديلات وتطبيقها",
  "Reset": "إعادة ضبط",
  "Time": "الوقت",
  "Main image": "الصورة الرئيسية",
  "Gallery order": "ترتيب الصور",
  "Drag to reorder": "اسحب لإعادة الترتيب",
  "Choose product images": "اختر صور المنتج",
  "Add images": "إضافة صور",
  "Uploading...": "جارٍ الرفع...",
  "Product image": "صورة المنتج",
  "Remove main image": "إزالة الصورة الرئيسية",
  "Make second image main": "تعيين الصورة الثانية كرئيسية",
  "Merchandising": "تنسيق عرض المنتجات",
  "Similar products": "منتجات مشابهة",
  "Choose products to show in the related-products section.": "اختر المنتجات التي تريد عرضها في قسم المنتجات المشابهة.",
  "Save similar products": "حفظ المنتجات المشابهة",
  "Orders": "الطلبات",
  "Total Orders": "إجمالي الطلبات",
  "Revenue": "الإيرادات",
  "Total Revenue": "إجمالي الإيرادات",
  "Pending": "قيد الانتظار",
  "Pending Orders": "الطلبات قيد الانتظار",
  "Order Number": "رقم الطلب",
  "Customer": "العميل",
  "Status": "الحالة",
  "Total": "الإجمالي",
  "No orders found for this date range.": "لا توجد طلبات خلال هذه الفترة.",
  "Customer intelligence": "نظرة على العملاء",
  "A living view of customer history, repeat orders, and value.": "تابع سجل العملاء والطلبات المتكررة وقيمة كل عميل.",
  "Customers": "العملاء",
  "Repeat buyers": "العملاء العائدون للشراء",
  "Customer value": "قيمة العملاء",
  "Customer history": "سجل العملاء",
  "Phone": "الهاتف",
  "Last order": "آخر طلب",
  "Lifetime value": "إجمالي إنفاق العميل",
  "No customers yet.": "لا يوجد عملاء بعد.",
  "No orders yet": "لا توجد طلبات بعد",
  "No orders": "لا توجد طلبات",
  "Failed to load customers data.": "تعذر تحميل بيانات العملاء.",
  "Latest address": "آخر عنوان مسجل",
  "Contact shortcuts": "طرق التواصل السريع",
  "Call": "اتصال",
  "WhatsApp": "واتساب",
  "Email": "البريد الإلكتروني",
  "Order history": "سجل الطلبات",
  "Order": "الطلب",
  "Date": "التاريخ",
  "Items": "المنتجات",
  "Batch details": "تفاصيل الدفعة",
  "Existing product *": "المنتج الحالي *",
  "Quantity": "الكمية",
  "Wholesale": "سعر الجملة",
  "Selling": "سعر البيع",
  "Supplier *": "المورد *",
  "Your order is empty": "طلبك فارغ",
  "Choose a product from the dropdown above to get started.": "اختر منتجًا من القائمة أعلاه للبدء.",
  "Order summary": "ملخص الطلب",
  "Products": "المنتجات",
  "Shipping": "الشحن",
  "Discount": "الخصم",
  "Total due": "الإجمالي المستحق",
  "Inventory is reserved as soon as this order is created.": "سيتم حجز الكمية من المخزون بمجرد إنشاء الطلب.",
  "Order totals": "إجماليات الطلب",
  "Shipping fee": "رسوم الشحن",
  "Create manual order": "إنشاء طلب يدوي",
  "Optional": "اختياري",
  "Choose a product…": "اختر منتجًا…",
  "Search products...": "البحث عن المنتجات...",
  "All": "الكل",
  "Select size:": "اختر المقاس:",
  "Add to order": "إضافة إلى الطلب",
  "No products match your search.": "لم نعثر على منتجات مطابقة لبحثك.",
  "Print / Save PDF": "طباعة / حفظ PDF",
  "Explore": "استكشف",
  "By Variant": "حسب النوع والمقاس",
  "By Product": "حسب المنتج",
  "Reset Filters": "مسح الفلاتر",
  "Set Active": "تفعيل",
  "Archive": "أرشفة",
  "Product": "المنتج",
  "SKU": "رمز المنتج",
  "Variant": "المتغير",
  "Product Status": "حالة المنتج",
  "Stock Status": "حالة المخزون",
  "Stock Quantity": "كمية المخزون",
  "Select All": "تحديد الكل",
  "No inventory variants matched your search or filters.": "لم نعثر على أنواع مخزون مطابقة للبحث أو الفلاتر.",
  "Bulk Restock Variants": "إضافة مخزون لعدة أنواع",
  "Quantity to Add (+Qty)": "الكمية المراد إضافتها",
  "Apply Restock": "إضافة الكمية",
  "Cancel": "إلغاء",
  "Select Products": "اختيار المنتجات",
  "No products selected for this row": "لم تختر منتجات لهذا الصف",
  "Save": "حفظ",
  "in stock": "في المخزون",
  "items in stock": "أصناف متوفرة",
  "Est. Profit": "الربح التقديري",
  "Gross Profit": "مجمل الربح",
  "Net Profit": "صافي الربح",
  "Total Expenses": "إجمالي المصروفات",
  "Total Discounts": "إجمالي الخصومات",
  "Total Shipping": "إجمالي الشحن",
  "Total COGS": "إجمالي تكلفة البضاعة المباعة",
  "Sales": "المبيعات",
  "Profit": "الربح",
  "Loss": "الخسارة",
  "Completed Orders": "الطلبات المكتملة",
  "completed orders": "طلبات مكتملة",
  "Profit Margin": "هامش الربح",
  "After discounts": "بعد خصم العروض",
  "operating expenses": "المصروفات التشغيلية",
  "Expense": "مصروف",
  "Settlement": "تسوية",
  "Transfer": "تحويل",
  "Projections": "التوقعات",
  "Restock": "إضافة مخزون",
  "Search expenses...": "البحث في المصروفات...",
  "Search orders...": "البحث في الطلبات...",
  "This week": "هذا الأسبوع",
  "Last week": "الأسبوع الماضي",
  "This month": "هذا الشهر",
  "Custom range...": "فترة مخصصة...",
  "Select range": "اختر الفترة",
  "Select Date Range": "اختيار نطاق التاريخ",
  "January": "يناير",
  "February": "فبراير",
  "March": "مارس",
  "April": "أبريل",
  "May": "مايو",
  "June": "يونيو",
  "July": "يوليو",
  "August": "أغسطس",
  "September": "سبتمبر",
  "October": "أكتوبر",
  "November": "نوفمبر",
  "December": "ديسمبر",
  "Home Page": "الصفحة الرئيسية",
  "Contact Info": "بيانات التواصل",
  "About Us": "من نحن",
  "Add Banner": "إضافة بانر",
  "Desktop Image": "صورة سطح المكتب",
  "Mobile Image": "صورة الهاتف",
  "Change": "تغيير",
  "Click to choose image": "اضغط لاختيار صورة",
  "Phone Number": "رقم الهاتف",
  "Support Email": "بريد الدعم",
  "Operating Hours": "ساعات العمل",
  "Section Title": "عنوان القسم",
  "First Paragraph": "الفقرة الأولى",
  "Second Paragraph": "الفقرة الثانية",
  "Section Image": "صورة القسم",
  "Invoice information": "بيانات الفاتورة",
  "Supplier & invoice": "المورد والفاتورة",
  "Invoice date *": "تاريخ الفاتورة *",
  "Stock receipt": "استلام المخزون",
  "Products on this invoice": "منتجات الفاتورة",
  "Purchase total": "إجمالي الشراء",
  "Expected retail value": "قيمة البيع المتوقعة",
  "Ready to receive stock": "الفاتورة جاهزة لإضافة المخزون",
  "Save invoice & receive stock": "حفظ الفاتورة وإضافة المخزون",
  "No matching delivery zones": "لم نعثر على مناطق توصيل مطابقة",
  "Zone name": "اسم المنطقة",
  "Governorates": "المحافظات",
  "Price (EGP)": "السعر (EGP)",
  "Delivery price": "سعر التوصيل",
  "City exception": "استثناء مدينة",
  "Announcement Bar": "شريط الإعلانات",
  "Usage Limit": "الحد الأقصى للاستخدام",
  "Generate Code": "إنشاء الكود",
  "Complete Settlement": "إقفال التسوية",
  "Add New Expense": "إضافة مصروف جديد",
  "Expense Title *": "عنوان المصروف *",
  "Amount (EGP) *": "المبلغ (EGP) *",
  "Marketing & Ads": "التسويق والإعلانات",
  "Logistics & Shipping": "اللوجستيات والشحن",
  "Bags & Packaging": "الحقائب والتغليف",
  "Utilities & Services": "الخدمات والمرافق",
  "Salaries & Commissions": "الرواتب والعمولات",
  "Other Expenses": "مصروفات أخرى",
  "Additional Notes": "ملاحظات إضافية",
  "Transfer Between Accounts": "تحويل بين الحسابات",
  "From Account": "من حساب",
  "To Account": "إلى حساب",
  "Transfer Amount (EGP) *": "مبلغ التحويل (EGP) *",
  "Notes / Reason": "ملاحظات / السبب",
  "Confirm Period Settlement": "تأكيد تسوية الفترة",
  "Actions": "الإجراءات",
  "After discounts & expenses": "بعد الخصومات والمصروفات",
  "All Categories": "كل الأقسام",
  "All Profit Margins": "كل هوامش الربح",
  "Analysis of cash inflows from sales vs outflow from expenses.": "تحليل التدفقات النقدية من المبيعات مقابل المصروفات.",
  "Avg Order Value (AOV)": "متوسط قيمة الطلب",
  "Avg Profit Per Order": "متوسط ربح الطلب",
  "Cash Flow": "التدفق النقدي",
  "Cash Inflow (Sales)": "النقدية الداخلة (المبيعات)",
  "Cash on Delivery (COD)": "الدفع عند الاستلام",
  "Cash on Hand": "النقدية المتاحة",
  "Cash on Hand / Vault": "الرصيد النقدي / الخزينة",
  "Cash Outflow (COGS + Expenses)": "النقدية الخارجة (تكلفة المبيعات والمصروفات)",
  "Close period accounts and log treasury transfers.": "أقفل حسابات الفترة وسجّل التحويلات بين الحسابات.",
  "COGS Ratio %": "نسبة تكلفة البضاعة المباعة %",
  "Compare sales price against wholesale cash item costs per order.": "مقارنة سعر البيع بتكلفة شراء المنتجات لكل طلب.",
  "Current Period Sales:": "مبيعات الفترة الحالية:",
  "Deduct from Payment Account": "الخصم من حساب الدفع",
  "Estimated Replenishment Cost:": "تكلفة إعادة التوريد التقديرية:",
  "Financial Line Item": "البند المالي",
  "Forecast restock costs and future sales run-rate.": "توقع تكاليف إعادة التخزين ومعدل المبيعات المستقبلية.",
  "From completed client orders": "من طلبات العملاء المكتملة",
  "Gross Profit Margin %": "هامش الربح الإجمالي %",
  "High Profit (≥ 30%)": "ربح مرتفع (≥ 30%)",
  "Less: Cash Product Cost (COGS)": "يُخصم: تكلفة البضاعة المباعة",
  "Less: Promotional Discounts": "مطروحًا: الخصومات الترويجية",
  "Low Profit (&lt; 15%)": "ربح منخفض (< 15%)",
  "Low Profit (< 15%)": "ربح منخفض (< 15%)",
  "Date: ": "التاريخ: ",
  "Low Stock Items Count:": "عدد المنتجات منخفضة المخزون:",
  "Margin %": "الهامش %",
  "Medium Profit (15% - 29%)": "ربح متوسط (15% - 29%)",
  "Net Cash Position": "صافي الرصيد النقدي",
  "Net cash retained in store treasury": "صافي النقد الموجود في خزينة المتجر",
  "Net Profit to Close:": "صافي الربح عند الإقفال:",
  "Order Profitability": "ربحية الطلبات",
  "Payment Account": "حساب الدفع",
  "Product Cost": "تكلفة المنتج",
  "Product Cost (COGS)": "تكلفة البضاعة المباعة",
  "Product cost + operational expenses": "تكلفة المبيعات + مصروفات التشغيل",
  "Projected Monthly Run-Rate:": "المبيعات الشهرية المتوقعة:",
  "Projected Profit on Sale": "الربح المتوقع من البيع",
  "Projections & Restock": "التوقعات وإعادة التخزين",
  "Record and monitor all store operating costs.": "سجل وراقب جميع تكاليف تشغيل المتجر.",
  "Sales: ": "المبيعات: ",
  "Settlement Notes": "ملاحظات التسوية",
  "Stock Wholesale Cost (COGS)": "تكلفة المخزون بسعر الشراء",
  "Total Operating Expenses": "إجمالي مصروفات التشغيل",
  "Total Sales": "إجمالي المبيعات",
  "Total Stock Units": "إجمالي وحدات المخزون",
  "Transfer Fee / Tax (EGP)": "رسوم / ضريبة التحويل (EGP)",
  "Weekly Settlement": "التسوية الأسبوعية",
  "View Inventory Management": "عرض إدارة المخزون",
  "Action": "الإجراء",
  "Actual": "الفعلي",
  "Admin email": "بريد المسؤول",
  "Audit #": "رقم الجرد",
  "Audited By": "تم الجرد بواسطة",
  "Available Stock": "المخزون المتاح",
  "Available Stock Units": "وحدات المخزون المتاحة",
  "Category Segment": "شريحة القسم",
  "Coupon Code": "كود الخصم",
  "Create purchase invoice": "إنشاء فاتورة شراء",
  "Danger zone": "منطقة خطرة",
  "Dead Stock / Unsold Items": "المخزون الراكد / المنتجات غير المباعة",
  "Delivery Fulfillment Rate": "معدل تنفيذ التوصيل",
  "Delivery Success Rate": "معدل نجاح التوصيل",
  "Discrepancy": "الفرق",
  "Expected": "المتوقع",
  "Expected / Actual": "المتوقع / الفعلي",
  "Funnel Stage": "مرحلة مسار الشراء",
  "Governorate": "المحافظة",
  "Governorate Name": "اسم المحافظة",
  "Invoices": "الفواتير",
  "Line total": "إجمالي السطر",
  "Linked product catalog": "كتالوج المنتجات المرتبط",
  "Location": "الموقع",
  "New invoice": "فاتورة جديدة",
  "New Stock Audit": "جرد مخزون جديد",
  "No category sales recorded yet.": "لم يتم تسجيل مبيعات للأقسام بعد.",
  "No invoices for this supplier yet.": "لا توجد فواتير لهذا المورد بعد.",
  "No products linked yet.": "لا توجد منتجات مرتبطة بعد.",
  "No promo type data available.": "لا توجد بيانات لأنواع العروض.",
  "No stock audit sessions recorded yet.": "لم يتم تسجيل جلسات جرد بعد.",
  "Operational Action Required": "إجراء تشغيلي مطلوب",
  "Order ID": "معرّف الطلب",
  "Order notes": "ملاحظات الطلب",
  "Order transactions per buyer": "متوسط الطلبات لكل عميل",
  "Orders Count": "عدد الطلبات",
  "Orders Driven": "الطلبات الناتجة",
  "Orders Placed": "الطلبات المنشأة",
  "Orders Volume": "حجم الطلبات",
  "Out with couriers": "مع شركات التوصيل",
  "Payment": "الدفع",
  "Performance Metric": "مؤشر الأداء",
  "Performance Status": "حالة الأداء",
  "Physical Stock Stuck": "المخزون الراكد فعليًا",
  "Physical warehouse units": "وحدات المخزن الفعلية",
  "Pipeline Stage": "مرحلة الطلب",
  "Placed At": "تاريخ الإنشاء",
  "Procurement": "المشتريات والتوريد",
  "Procurement profile": "ملف التوريد",
  "Purchase invoice": "فاتورة شراء",
  "Purchases": "المشتريات",
  "Received products": "المنتجات المستلمة",
  "Redemptions": "مرات الاستخدام",
  "Remaining": "المتبقي",
  "Reorder Urgency Status": "حالة أولوية إعادة الطلب",
  "Review account details and manage access security.": "راجع بيانات الحساب وأدر أمان الوصول.",
  "Review ID": "معرّف التقييم",
  "Revoke admin access": "إلغاء صلاحيات المسؤول",
  "Sales Revenue": "إيرادات المبيعات",
  "Search Query Term": "عبارة البحث",
  "Selected Period": "الفترة المحددة",
  "Selling unit": "وحدة البيع",
  "Session Notes:": "ملاحظات الجلسة:",
  "Shipping address": "عنوان الشحن",
  "Sign in to manage products, orders, stock, and your store team.": "سجّل الدخول لإدارة المنتجات والطلبات والمخزون وفريق المتجر.",
  "Stage Conversion %": "تحويل المرحلة %",
  "Submitted Date": "تاريخ الإرسال",
  "Subtotal": "الإجمالي الفرعي",
  "Suggested Action": "الإجراء المقترح",
  "Supplier account": "حساب المورد",
  "Supplier invoices": "فواتير المورد",
  "Team account": "حساب الفريق",
  "Team members": "أعضاء الفريق",
  "Title / Scope": "العنوان / النطاق",
  "Top 5 Best Sellers": "أفضل 5 منتجات مبيعًا",
  "Total Price": "السعر الإجمالي",
  "Total Units Sold": "إجمالي الوحدات المباعة",
  "Units received": "الوحدات المستلمة",
  "Units Sold": "الوحدات المباعة",
  "Valid Completed Orders": "الطلبات المكتملة الصحيحة",
  "View Details": "عرض التفاصيل",
  "Wholesale / Selling": "الجملة / البيع",
  "Wholesale unit": "سعر وحدة الجملة",
  "Zero available inventory": "لا يوجد مخزون متاح",
  "Zero sales in period": "لا توجد مبيعات في الفترة",
  "Live Feed": "البث المباشر",
  "BOUTIQUE INTELLIGENCE & INSIGHTS": "تحليلات المتجر ورؤاه",
  "DeRoma Analytics Master Dashboard": "لوحة تحليلات DeRoma الرئيسية",
  "Real-time business performance, conversion metrics, product trends and operational health.": "تابع أداء المتجر لحظة بلحظة، ومعدلات التحويل، واتجاهات المنتجات، وكفاءة التشغيل.",
  "CUSTOM": "مخصص",
  "CUSTOM ": "مخصص ",
  "ALL": "الكل",
  "ALL ": "الكل ",
  "90D": "90 يومًا",
  "30D": "30 يومًا",
  "7D": "7 أيام",
  "Promotions & Discounts": "العروض والخصومات",
  "Orders & Operations": "الطلبات والعمليات",
  "Customer Intelligence": "بيانات العملاء",
  "Products & Inventory": "المنتجات والمخزون",
  "Website & Conversion": "الموقع ومعدلات التحويل",
  "Overview & Sales": "نظرة عامة والمبيعات",
  "EST. NET PROFIT MARGIN": "هامش صافي الربح المتوقع",
  "Est. Profit: ": "الربح المتوقع: ",
  "Est. Profit:": "الربح المتوقع:",
  "AVERAGE ORDER VALUE (AOV)": "متوسط قيمة الطلب",
  "VALID ORDERS COUNT": "عدد الطلبات الصحيحة",
  "TOTAL GROSS REVENUE": "إجمالي الإيرادات",
  "STORE REVIEW SENTIMENT": "انطباع مراجعات المتجر",
  "High luxury satisfaction": "رضا العملاء عن المنتجات الفاخرة مرتفع",
  "DISCOUNT SAVINGS GRANTED": "قيمة الخصومات الممنوحة",
  "discount impact": "تأثير الخصم",
  "discount impact ": "تأثير الخصم ",
  "vs prev ": "مقارنة بالسابق ",
  "ORDER FULFILLMENT RATE": "معدل تنفيذ الطلبات",
  "delivered orders": "الطلبات التي تم توصيلها",
  "items ": "وحدات ",
  "Operations &": "العمليات و",
  "UNITS PER TRANSACTION (UPT)": "متوسط المنتجات في الطلب",
  "Basket depth index": "متوسط عدد المنتجات في الطلب",
  "Sales by Category": "المبيعات حسب القسم",
  "Revenue & Sales Performance Timeline": "تطور الإيرادات والمبيعات خلال الفترة",
  "Daily gross sales trend over selected date range": "تطور إجمالي المبيعات اليومية خلال الفترة المحددة",
  "Treasury System (The 3 Safes)": "نظام الأرصدة والخزينة",
  "TOTAL LIQUIDITY TREASURY (TOTAL CAPITAL)": "إجمالي السيولة المتاحة",
  "NET PROFIT TREASURY (NET PROFIT)": "صافي الربح",
  "SALES TREASURY (SALES REVENUE)": "إيرادات المبيعات",
  "Current Inventory Valuation & Projected Profits": "قيمة المخزون الحالية والأرباح المتوقعة",
  "Projected Sales Value (Retail)": "قيمة البيع المتوقعة",
  "Operations Journal": "سجل العمليات",
  "Daily log": "السجل اليومي",
  "Review store orders, performance, and revenue across any custom date range.": "راجع الطلبات والأداء والإيرادات خلال أي فترة تختارها.",
  "Today": "اليوم",
  "TOTAL STATUS": "الحالة الإجمالية",
  "TIME": "الوقت",
  "Try selecting a different preset or custom range from the filter menu above.": "جرّب اختيار فترة أخرى من الفلاتر أعلاه.",
  "WORKSPACE ACCESS": "صلاحيات مساحة العمل",
  "Team & admins": "الفريق والمسؤولون",
  "A clear overview of the people who can operate the DeRoma back office.": "تعرف على أعضاء الفريق الذين لديهم صلاحية استخدام لوحة تحكم DeRoma.",
  "WORKSPACE OWNER": "مالك مساحة العمل",
  "JOINED THIS MONTH": "انضم هذا الشهر",
  "ACTIVE ACCESS": "صلاحيات نشطة",
  "TOTAL ACCOUNTS": "إجمالي الحسابات",
  "Select an account to view its details and security controls.": "اختر حسابًا لعرض تفاصيله وإعدادات الأمان.",
  "Passwords are hashed before storage. Account-level security controls are available inside each admin profile.": "تُحفظ كلمات المرور بشكل آمن، ويمكن إدارة أمان كل حساب من ملف المسؤول.",
  "OPERATIONS": "العمليات",
  "Manual order": "طلب يدوي",
  "Customer & delivery": "العميل والتوصيل",
  "Capture contact details and the exact delivery destination.": "أدخل بيانات التواصل وعنوان التوصيل بالتفصيل.",
  "Returning customer": "عميل حالي",
  "New customer": "عميل جديد",
  "SECOND NAME": "الاسم الثاني",
  "FIRST NAME": "الاسم الأول",
  "Customer second name": "اسم العميل الثاني",
  "Customer first name": "اسم العميل الأول",
  "ALTERNATIVE PHONE": "هاتف بديل",
  "PRIMARY PHONE": "الهاتف الأساسي",
  "Optional backup number": "رقم احتياطي اختياري",
  "GOVERNORATE": "المحافظة",
  "Select governorate": "اختر المحافظة",
  "Optional email": "بريد إلكتروني اختياري",
  "CITY / AREA": "المدينة / المنطقة",
  "Choose governorate first": "اختر المحافظة أولًا",
  "DETAILED ADDRESS": "العنوان التفصيلي",
  "Building, street, landmark, floor...": "المبنى، الشارع، العلامة المميزة، الطابق...",
  "Payment details": "تفاصيل الدفع",
  "ORDER SOURCE": "مصدر الطلب",
  "Payment method": "طريقة الدفع",
  "Cash on delivery": "الدفع عند الاستلام",
  "CATALOG MANAGEMENT": "إدارة الكتالوج",
  "Manage your collection, pricing, visibility, and inventory.": "أدر منتجاتك وأسعارها وظهورها في المتجر ومخزونها.",
  "Categories & options": "الأقسام والخيارات",
  "Low stock": "مخزون منخفض",
  "Archived": "مؤرشف",
  "Shoes": "أحذية",
  "Search products": "البحث عن المنتجات",
  "All products": "كل المنتجات",
  "PROCUREMENT": "التوريد",
  "Your supplier relationships, purchasing history, and stock sources.": "تابع الموردين وسجل المشتريات ومصادر المخزون.",
  "Add supplier": "إضافة مورد",
  "Suppliers": "الموردون",
  "Supplier relationships": "علاقات الموردين",
};

const SUPPLIERS_INVOICES_ARABIC_LABELS: Record<string, string> = {
  // Intake modal & headers
  "Product intake": "إضافة منتجات للمخزون",
  "PRODUCT INTAKE": "إضافة منتجات للمخزون",
  "Add to this invoice": "إضافة إلى الفاتورة",
  "Add an existing batch": "إضافة دفعة موجودة",
  "Create a new product": "إنشاء منتج جديد",
  "Choose how you want to build the next stock line.": "اختر طريقة إضافة الصنف التالي للمخزون.",
  "Pick a catalog variant, then add its cost and quantity below.": "اختر نوعًا من الكتالوج ثم أدخل سعره وكميته.",
  "Complete the product setup without leaving the invoice.": "أكمل بيانات المنتج من داخل الفاتورة.",
  "New product": "منتج جديد",
  "NEW PRODUCT": "منتج جديد",
  "Create the complete product, variants, pricing and gallery in this modal.": "أنشئ المنتج بكل بياناته وأنواعه وأسعاره وصوره من هذه النافذة.",
  "Open product editor →": "فتح محرر المنتج ←",
  "OPEN PRODUCT EDITOR →": "فتح محرر المنتج ←",
  "Existing batch": "دفعة حالية",
  "EXISTING BATCH": "دفعة حالية",
  "Select a product variant already in the catalog and add it to this invoice.": "اختر نوعًا موجودًا في الكتالوج وأضفه إلى الفاتورة.",
  "Choose from catalog →": "اختر من الكتالوج ←",
  "CHOOSE FROM CATALOG →": "اختر من الكتالوج ←",
  "Catalog batch": "دفعة من الكتالوج",
  "Choose a product variant": "اختر نوع المنتج",
  "Select quantities for each size / volume.": "حدد كمية كل مقاس أو حجم.",
  "Old selling price": "سعر البيع الحالي",
  "New selling price": "سعر بيع جديد",
  "Wholesale price for this batch": "سعر الجملة لهذه الدفعة",
  "Old wholesale": "سعر الجملة الحالي",
  "New wholesale": "سعر جملة جديد",
  "Receive quantity": "الكمية المستلمة",
  "Included": "مضاف",
  "Excluded": "غير مضاف",
  "Adding…": "جاري الإضافة...",
  "Add to invoice": "إضافة للفاتورة",
  "Add product": "إضافة منتج",
  "In progress": "قيد التجهيز",
  "Ready to add": "جاهز للإضافة",
  "Ready to receive stock": "جاهز لإضافة الكمية عند الحفظ",
  "Save invoice & receive stock": "حفظ الفاتورة وإضافة المخزون",
  "Saving invoice…": "جارٍ حفظ الفاتورة...",
  
  // Table & card headers and labels
  "Category": "القسم",
  "Selling": "سعر البيع",
  "Wholesale": "سعر الجملة",
  "Additional": "تكلفة إضافية",
  "ADDITIONAL": "تكلفة إضافية",
  "Extra cost": "تكلفة إضافية",
  "Low stock": "حد المخزون",
  "Size / volume": "المقاس / الحجم",
  "Qty": "الكمية",
  "Line total": "إجمالي البند",
  "Selling / unit": "سعر البيع / للقطعة",
  "Wholesale / unit": "سعر الجملة / للقطعة",
  "Wholesale price / unit": "سعر الجملة / للقطعة",
  "Selling price / unit": "سعر البيع / للقطعة",
  "Sizes / quantities": "المقاسات / الكميات",
  "Remaining": "المتبقي",
  "Product total": "إجمالي المنتج",
  "Total Invoice Paid": "إجمالي قيمة الفاتورة",
  "Received products": "المنتجات المستلمة",
  "Purchase invoice": "فاتورة شراء",
  "Purchase invoices": "فواتير التوريد",
  "Create purchase invoice": "إنشاء فاتورة شراء",
  "Live overview": "ملخص سريع",
  "Invoice summary": "ملخص الفاتورة",
  "Purchase total": "إجمالي الشراء بالجملة",
  "Expected retail value": "القيمة البيعية المتوقعة",
  "Invoice information": "بيانات فاتورة الشراء",
  "Supplier & invoice": "المورد وتاريخ الفاتورة",
  "Invoice date *": "تاريخ الفاتورة *",
  "Stock receipt": "استلام المخزون",
  "Products on this invoice": "منتجات الفاتورة",
  "New stock receipt": "استلام مخزون جديد",
  "New batch": "دفعة جديدة",
  "NEW BATCH": "دفعة جديدة",
  
  // Pickers & Search
  "Choose supplier": "اختر المورد",
  "Search supplier...": "ابحث عن مورد...",
  "No suppliers found.": "لم يتم العثور على موردين.",
  "Add new supplier": "إضافة مورد جديد",
  "Choose product variant to add": "اختر موديل المنتج للإضافة",
  "Search product, color, size or SKU...": "ابحث باسم المنتج أو اللون أو المقاس أو رمز SKU...",
  "No matching products.": "لم نعثر على منتجات مطابقة.",
  "Select a product": "اختر منتجًا",
  "Search product...": "ابحث عن منتج...",
  "Supplier / factory name *": "اسم المورد / المصنع *",
  "Enter supplier name": "أدخل اسم المورد أو المصنع",
  "Create supplier": "إضافة المورد",
  "Creating...": "جاري الإنشاء...",
  "Add the name now; you can complete the supplier details later.": "أدخل الاسم الآن ويمكنك إضافة باقي البيانات لاحقًا.",
  
  // Add Product Modal & Product Steps
  "Catalog intake": "إضافة للمخزون",
  "Add product stock": "إضافة مخزون لمنتج",
  "Receive stock using the same size and volume logic as the product editor.": "أضف المخزون بنفس طريقة تحديد المقاسات والأحجام المستخدمة في محرر المنتج.",
  "Create the complete product, variants, pricing and stock.": "أنشئ المنتج بكل بياناته وأنواعه وأسعاره ومخزونه.",
  "Add stock to an existing product by size or volume.": "أضف مخزونًا لمنتج موجود حسب المقاس أو الحجم.",
  "Batch details": "تفاصيل الدفعة",
  "Existing product *": "المنتج الحالي *",
  "Size matrix": "جدول المقاسات",
  "Volume matrix": "جدول الأحجام",
  "Stock matrix": "جدول المخزون",
  "Select what this batch contains": "اختر محتويات هذه الدفعة",
  "Total stock": "إجمالي المخزون",
  "New supplier name": "اسم المورد الجديد",
  "Same as previous": "نفس السعر السابق",
  "New price": "سعر جديد",
  "Receive batch": "استلام الدفعة",
  "Saving…": "جاري الحفظ...",
  "Identity": "البيانات الأساسية",
  "Name & category": "الاسم والقسم",
  "Gallery": "المعرض",
  "Images & media": "الصور والوسائط",
  "Manage media": "إدارة الوسائط",
  "Inventory": "المخزون",
  "Variants & stock": "الأنواع والمخزون",
  "Manage stock": "إدارة المخزون",
  "Relations": "المنتجات المشابهة",
  "Similar products": "منتجات مشابهة",
  "Pricing": "التسعير",
  "Costs & visibility": "التكاليف والظهور",
  "Update costs": "تعديل التكاليف",
  "Reviews": "التقييمات",
  "Social proof": "تقييمات العملاء",
  "Product details": "تفاصيل المنتج",
  "Product type & identity": "نوع المنتج وبياناته",
  "Product type": "نوع المنتج",
  "Fixed after creation": "لا يمكن تغييره بعد الإنشاء",
  "Step 1": "الخطوة 1",
  "Step 2": "الخطوة 2",
  "Step 3": "الخطوة 3",
  "Step 4": "الخطوة 4",
  "Step 5": "الخطوة 5",
  "Step 6": "الخطوة 6",
  "Continue": "متابعة",
  "Next": "التالي",
  "Create product": "إنشاء المنتج",
  "Update product": "حفظ التعديلات",
  "Volume pricing": "تسعير الأحجام",
  "Price each perfume volume": "تسعير كل حجم عطر",
  "Every bottle size can have its own price and costs": "يمكن تحديد سعر وتكلفة مستقلة لكل حجم زجاجة",
  "Main image & gallery": "الصورة الرئيسية والمعرض",
  "Manage product gallery": "إدارة معرض صور المنتج",
  "Manage variants & stock": "إدارة الأنواع والمخزون",
  "Review pricing, sourcing & visibility": "راجع السعر والتوريد وظهور المنتج",
  "Pricing, sourcing & visibility": "السعر والتوريد وظهور المنتج",
  "Linked product catalog": "كتالوج المنتجات المرتبط",
  "No products linked yet.": "لا توجد منتجات مرتبطة بعد.",
  "No invoices for this supplier yet.": "لا توجد فواتير لهذا المورد بعد.",
  "No purchasing notes added yet.": "لم تتم إضافة ملاحظات شراء بعد.",
  "Procurement profile": "بيانات التوريد",
  "Supplier account": "حساب المورد",
  "No phone": "لم يحدد هاتف",
  "No email": "لم يحدد بريد إلكتروني",
  "No address": "لم يحدد عنوان",
  "Units received": "القطع المستلمة",
  "Total purchases": "إجمالي المشتريات",
  "Delete supplier?": "هل أنت متأكد من حذف هذا المورد؟",
};

// Analytics contains a large reporting surface with labels rendered directly
// by the chart/table components. Keep these labels in one place so the Arabic
// admin view remains complete, including modal and empty-state copy.
const ANALYTICS_ARABIC_LABELS: Record<string, string> = {
  "How is this calculated?": "كيف يتم حساب هذا؟",
  "Calculation Formula:": "معادلة الحساب:",
  "Significance & Definition:": "الأهمية والتعريف:",
  "Got it": "فهمت",
  "Select Date Range": "اختيار نطاق التاريخ",
  "START DATE": "تاريخ البداية",
  "END DATE": "تاريخ النهاية",
  "Pick start date": "اختر تاريخ البداية",
  "Pick end date": "اختر تاريخ النهاية",
  "Today": "اليوم",
  "Last 7 Days": "آخر 7 أيام",
  "Last 30 Days": "آخر 30 يومًا",
  "Cancel": "إلغاء",
  "Apply Range": "تطبيق النطاق",
  "Total Gross Revenue": "إجمالي الإيرادات",
  "Total Gross Store Revenue": "إجمالي إيرادات المتجر",
  "Valid Orders Count": "عدد الطلبات الصحيحة",
  "Average Order Value (AOV)": "متوسط قيمة الطلب (AOV)",
  "Est. Net Profit Margin": "هامش صافي الربح التقديري",
  "Units Per Transaction (UPT)": "متوسط المنتجات في الطلب (UPT)",
  "Basket depth index": "متوسط عدد المنتجات في الطلب",
  "Order Fulfillment Rate": "معدل تنفيذ الطلبات",
  "Discount Savings Granted": "إجمالي الخصومات المقدمة",
  "Store Review Sentiment": "انطباع تقييمات المتجر",
  "High luxury satisfaction": "مستوى رضا فاخر مرتفع",
  "Revenue & Sales Performance Timeline": "خط زمني للإيرادات وأداء المبيعات",
  "Daily gross sales trend over selected date range": "اتجاه إجمالي المبيعات اليومية خلال النطاق المحدد",
  "Sales by Category": "المبيعات حسب القسم",
  "No category sales recorded yet.": "لم يتم تسجيل مبيعات للأقسام بعد.",
  "Master Sales & Financial Performance Comparative Matrix": "مقارنة أداء المبيعات والنتائج المالية",
  "Financial & Sales Metric": "مؤشر مالي أو بيعي",
  "Selected Period": "الفترة المحددة",
  "Previous Period Baseline": "مقارنة بالفترة السابقة",
  "Growth Variance %": "نسبة التغير",
  "Performance Status": "حالة الأداء",
  "Total Gross Sales Revenue": "إجمالي إيرادات المبيعات",
  "Strong Revenue Velocity": "نمو قوي في الإيرادات",
  "Valid Completed Orders": "الطلبات المكتملة الصحيحة",
  "Healthy Order Pace": "معدل طلبات جيد",
  "Premium Basket Size": "متوسط قيمة طلب مرتفع",
  "Optimal Profitability": "ربحية مثالية",
  "Top Revenue Generating Products": "المنتجات الأعلى تحقيقًا للإيرادات",
  "Product Name": "اسم المنتج",
  "Units Sold": "الوحدات المباعة",
  "Sales Revenue": "إيرادات المبيعات",
  "Revenue Share": "نسبة المساهمة في الإيرادات",
  "Egyptian Regional Governorate Sales Breakdown": "تفصيل المبيعات حسب المحافظات المصرية",
  "Governorate Name": "اسم المحافظة",
  "Orders Count": "عدد الطلبات",
  "Total Revenue": "إجمالي الإيرادات",
  "Regional AOV": "متوسط قيمة الطلب بالمحافظة",
  "Executive Sales Strategy & Revenue Pace Takeaways": "أهم ملاحظات المبيعات والإيرادات",
  "Web Traffic Analytics, Purchase Funnel & Session Conversion": "تحليلات زيارات الموقع ومسار الشراء ومعدلات التحويل",
  "Global Conversion Rate": "معدل التحويل العام",
  "Total Store Sessions": "إجمالي جلسات المتجر",
  "Across mobile, desktop & tablet devices": "على الهاتف والكمبيوتر والتابلت",
  "Product Page Impressions": "مشاهدات صفحات المنتجات",
  "Add-To-Cart Rate": "معدل الإضافة إلى السلة",
  "Checkout Initiation Rate": "معدل بدء الدفع",
  "Overall Store Conversion Rate": "معدل تحويل المتجر الإجمالي",
  "Cart Abandonment Rate": "معدل التخلي عن السلة",
  "Avg Session Duration": "متوسط مدة الجلسة",
  "High engagement dwell time": "وقت تصفح وتفاعل مرتفع",
  "Avg Page Load Speed": "متوسط سرعة تحميل الصفحة",
  "Funnel Stage": "مرحلة مسار الشراء",
  "Visitors Volume": "عدد الزوار",
  "Stage Conversion %": "نسبة التحويل في المرحلة",
  "Stage Drop-off Count": "عدد من غادروا المرحلة",
  "Drop-off Loss %": "نسبة فقد العملاء في المرحلة",
  "Optimization Recommendation": "توصية التحسين",
  "Daily Store Sessions & Conversion Rate CVR Timeline": "تطور زيارات المتجر ومعدل التحويل",
  "Traffic Acquisition Source Channel Split": "توزيع مصادر الزيارات",
  "Device Category Share (Mobile vs Desktop)": "توزيع الأجهزة (هاتف / كمبيوتر)",
  "Cart Abandonment vs Purchased Orders Share": "الطلبات المكتملة مقابل السلات المتروكة",
  "On-Site Search Terms & Zero-Result Query Warnings": "عمليات البحث داخل الموقع والتنبيهات بلا نتائج",
  "Search Query Term": "عبارة البحث",
  "Search Count": "عدد مرات البحث",
  "Search CVR %": "نسبة تحويل البحث",
  "Result Status": "حالة النتائج",
  "Traffic Source Channel": "قناة مصدر الزيارات",
  "Bounce Rate %": "نسبة الارتداد",
  "Orders Driven": "الطلبات الناتجة",
  "Driven Revenue": "الإيرادات الناتجة عن الزيارات",
  "Catalog Performance, Inventory Valuation & Stock Velocity": "أداء الكتالوج وقيمة المخزون وحركة البيع",
  "Track stock levels across variants, inventory capital valuation, fast-moving items, and dead stock liquidation candidates.": "تابع مستويات المخزون وقيمته والمنتجات سريعة البيع والمنتجات الراكدة.",
  "Stock Health Rating": "تقييم حالة المخزون",
  "Catalog Products Count": "عدد منتجات الكتالوج",
  "Total Units in Stock": "إجمالي الوحدات في المخزون",
  "Physical warehouse units": "وحدات المستودع الفعلية",
  "Est. Inventory Valuation": "القيمة التقديرية للمخزون",
  "Gross retail asset value": "قيمة المخزون بسعر البيع",
  "Low Stock Warnings": "تنبيهات انخفاض المخزون",
  "Out of Stock Items": "أصناف نفد مخزونها",
  "Zero available inventory": "لا توجد كمية متاحة",
  "Dead Stock Candidates": "منتجات معرضة للركود",
  "Zero sales in period": "لا مبيعات خلال الفترة",
  "Inventory Turnover Ratio": "معدل دوران المخزون",
  "Sales velocity ratio": "معدل سرعة المبيعات",
  "Top Selling Category": "القسم الأعلى مبيعًا",
  "Primary revenue generator": "المصدر الرئيسي للإيرادات",
  "Fast-Moving Best Sellers vs Slow-Moving Dead Stock Comparison": "مقارنة المنتجات الأسرع مبيعًا بالأصناف الراكدة",
  "Category Segment": "قطاع القسم",
  "Top 5 Best Sellers": "أفضل 5 منتجات مبيعًا",
  "Dead Stock / Unsold Items": "الأصناف الراكدة / غير المباعة",
  "Strategic Action Required": "الإجراء الاستراتيجي المطلوب",
  "Product Count": "عدد المنتجات",
  "Balance catalog breadth": "تنويع الكتالوج بشكل متوازن",
  "Total Units Sold": "إجمالي الوحدات المباعة",
  "Sales Revenue Generated": "إيرادات المبيعات المحققة",
  "Reorder Top Sellers": "إعادة طلب المنتجات الأعلى مبيعًا",
  "Tied Inventory Capital": "الأموال المجمدة في المخزون",
  "High Velocity Capital": "قيمة المخزون سريع البيع",
  "Liquidate Dead Stock": "تصريف المنتجات الراكدة",
  "In-Stock": "متاح بالمخزون",
  "Feature in Promo Offer": "إدراجه ضمن عرض ترويجي",
  "Low Stock & Critical Reorder Alerts Directory": "قائمة تنبيهات انخفاض المخزون وإعادة الطلب العاجلة",
  "Available Stock Units": "وحدات المخزون المتاحة",
  "Reorder Urgency Status": "حالة أولوية إعادة الطلب",
  "Smart Inventory & Catalog Optimization Takeaways": "أهم نتائج تحسين المخزون والكتالوج",
  "Customer Loyalty, Cohort Behavior & Lifetime Value (LTV)": "ولاء العملاء وسلوكهم وإجمالي إنفاقهم (LTV)",
  "Analyze customer acquisition trends, repeat purchase frequency, high-value VIP segments, and feedback sentiment.": "تحليل اتجاهات اكتساب العملاء وتكرار الشراء وشرائح العملاء المميزين وانطباعات التقييمات.",
  "Repeat Retention Rate": "معدل عودة العملاء",
  "Total Unique Buyers": "عدد العملاء المختلفين",
  "Repeat Purchase Rate": "معدل تكرار الشراء",
  "Avg Customer Spend (LTV)": "متوسط إنفاق العميل (LTV)",
  "Lifetime turnover per buyer": "إجمالي إنفاق كل عميل",
  "Avg Orders per Buyer": "متوسط الطلبات لكل مشترٍ",
  "Order transactions per buyer": "معاملات الطلب لكل مشترٍ",
  "Returning Sales Share": "حصة مبيعات العملاء العائدين",
  "New First-Time Buyers vs Returning Loyal Buyers Comparison": "مقارنة العملاء الجدد بالعملاء العائدين",
  "Customer Segment Metric": "بيانات شريحة العملاء",
  "Repeat Returning Buyers": "المشترون العائدون",
  "New First-Time Buyers": "المشترون الجدد لأول مرة",
  "Buyers Count": "عدد المشترين",
  "Total Sales Revenue": "إجمالي إيرادات المبيعات",
  "Customer Lifetime Spend Tiers Distribution": "توزيع العملاء حسب إجمالي إنفاقهم",
  "New vs Returning Customer Revenue Split": "توزيع الإيرادات بين العملاء الجدد والعائدين",
  "Customer Geographic Density (Top Governorates)": "التوزيع الجغرافي للعملاء (أعلى المحافظات)",
  "Top VIP Customers Master Directory (Lifetime Spend)": "دليل كبار العملاء (حسب إجمالي الإنفاق)",
  "Customer Name": "اسم العميل",
  "Phone": "الهاتف",
  "Location": "الموقع",
  "Orders Placed": "الطلبات المنفذة",
  "Lifetime Spend": "إجمالي الإنفاق",
  "VIP Tier": "فئة العميل المميز",
  "No customer purchase records available.": "لا توجد سجلات شراء للعملاء.",
  "Customer Reviews & Feedback Submissions": "تقييمات العملاء وتعليقاتهم",
  "Review ID": "معرّف التقييم",
  "Product ID": "معرّف المنتج",
  "Rating": "التقييم",
  "Submitted Date": "تاريخ الإرسال",
  "No customer reviews submitted yet.": "لم يتم إرسال تقييمات من العملاء بعد.",
  "Smart Customer Retention Strategy Takeaways": "أهم ملاحظات الاحتفاظ بالعملاء",
  "Order Fulfillment & Operational Dispatch Intelligence": "تنفيذ الطلبات والشحن",
  "Monitor order pipeline stages, shipping courier performance, delivery completion rates, and regional logistics.": "تابع مراحل الطلبات وأداء الشحن ومعدلات التوصيل والخدمات اللوجستية حسب المنطقة.",
  "Ops Efficiency Score": "درجة كفاءة التشغيل",
  "Total Orders Placed": "إجمالي الطلبات",
  "Pending Dispatch": "في انتظار الشحن",
  "Requires admin dispatch": "يتطلب تجهيزًا وشحنًا من الإدارة",
  "Shipped (In-Transit)": "تم الشحن (قيد التوصيل)",
  "Out with couriers": "قيد التوصيل مع المندوب",
  "Successfully Delivered": "تم التوصيل بنجاح",
  "Cancelled Orders": "الطلبات الملغاة",
  "Total Shipping Fees": "إجمالي رسوم الشحن",
  "Avg Delivery Lead Time": "متوسط مدة التوصيل",
  "Standard Egyptian logistics speed": "السرعة المعتادة للتوصيل في مصر",
  "Fulfillment Completion": "نسبة إتمام الطلبات",
  "Order Pipeline Stage Breakdown Matrix": "تفصيل مراحل الطلبات",
  "Pipeline Stage": "مرحلة الطلب",
  "Monetary Value": "القيمة المالية",
  "Avg Order Basket": "متوسط سلة الطلب",
  "Operational Action Required": "الإجراء التشغيلي المطلوب",
  "Confirm & Pack Items": "تأكيد وتجهيز المنتجات",
  "Track Courier Delivery": "تتبع توصيل المندوب",
  "Order Complete": "الطلب مكتمل",
  "Restock Inventory Lot": "إعادة تزويد دفعة المخزون",
  "Order Placement Activity by Day of Week": "نشاط إنشاء الطلبات حسب أيام الأسبوع",
  "Peak Ordering Hours & Time Windows": "أوقات الذروة للطلبات",
  "Order Status Distribution Share": "توزيع حالات الطلبات",
  "Governorate Delivery Volume Share": "حصة حجم التوصيل حسب المحافظة",
  "Live Operational Orders Fulfillment Queue": "قائمة الطلبات الجاري تجهيزها",
  "Latest 10 Orders": "أحدث 10 طلبات",
  "Order ID": "معرّف الطلب",
  "Customer": "العميل",
  "Destination": "الوجهة",
  "Items": "المنتجات",
  "Total Price": "الإجمالي",
  "Payment": "الدفع",
  "Status": "الحالة",
  "Placed At": "تاريخ الإنشاء",
  "No orders recorded in period.": "لا توجد طلبات مسجلة خلال الفترة.",
  "Governorate Regional Delivery Performance Matrix": "أداء التوصيل حسب المحافظة",
  "Avg Shipping Fee": "متوسط رسوم الشحن",
  "Delivery Success Rate": "معدل نجاح التوصيل",
  "Promotions, Discounts & Coupon ROI Performance": "أداء العروض والخصومات وعائدها",
  "Analyze how discount incentives motivate customer purchase decisions, basket sizes, and incremental revenue.": "حلّل تأثير الخصومات على قرارات الشراء ومتوسط الطلب والإيرادات الإضافية.",
  "Promo Revenue Leverage": "أثر العروض على الإيرادات",
  "Total Discounts Granted": "إجمالي الخصومات الممنوحة",
  "Driven Promo Revenue": "إيرادات العروض المحققة",
  "Discount Penetration Rate": "نسبة الطلبات التي استخدمت خصمًا",
  "Promo Revenue ROI": "عائد الاستثمار في العروض",
  "Promo Orders AOV": "متوسط قيمة طلبات العروض",
  "Avg Discount / Order": "متوسط الخصم لكل طلب",
  "Average savings per shopper": "متوسط التوفير لكل متسوق",
  "Total Redemptions": "إجمالي مرات الاستخدام",
  "Active promo codes:": "أكواد العروض النشطة:",
  "Discount Impact Rate": "معدل تأثير الخصم",
  "Gross turnover impact": "أثر الخصم على إجمالي المبيعات",
  "Full-Price vs Promo Orders Comparative Analysis": "مقارنة الطلبات بالسعر الكامل وطلبات العروض",
  "Performance Metric": "مؤشر الأداء",
  "Promo-Assisted Orders": "طلبات بمساعدة عرض",
  "Full-Price Orders": "طلبات بالسعر الكامل",
  "Variance / Impact": "التغير / التأثير",
  "Orders Volume": "حجم الطلبات",
  "Gross Sales Revenue": "إجمالي إيرادات المبيعات",
  "Delivery Fulfillment Rate": "معدل تنفيذ التوصيل",
  "Discounts Granted vs Driven Revenue Over Time": "الخصومات الممنوحة مقابل الإيرادات المحققة عبر الزمن",
  "Order Value Bracket Distribution (Promo vs Full Price)": "توزيع شرائح قيمة الطلب (العروض مقابل السعر الكامل)",
  "Promo vs Full Price Orders Share": "حصة طلبات العروض مقابل السعر الكامل",
  "No promo type data available.": "لا تتوفر بيانات لأنواع العروض.",
  "Promotion Name": "اسم العرض",
  "Coupon Code": "كود الكوبون",
  "Type": "النوع",
  "Value": "القيمة",
  "Redemptions": "مرات الاستخدام",
  "Est. Customer Savings": "التوفير التقديري للعملاء",
  "Est. Driven Sales": "المبيعات التقديرية المحققة",
  "Avg Basket (AOV)": "متوسط السلة (AOV)",
  "No active promotions currently set up.": "لا توجد عروض نشطة حاليًا.",
  "Smart Promotional Strategy Takeaways": "أهم ملاحظات العروض والخصومات",
  "Higher Basket Value:": "قيمة سلة أعلى:",
  "Revenue Multiplier:": "زيادة الإيرادات:",
  "Fulfillment Reliability:": "موثوقية التوصيل:",
  "Treasury & Financial Intelligence": "الإدارة المالية والخزينة",
  "Overview & Safes": "نظرة عامة والأرصدة",
  "Profit & Loss (P&L)": "قائمة الأرباح والخسائر",
  "Cash Flow": "التدفق النقدي",
  "Expenses": "المصروفات",
  "Weekly Settlement": "التسوية الأسبوعية",
  "Order Profitability": "ربحية الطلبات",
  "Projections & Restock": "التوقعات وإعادة التخزين",
  "Treasury System (The 3 Safes)": "نظام الأرصدة والخزينة",
  "Transfer Between Accounts": "تحويل بين الحسابات",
  "Sales Treasury (Sales Revenue)": "إيرادات المبيعات",
  "Net Profit Treasury (Net Profit)": "صافي الربح",
  "Total Liquidity Treasury (Total Capital)": "إجمالي السيولة المتاحة",
  "Total sales volume from": "إجمالي المبيعات من",
  "completed orders": "طلبات مكتملة",
  "Profit Margin:": "هامش الربح:",
  "After discounts & expenses": "بعد الخصومات والمصروفات",
  "Cash on Hand": "النقدية المتاحة",
  "InstaPay / Visa": "إنستا باي / فيزا",
  "E-Wallets": "المحافظ الإلكترونية",
  "E-Wallets (Vodafone Cash)": "المحافظ الإلكترونية (فودافون كاش)",
  "Avg Order Value (AOV)": "متوسط قيمة الطلب (AOV)",
  "Avg Profit Per Order": "متوسط الربح لكل طلب",
  "Gross Profit Margin %": "هامش إجمالي الربح %",
  "COGS Ratio %": "نسبة تكلفة المنتجات %",
  "Total Stock Units": "إجمالي وحدات المخزون",
  "units": "وحدات",
  "Stock Wholesale Cost (COGS)": "تكلفة المخزون بسعر الشراء",
  "Projected Sales Value (Retail)": "قيمة البيع المتوقعة",
  "Projected Profit on Sale": "الربح المتوقع من البيع",
  "Current Inventory Valuation & Projected Profits": "تقييم المخزون الحالي والأرباح المتوقعة",
  "Official financial breakdown of store revenues, costs, operating expenses, and net profit.": "تفصيل مالي لإيرادات المتجر والتكاليف والمصروفات التشغيلية وصافي الربح.",
  "Financial Line Item": "البند المالي",
  "Amount (EGP)": "القيمة (جنيه)",
  "Less: Promotional Discounts": "يخصم: الخصومات الترويجية",
  "Less: Cash Product Cost (COGS)": "يُخصم: تكلفة البضاعة المباعة",
  "Total Operating Expenses": "إجمالي مصروفات التشغيل",
  "Analysis of cash inflows from sales vs outflow from expenses.": "تحليل التدفقات النقدية من المبيعات مقابل المصروفات.",
  "Cash Inflow (Sales)": "التدفق النقدي الداخل (المبيعات)",
  "From completed client orders": "من طلبات العملاء المكتملة",
  "Cash Outflow (COGS + Expenses)": "النقدية الخارجة (تكلفة المبيعات والمصروفات)",
  "Product cost + operational expenses": "تكلفة المنتجات والمصروفات التشغيلية",
  "Net Cash Position": "صافي الرصيد النقدي",
  "Net cash retained in store treasury": "صافي النقد الموجود في خزينة المتجر",
  "Cash on Delivery (COD)": "الدفع عند الاستلام (COD)",
  "Record and monitor all store operating costs.": "تسجيل ومتابعة جميع تكاليف تشغيل المتجر.",
  "All Categories": "كل الأقسام",
  "No matching expenses found.": "لا توجد مصروفات مطابقة.",
  "Title": "العنوان",
  "Category": "القسم",
  "Payment Account": "حساب الدفع",
  "Amount": "القيمة",
  "Actions": "الإجراءات",
  "Close period accounts and log treasury transfers.": "إقفال حسابات الفترة وتسجيل التحويلات بين الحسابات.",
  "Complete Settlement": "إقفال التسوية",
  "No previous settlements recorded.": "لا توجد تسويات سابقة مسجلة.",
  "Sales:": "المبيعات:",
  "Net Profit:": "صافي الربح:",
  "Date:": "التاريخ:",
  "Compare sales price against wholesale cash item costs per order.": "مقارنة سعر البيع بتكلفة شراء المنتجات لكل طلب.",
  "All Profit Margins": "كل هوامش الربح",
  "High Profit (≥ 30%)": "ربح مرتفع (≥ 30%)",
  "Medium Profit (15% - 29%)": "ربح متوسط (15% - 29%)",
  "Low Profit (< 15%)": "ربح منخفض (< 15%)",
  "Order #": "رقم الطلب",
  "Total Sales": "إجمالي المبيعات",
  "Product Cost": "تكلفة المنتجات",
  "Discount": "الخصم",
  "Order Profit": "ربح الطلب",
  "Margin %": "الهامش %",
  "Forecast restock costs and future sales run-rate.": "توقع تكاليف إعادة التخزين ومعدل المبيعات المستقبلية.",
  "Low Stock Restock Estimator": "تقدير تكلفة إعادة التخزين",
  "Estimated cash required to replenish items currently at or below their low stock limit.": "المبلغ المتوقع لشراء المنتجات التي وصل مخزونها إلى الحد الأدنى أو أقل.",
  "Low Stock Items Count:": "عدد الأصناف منخفضة المخزون:",
  "Estimated Replenishment Cost:": "التكلفة التقديرية لإعادة التخزين:",
  "View Inventory Management": "عرض إدارة المخزون",
  "Sales Run-Rate Projections": "توقعات المبيعات",
  "Projected monthly revenue based on active average order velocity.": "الإيرادات الشهرية المتوقعة بناءً على متوسط المبيعات الحالي.",
  "Current Period Sales:": "مبيعات الفترة الحالية:",
  "Projected Monthly Run-Rate:": "المبيعات الشهرية المتوقعة:",
  "Add New Expense": "إضافة مصروف جديد",
  "Expense Title *": "عنوان المصروف *",
  "Date": "التاريخ",
  "Marketing & Ads": "التسويق والإعلانات",
  "Logistics & Shipping": "الخدمات اللوجستية والشحن",
  "Bags & Packaging": "الأكياس والتغليف",
  "Utilities & Services": "الخدمات والمرافق",
  "Salaries & Commissions": "الرواتب والعمولات",
  "Other Expenses": "مصروفات أخرى",
  "Deduct from Payment Account": "الخصم من حساب الدفع",
  "Cash on Hand / Vault": "الرصيد النقدي / الخزينة",
  "Additional Notes": "ملاحظات إضافية",
  "From Account": "من حساب",
  "To Account": "إلى حساب",
  "Transfer Amount (EGP) *": "قيمة التحويل (جنيه) *",
  "Transfer Fee / Tax (EGP)": "رسوم / ضريبة التحويل (جنيه)",
  "Notes / Reason": "ملاحظات / السبب",
  "Confirm Period Settlement": "تأكيد تسوية الفترة",
  "Product Cost (COGS)": "تكلفة المنتجات (COGS)",
  "Total Expenses:": "إجمالي المصروفات:",
  "Net Profit to Close:": "صافي الربح للإغلاق:",
  "Settlement Notes": "ملاحظات التسوية",
  "Save": "حفظ",
  "Revenue Trend:": "اتجاه الإيرادات:",
  "Basket Depth:": "عمق السلة:",
  "Loyalty Revenue Impact:": "تأثير ولاء العملاء على الإيرادات:",
  "Repeat Purchase Rate:": "معدل تكرار الشراء:",
  "Mobile Dominance:": "هيمنة الهاتف:",
  "Primary Acquisition Channel:": "أهم مصدر لجذب العملاء:",
  "Total Inventory Value:": "إجمالي قيمة المخزون:",
  "Stock Health:": "حالة المخزون:",
  "Uncategorized": "غير مصنف",
  "Unspecified": "غير محدد",
  "Other": "أخرى",
  "No data available": "لا توجد بيانات متاحة",
  "No data": "لا توجد بيانات",
  "Percentage %": "نسبة مئوية %",
  "Fixed EGP": "قيمة ثابتة بالجنيه",
  "Free Shipping": "شحن مجاني",
  "Active": "نشط",
  "Inactive": "غير نشط",
  "Pending": "قيد الانتظار",
  "Shipped": "تم الشحن",
  "Delivered": "تم التوصيل",
  "Cancelled": "ملغى",
  "COD": "الدفع عند الاستلام",
  "Search": "بحث",
  "View Details": "عرض التفاصيل",
  "vs prev": "مقارنة بالسابق",
};

const DAILY_LOG_ARABIC_LABELS: Record<string, string> = {
  "Operations journal": "سجل العمليات",
  "Daily log": "السجل اليومي",
  "Review store orders, performance, and revenue across any custom date range.": "مراجعة طلبات المتجر وأدائه وإيراداته خلال أي نطاق زمني مخصص.",
  "Orders": "الطلبات",
  "Total Orders": "إجمالي الطلبات",
  "Revenue": "الإيرادات",
  "Total Revenue": "إجمالي الإيرادات",
  "Pending": "قيد الانتظار",
  "Pending Orders": "الطلبات قيد الانتظار",
  "Orders on": "الطلبات في",
  "from": "من",
  "Orders from": "الطلبات من",
  "order": "طلب",
  "orders": "طلبات",
  "Date & Time": "التاريخ والوقت",
  "Order Number": "رقم الطلب",
  "Total": "الإجمالي",
  "No orders found for this date range.": "لا توجد طلبات في هذا النطاق الزمني.",
  "Try selecting a different preset or custom range from the filter menu above.": "جرّب اختيار إعداد مختلف أو نطاق مخصص من قائمة الفلترة أعلاه.",
  "Filter Date Range": "فلترة نطاق التاريخ",
  "Start Date": "تاريخ البداية",
  "End Date": "تاريخ النهاية",
  "Pick start date": "اختر تاريخ البداية",
  "Pick end date": "اختر تاريخ النهاية",
  "Last 7 Days": "آخر 7 أيام",
  "Last 30 Days": "آخر 30 يومًا",
  "Sunday": "الأحد",
  "Monday": "الاثنين",
  "Tuesday": "الثلاثاء",
  "Wednesday": "الأربعاء",
  "Thursday": "الخميس",
  "Friday": "الجمعة",
  "Saturday": "السبت",
};

const TEAM_ARABIC_LABELS: Record<string, string> = {
  "Workspace access": "صلاحيات مساحة العمل",
  "Team & admins": "الفريق والمسؤولون",
  "A clear overview of the people who can operate the DeRoma back office.": "نظرة واضحة على الأشخاص القادرين على تشغيل لوحة تحكم DeRoma.",
  "Total accounts": "إجمالي الحسابات",
  "Total": "الإجمالي",
  "Active access": "صلاحيات نشطة",
  "Active": "نشط",
  "Joined this month": "انضم هذا الشهر",
  "This month": "هذا الشهر",
  "Workspace owner": "مالك مساحة العمل",
  "Owner": "المالك",
  "Team members": "أعضاء الفريق",
  "Select an account to view its details and security controls.": "اختر حسابًا لعرض تفاصيله وإعدادات الأمان.",
  "accounts": "حسابات",
  "You": "أنت",
  "Unnamed admin": "مسؤول بدون اسم",
  "Added": "أُضيف في",
  "No admin accounts found.": "لا توجد حسابات مسؤولين.",
  "Passwords are hashed before storage. Account-level security controls are available inside each admin profile.": "يتم تشفير كلمات المرور قبل تخزينها. تتوفر إعدادات أمان الحساب داخل ملف كل مسؤول.",
  "Close": "إغلاق",
  "Full name": "الاسم بالكامل",
  "Temporary password *": "كلمة مرور مؤقتة *",
  "At least 8 characters": "8 أحرف على الأقل",
  "Hide password": "إخفاء كلمة المرور",
  "Show password": "إظهار كلمة المرور",
  "Account security": "أمان الحساب",
  "Create a new account with access to the DeRoma back office.": "إنشاء حساب مسؤول جديد للوصول إلى لوحة تحكم DeRoma.",
  "Set a new password for": "تعيين كلمة مرور جديدة لـ",
  "New password *": "كلمة المرور الجديدة *",
  "Confirm password *": "تأكيد كلمة المرور *",
  "Team account": "حساب عضو الفريق",
  "Review account details and manage access security.": "مراجعة تفاصيل الحساب وإدارة أمان الوصول.",
  "Active admin": "مسؤول نشط",
  "Email address": "البريد الإلكتروني",
  "Access role": "دور الوصول",
  "Account created": "تاريخ إنشاء الحساب",
  "Last updated": "آخر تحديث",
  "Danger zone": "منطقة خطرة",
  "Revoke admin access": "إلغاء صلاحيات المسؤول",
  "Revoking access will remove admin privileges from this account.": "سيؤدي إلغاء الوصول إلى إزالة صلاحيات المسؤول من هذا الحساب.",
  "Back to team": "العودة إلى الفريق",
};

const ORDERS_ARABIC_LABELS: Record<string, string> = {
  Operations: "العمليات",
  "Order management": "إدارة الطلبات",
  "Create manual order": "إنشاء طلب يدوي",
  "Customer": "العميل",
  "Phone": "الهاتف",
  "Date": "التاريخ",
  "Status": "الحالة",
  "Shipping address": "عنوان التوصيل",
  Amount: "المبلغ",
  Actions: "الإجراءات",
  View: "عرض التفاصيل",
  "No results to display": "لا توجد نتائج لعرضها",
  "Search products": "البحث عن المنتجات",
  "Search customer...": "البحث عن عميل...",
  "Choose a product…": "اختر منتجًا لإضافته...",
  "Choose a product...": "اختر منتجًا لإضافته...",
  "Order summary": "ملخص الطلب",
  Products: "المنتجات",
  Shipping: "الشحن",
  Discount: "الخصم",
  "Total due": "الإجمالي المستحق",
  "Payment details": "تفاصيل الدفع",
  "Order totals": "إجماليات الطلب",
  "Shipping fee": "رسوم الشحن",
  "Your order is empty": "طلبك فارغ تمامًا",
  "Add to order": "إضافة للطلب",
  "Select size:": "اختر المقاس:",
  "Payment method": "طريقة الدفع",
  "Order source": "مصدر الطلب",
  WhatsApp: "واتساب",
  Instagram: "إنستجرام",
  Website: "الموقع الإلكتروني",
};

export function localizeLegacyAdminDom(root: HTMLElement, lang: AdminLang = "ar") {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);

  if (lang === "en") {
    for (const textNode of nodes) {
      const original = LEGACY_ORIGINAL_TEXT.get(textNode);
      if (original) {
        textNode.nodeValue = original.original;
        LEGACY_ORIGINAL_TEXT.delete(textNode);
      }
    }
    for (const element of root.querySelectorAll<HTMLElement>("input, textarea, [title], [aria-label]")) {
      const originals = LEGACY_ORIGINAL_ATTRIBUTES.get(element);
      if (!originals) continue;
      for (const [attribute, value] of originals) {
        if (value === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, value);
      }
      LEGACY_ORIGINAL_ATTRIBUTES.delete(element);
    }
    return;
  }

  for (const textNode of nodes) {
    if (textNode.parentElement?.closest("[data-admin-i18n-skip]")) continue;
    const value = textNode.nodeValue || "";
    const trimmed = value.trim();
    if (!trimmed) continue;
    let localized = LEGACY_ARABIC_LABELS[trimmed] || SUPPLIERS_INVOICES_ARABIC_LABELS[trimmed] || ANALYTICS_ARABIC_LABELS[trimmed] || DAILY_LOG_ARABIC_LABELS[trimmed] || TEAM_ARABIC_LABELS[trimmed] || ORDERS_ARABIC_LABELS[trimmed];
    const optionCount = trimmed.match(/^Showing (.+) of (.+) options in this category\.$/);
    if (optionCount) localized = `عرض ${optionCount[1]} من ${optionCount[2]} خيارًا في هذا القسم.`;
    const editing = trimmed.match(/^Editing (.+)$/);
    if (editing) localized = `تعديل ${editing[1]}`;
    const productsUsing = trimmed.match(/^Products using (.+)$/);
    if (productsUsing) localized = `المنتجات التي تستخدم ${productsUsing[1]}`;
    const bulkRestock = trimmed.match(/^Add stock quantity to (\d+) selected variants\.$/i);
    if (bulkRestock) localized = `أضف كمية مخزون إلى ${bulkRestock[1]} متغيرات محددة.`;
    const vsPrevious = trimmed.match(/^vs prev (.+)$/i);
    const estimatedProfit = trimmed.match(/^Est\. Profit: (.+)$/i);
    if (estimatedProfit) localized = `الربح التقديري: ${estimatedProfit[1]}`;
    const discountImpact = trimmed.match(/^discount impact (.+)$/i);
    if (discountImpact) localized = `تأثير الخصم ${discountImpact[1]}`;
    const deliveredOrders = trimmed.match(/^delivered orders (.+)$/i);
    if (deliveredOrders) localized = `الطلبات التي تم توصيلها ${deliveredOrders[1]}`;
    if (vsPrevious) localized = `مقارنة بالسابق ${vsPrevious[1]}`;
    const stockCount = trimmed.match(/^items in stock (.+)$/i);
    if (stockCount) localized = `منتجات في المخزون ${stockCount[1]}`;
    const itemsCount = trimmed.match(/^items (.+)$/i);
    if (itemsCount) localized = `وحدات ${itemsCount[1]}`;
    const orderCount = trimmed.match(/^orders (.+)$/i);
    if (orderCount) localized = `طلبات ${orderCount[1]}`;
    const customerOrderCount = trimmed.match(/^(\d+) orders?$/i);
    if (customerOrderCount) localized = `${customerOrderCount[1]} طلب`;
    const lastCustomerOrder = trimmed.match(/^Last:\s*(.+)$/i);
    if (lastCustomerOrder) localized = `آخر طلب: ${lastCustomerOrder[1]}`;
    const accountCount = trimmed.match(/^accounts (.+)$/i);
    if (accountCount) localized = `حسابات ${accountCount[1]}`;
    const newProductCreated = trimmed.match(/^(.+) · New product to be created with this invoice$/i);
    if (newProductCreated) localized = `${newProductCreated[1]} · منتج جديد سيتم إنشاؤه مع هذه الفاتورة`;
    const newStockReceiptSizes = trimmed.match(/^New stock receipt · (\d+) sizes \/ volumes$/i);
    if (newStockReceiptSizes) localized = `استلام مخزون جديد · ${newStockReceiptSizes[1]} مقاسات / أحجام`;
    const variantsUnitsAdded = trimmed.match(/^(\d+) variants · (.+) units will be added to this invoice\.$/i);
    if (variantsUnitsAdded) localized = `${variantsUnitsAdded[1]} موديلات · ${variantsUnitsAdded[2]} قطعة ستتم إضافتها لهذه الفاتورة.`;
    const piecesCount = trimmed.match(/^(.+) pieces$/i);
    if (piecesCount) localized = `${piecesCount[1]} قطعة`;
    const sellingTotal = trimmed.match(/^(.+) selling total$/i);
    if (sellingTotal) localized = `إجمالي البيع: ${sellingTotal[1]}`;
    const purchaseTotal = trimmed.match(/^(.+) purchase total$/i);
    if (purchaseTotal) localized = `إجمالي الشراء: ${purchaseTotal[1]}`;
    const totalUnits = trimmed.match(/^(\d+) total units$/i);
    if (totalUnits) localized = `إجمالي القطع ${totalUnits[1]}`;
    const unitsRemaining = trimmed.match(/^(\d+) units · (\d+) remaining$/i);
    if (unitsRemaining) localized = `${unitsRemaining[1]} قطعة · ${unitsRemaining[2]} متبقي`;
    const sizeQty = trimmed.match(/^Size (.+) · Qty (\d+)$/i);
    if (sizeQty) localized = `مقاس ${sizeQty[1]} · كمية ${sizeQty[2]}`;
    const inStockCount = trimmed.match(/^(\d+) in stock$/i);
    if (inStockCount) localized = `${inStockCount[1]} متوفر بالمخزون`;
    const productsCount = trimmed.match(/^(\d+) products?$/i);
    if (productsCount) localized = `${productsCount[1]} منتج`;
    const ordersOn = trimmed.match(/^Orders on (.+)$/);
    const ordersOnFragment = trimmed.match(/^on (.+)$/i);
    if (ordersOnFragment) {
      let translatedDate = ordersOnFragment[1];
      const dateLabels = Object.entries({ ...LEGACY_ARABIC_LABELS, ...SUPPLIERS_INVOICES_ARABIC_LABELS, ...DAILY_LOG_ARABIC_LABELS })
        .filter(([english]) => english.length > 2)
        .sort(([a], [b]) => b.length - a.length);
      for (const [english, arabic] of dateLabels) {
        if (translatedDate.includes(english)) translatedDate = translatedDate.split(english).join(arabic);
      }
      localized = `في ${translatedDate}`;
    }
    if (ordersOn) localized = `الطلبات في ${ordersOn[1]}`;
    if (!localized) continue;
    const previous = LEGACY_ORIGINAL_TEXT.get(textNode);
    const original = previous && value === previous.localized ? previous.original : value;
    const nextValue = value.replace(trimmed, localized);
    LEGACY_ORIGINAL_TEXT.set(textNode, { original, localized: nextValue });
    textNode.nodeValue = nextValue;
  }
  for (const element of root.querySelectorAll<HTMLElement>("input, textarea, [title], [aria-label]")) {
    if (element.closest("[data-admin-i18n-skip]")) continue;
    for (const attribute of ["placeholder", "title", "aria-label"] as const) {
      const value = element.getAttribute(attribute);
      if (value) {
        const localized = LEGACY_ARABIC_LABELS[value] || SUPPLIERS_INVOICES_ARABIC_LABELS[value] || ANALYTICS_ARABIC_LABELS[value] || DAILY_LOG_ARABIC_LABELS[value] || TEAM_ARABIC_LABELS[value] || ORDERS_ARABIC_LABELS[value];
        if (localized) {
          const originals = LEGACY_ORIGINAL_ATTRIBUTES.get(element) || new Map<string, string | null>();
          if (!originals.has(attribute)) originals.set(attribute, value);
          LEGACY_ORIGINAL_ATTRIBUTES.set(element, originals);
          element.setAttribute(attribute, localized);
        }
      }
    }
  }
}

const AdminI18nContext = createContext<AdminI18nContextType | undefined>(undefined);

export function AdminI18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>("ar");
  const [isMounted, setIsMounted] = useState(false);
  const userChangedLanguage = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as AdminLang;
    if (!userChangedLanguage.current && (saved === "ar" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  useEffect(() => {
    if (!isMounted || typeof document === "undefined") return;
    const root = document.querySelector("[data-admin-i18n-root]") as HTMLElement | null;
    if (!root) return;
    let applying = false;
    const apply = () => {
      if (applying) return;
      applying = true;
      observer.disconnect();
      localizeLegacyAdminDom(root, lang);
      observer.observe(root, { childList: true, subtree: true });
      applying = false;
    };
    let frame = 0;
    const scheduleApply = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(apply);
    };
    const observer = new MutationObserver((records) => {
      const onlySvgChanges = records.length > 0 && records.every((record) => {
        const target = record.target;
        return target instanceof Element && Boolean(target.closest("svg"));
      });
      if (!onlySvgChanges) scheduleApply();
    });
    scheduleApply();
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [isMounted, lang]);

  const setLang = (newLang: AdminLang) => {
    userChangedLanguage.current = true;
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);
    }
  };

  const toggleLang = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  const dir = lang === "ar" ? "rtl" : "ltr";

  // Helper to safely resolve nested keys e.g. "common.search"
  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: any = adminTranslations[lang];

    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        // Fallback to English dictionary if not found in current language
        let fallbackVal: any = adminTranslations["en"];
        for (const fk of keys) {
          if (fallbackVal && typeof fallbackVal === "object" && fk in fallbackVal) {
            fallbackVal = fallbackVal[fk];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackVal === "string" ? fallbackVal : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  // Always enforce English numerals (0-9)
  const formatNumber = (val: number | string): string => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatPrice = (amount: number | string): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "EGP 0";
    const formattedNum = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);

    return `EGP ${formattedNum}`;
  };

  const formatDate = (
    date: Date | string | number | null | undefined,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    if (!date) return "";
    const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) return "";
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return d.toLocaleDateString(lang === "ar" ? "ar-EG-u-nu-latn" : "en-US", options || defaultOptions);
  };

  return (
    <AdminI18nContext.Provider
      value={{
        lang,
        dir,
        setLang,
        toggleLang,
        t,
        formatPrice,
        formatNumber,
        formatDate,
      }}
    >
      <div suppressHydrationWarning data-admin-i18n-root dir={dir} className={lang === "ar" ? "font-sans-ar text-right" : ""}>
        {children}
      </div>
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  const context = useContext(AdminI18nContext);
  if (!context) {
    // Return a safe default fallback if used outside provider
    return {
      lang: "ar" as AdminLang,
      dir: "rtl" as "rtl" | "ltr",
      setLang: () => {},
      toggleLang: () => {},
      t: (path: string, fallback?: string) => fallback || path,
      formatPrice: (amount: number | string) => {
        const num = typeof amount === "string" ? parseFloat(amount) : amount;
        return `EGP ${isNaN(num) ? 0 : new Intl.NumberFormat("en-US").format(num)}`;
      },
      formatNumber: (val: number | string) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return isNaN(num) ? "0" : new Intl.NumberFormat("en-US").format(num);
      },
      formatDate: (date: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => {
        if (!date) return "";
        const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
        if (!d || isNaN(d.getTime())) return "";
        return d.toLocaleDateString("ar-EG-u-nu-latn", options || { day: "numeric", month: "short", year: "numeric" });
      },
    };
  }
  return context;
}

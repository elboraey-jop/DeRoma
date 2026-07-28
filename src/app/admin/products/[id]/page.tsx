import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImagePlus, PackagePlus, Star, Trash2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AdminImageGalleryField from "@/components/AdminImageGalleryField";
import {
  createProductReviewAction,
  createVariantAction,
  deleteProductAction,
  deleteVariantAction,
  setProductRelationsAction,
  updateProductAction,
} from "@/app/admin/products/[id]/actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [product, suppliers, allProducts] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        relatedFrom: { select: { relatedProductId: true } },
      },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }).catch(() => []),
    prisma.product
      .findMany({
        where: { id: { not: id } },
        select: { id: true, name: true, category: true },
        orderBy: { name: "asc" },
      })
      .catch(() => []),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="rounded-xl border border-[#942E3A]/15 bg-white p-2 text-[#942E3A]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#D8B46A]">
            Catalog management
          </p>
          <h1 className="mt-1 font-playfair text-3xl font-black">
            Edit product
          </h1>
        </div>
      </div>
      <form action={updateProductAction} className="space-y-5">
        <input type="hidden" name="id" value={product.id} />
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
            Step 1
          </p>
          <h2 className="mt-1 font-playfair text-xl font-bold">
            Product identity
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="field-label">Name</span>
              <input
                required
                name="name"
                defaultValue={product.name}
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Category</span>
              <select
                name="category"
                defaultValue={product.category}
                className="admin-input"
              >
                <option value="shoes">Shoes</option>
                <option value="bags">Bags</option>
                <option value="perfumes">Perfumes</option>
                <option value="accessories">Accessories</option>
              </select>
            </label>
            <label>
              <span className="field-label">Publishing status</span>
              <select
                name="status"
                defaultValue={product.status}
                className="admin-input"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <label>
              <span className="field-label">Subcategory</span>
              <input
                name="subcategory"
                defaultValue={product.subcategory || ""}
                placeholder="Gym / Evening / School"
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Brand</span>
              <input
                name="brand"
                defaultValue={product.brand || ""}
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Material</span>
              <input
                name="material"
                defaultValue={product.material || ""}
                className="admin-input"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="field-label">Description</span>
              <textarea
                name="description"
                rows={4}
                defaultValue={product.description || ""}
                className="admin-input resize-y"
              />
            </label>
          </div>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
            Step 2
          </p>
          <h2 className="mt-1 font-playfair text-xl font-bold">
            Pricing, sourcing & visibility
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label>
              <span className="field-label">Selling price</span>
              <input
                required
                name="price"
                type="number"
                step="0.01"
                defaultValue={Number(product.price)}
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Compare-at price</span>
              <input
                name="compareAtPrice"
                type="number"
                step="0.01"
                defaultValue={
                  product.compareAtPrice ? Number(product.compareAtPrice) : ""
                }
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Wholesale price</span>
              <input
                name="wholesalePrice"
                type="number"
                step="0.01"
                defaultValue={
                  product.wholesalePrice ? Number(product.wholesalePrice) : ""
                }
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Additional cost</span>
              <input
                name="additionalCost"
                type="number"
                step="0.01"
                defaultValue={
                  product.additionalCost ? Number(product.additionalCost) : ""
                }
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Supplier</span>
              <select
                name="supplierId"
                defaultValue={product.supplierId || ""}
                className="admin-input"
              >
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Low-stock alert at</span>
              <input
                name="lowStockLimit"
                type="number"
                min="0"
                defaultValue={product.lowStockLimit}
                className="admin-input"
              />
            </label>
            <label>
              <span className="field-label">Product badge</span>
              <input
                name="badge"
                defaultValue={product.badge || ""}
                placeholder="New / Limited"
                className="admin-input"
              />
            </label>
            <div className="flex items-center gap-4 sm:col-span-2 sm:pt-6">
              <label className="flex items-center gap-2 text-xs font-bold">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={product.featured}
                />{" "}
                For You
              </label>
              <label className="flex items-center gap-2 text-xs font-bold">
                <input
                  name="bestSeller"
                  type="checkbox"
                  defaultChecked={product.bestSeller}
                />{" "}
                Best Seller
              </label>
              <span className="inline-flex items-center gap-1 text-xs text-[#6B1F2A]/60">
                <Star className="h-3.5 w-3.5 text-[#D8B46A]" />{" "}
                {Number(product.rating).toFixed(1)} ({product.reviewsCount})
              </span>
            </div>
          </div>
        </section>
        <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-[#D8B46A]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
                Step 3
              </p>
              <h2 className="font-playfair text-xl font-bold">Gallery</h2>
            </div>
          </div>
          <AdminImageGalleryField defaultValue={product.images.join("\n")} />
        </section>
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-[#942E3A] px-6 py-3 text-xs font-bold text-[#FFF9EB]"
          >
            Save product
          </button>
        </div>
      </form>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <PackagePlus className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold">Variants & stock</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-xs">
            <thead className="border-b border-[#942E3A]/10 text-[10px] uppercase tracking-wide text-[#6B1F2A]/55">
              <tr>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Color</th>
                <th className="pb-3">Size / volume</th>
                <th className="pb-3 text-right">Stock</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#942E3A]/8">
              {product.variants.map((variant) => (
                <tr key={variant.id}>
                  <td className="py-3 font-bold text-[#942E3A]">
                    {variant.sku}
                  </td>
                  <td className="py-3">{variant.color}</td>
                  <td className="py-3">{variant.size}</td>
                  <td className="py-3 text-right font-bold">{variant.stock}</td>
                  <td className="py-3 text-right">
                    <form action={deleteVariantAction}>
                      <input type="hidden" name="id" value={variant.id} />
                      <input
                        type="hidden"
                        name="productId"
                        value={product.id}
                      />
                      <button
                        type="submit"
                        aria-label={`Delete ${variant.sku}`}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form
          action={createVariantAction}
          className="mt-5 grid gap-2 sm:grid-cols-4"
        >
          <input type="hidden" name="productId" value={product.id} />
          <input
            required
            name="sku"
            placeholder="SKU"
            className="admin-input"
          />
          <input
            required
            name="color"
            placeholder="Color"
            className="admin-input"
          />
          <input
            required
            name="size"
            placeholder="Size / ml"
            className="admin-input"
          />
          <div className="flex gap-2">
            <input
              required
              name="stock"
              type="number"
              min="0"
              placeholder="Stock"
              className="admin-input min-w-0 flex-1"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#D8B46A] px-3 py-2.5 text-[10px] font-bold text-[#942E3A]"
            >
              Add
            </button>
          </div>
        </form>
      </section>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">
          Merchandising
        </p>
        <h2 className="mt-1 font-playfair text-xl font-bold">
          Similar products
        </h2>
        <form action={setProductRelationsAction} className="mt-4">
          <input type="hidden" name="productId" value={product.id} />
          <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
            {allProducts.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 rounded-xl bg-[#FFF9EB] px-3 py-2 text-xs"
              >
                <input
                  type="checkbox"
                  name="relatedProductIds"
                  value={item.id}
                  defaultChecked={product.relatedFrom.some(
                    (relation) => relation.relatedProductId === item.id,
                  )}
                />
                <span className="min-w-0 truncate font-semibold">
                  {item.name}
                </span>
                <span className="ml-auto text-[9px] capitalize text-[#6B1F2A]/50">
                  {item.category}
                </span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="mt-4 rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
          >
            Save similar products
          </button>
        </form>
      </section>
      <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-[#D8B46A]" />
          <h2 className="font-playfair text-xl font-bold">Product reviews</h2>
        </div>
        <form
          action={createProductReviewAction}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <input type="hidden" name="productId" value={product.id} />
          <label>
            <span className="field-label">Customer name</span>
            <input required name="customerName" className="admin-input" />
          </label>
          <label>
            <span className="field-label">Rating</span>
            <select name="rating" defaultValue="5" className="admin-input">
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}/5
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Title</span>
            <input name="title" className="admin-input" />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Review</span>
            <textarea
              required
              name="body"
              rows={3}
              className="admin-input resize-y"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-bold">
            <input name="verifiedPurchase" type="checkbox" /> Verified purchase
          </label>
          <button
            type="submit"
            className="justify-self-end rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]"
          >
            Add approved review
          </button>
        </form>
        <div className="mt-5 space-y-2">
          {product.reviews.map((review) => (
            <article key={review.id} className="rounded-xl bg-[#FFF9EB]/70 p-3">
              <div className="flex justify-between gap-2">
                <p className="text-xs font-bold text-[#942E3A]">
                  {review.customerName} · {review.rating}/5
                </p>
                <span className="text-[9px] uppercase text-[#6B1F2A]/50">
                  {review.status}
                </span>
              </div>
              {review.title && (
                <p className="mt-1 text-xs font-semibold">{review.title}</p>
              )}
              <p className="mt-1 text-xs text-[#6B1F2A]/70">{review.body}</p>
            </article>
          ))}
          {!product.reviews.length && (
            <p className="text-xs text-[#6B1F2A]/55">
              No reviews for this product yet.
            </p>
          )}
        </div>
      </section>
      <section className="rounded-3xl border border-red-200 bg-red-50 p-5 sm:p-7">
        <h2 className="font-playfair text-xl font-bold text-red-800">
          Danger zone
        </h2>
        <p className="mt-1 text-xs text-red-700/70">
          Products linked to existing orders cannot be deleted; set them to
          draft instead.
        </p>
        <form action={deleteProductAction} className="mt-4">
          <input type="hidden" name="productId" value={product.id} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-bold text-white"
          >
            <Trash2 className="h-4 w-4" /> Delete product
          </button>
        </form>
      </section>
    </div>
  );
}

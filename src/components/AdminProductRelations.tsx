import { Link2 } from "lucide-react";
import { setProductRelationsAction } from "@/app/admin/products/[id]/actions";

interface RelationProduct { id: string; name: string; category: string; }

export default function AdminProductRelations({ productId, products, selectedIds }: { productId: string; products: RelationProduct[]; selectedIds: string[] }) {
  return <section className="rounded-3xl border border-[#942E3A]/10 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-[#D8B46A]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Merchandising</p><h2 className="font-playfair text-xl font-bold">Similar products</h2></div></div><p className="mt-1 text-xs text-[#6B1F2A]/60">Choose products to show in the related-products section.</p><form action={setProductRelationsAction} className="mt-4"><input type="hidden" name="productId" value={productId} /><div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">{products.map((item) => <label key={item.id} className="flex items-center gap-2 rounded-xl bg-[#FFF9EB] px-3 py-2 text-xs"><input type="checkbox" name="relatedProductIds" value={item.id} defaultChecked={selectedIds.includes(item.id)} /><span className="min-w-0 truncate font-semibold">{item.name}</span><span className="ml-auto text-[9px] capitalize text-[#6B1F2A]/50">{item.category}</span></label>)}</div><button type="submit" className="mt-4 rounded-xl bg-[#942E3A] px-4 py-2.5 text-xs font-bold text-[#FFF9EB]">Save similar products</button></form></section>;
}

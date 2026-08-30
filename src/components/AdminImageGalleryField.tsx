"use client";

import { DragEvent, useEffect, useMemo, useState } from "react";
import { GripVertical, ImagePlus, LoaderCircle, Star, X } from "lucide-react";
import { uploadAdminImage } from "@/lib/clientImageUpload";

export default function AdminImageGalleryField({ defaultValue = "" }: { defaultValue?: string }) {
  const parseImages = (value: string) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  const [images, setImages] = useState(() => parseImages(defaultValue));

  useEffect(() => {
    setImages(parseImages(defaultValue));
  }, [defaultValue]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");
  const imageList = useMemo(() => images, [images]);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadAdminImage(file));
      }
      setImages((current) => [...current, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const makeMain = (index: number) => setImages((current) => [current[index], ...current.filter((_, itemIndex) => itemIndex !== index)]);
  const moveImage = (from: number, to: number) => setImages((current) => {
    if (to < 0 || to >= current.length) return current;
    const next = [...current];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  });
  const handleDrop = (event: DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) moveImage(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  return <section className="mt-5 overflow-hidden rounded-3xl border border-[#942E3A]/10 bg-[#FFFDFC] shadow-[0_12px_35px_rgba(67,25,31,0.06)]">
    <input type="hidden" name="images" value={images.join("\n")} />
    <div className="border-b border-[#942E3A]/8 bg-[#FFF9EB]/55 px-5 py-4 sm:px-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B46A]">Visual identity</p><h3 className="mt-1 font-playfair text-xl font-bold text-[#942E3A]">Main image & gallery</h3><p className="mt-1 text-xs text-[#6B1F2A]/60">The first image is your main product image. Drag cards to change the order.</p></div><label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D8B46A] px-4 py-3 text-xs font-bold text-[#942E3A] shadow-sm ${uploading ? "pointer-events-none opacity-60" : ""}`}>{uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}{uploading ? "Uploading..." : "Add images"}<input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={uploading} onChange={(event) => { void uploadFiles(event.target.files); event.target.value = ""; }} className="sr-only" /></label></div></div>
    <div className="p-5 sm:p-6">
      {!imageList.length ? <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8B46A]/55 bg-[#FFF9EB]/45 text-center transition hover:border-[#942E3A]/45 hover:bg-[#FFF9EB]"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#D8B46A] shadow-sm"><ImagePlus className="h-6 w-6" /></span><strong className="mt-4 text-sm text-[#942E3A]">Choose product images</strong><span className="mt-1 text-xs text-[#6B1F2A]/55">You can select multiple images at once · PNG, JPG or WebP · up to 8 MB each</span><input type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={uploading} onChange={(event) => { void uploadFiles(event.target.files); event.target.value = ""; }} className="sr-only" /></label> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]"><div className="relative overflow-hidden rounded-2xl bg-[#FFF9EB]"><img src={imageList[0]} alt="Main product preview" className="aspect-[4/3] h-full w-full object-cover" /><div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#942E3A] px-3 py-1.5 text-[10px] font-bold text-[#FFF9EB]"><Star className="h-3.5 w-3.5 fill-[#D8B46A] text-[#D8B46A]" /> Main image</div><button type="button" onClick={() => removeImage(0)} aria-label="Remove main image" className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white transition hover:bg-red-600"><X className="h-4 w-4" /></button></div><div className="min-w-0"><div className="mb-3 flex items-center justify-between gap-2"><p className="text-xs font-bold text-[#942E3A]">Gallery order <span className="font-normal text-[#6B1F2A]/55">({imageList.length} images)</span></p><p className="text-[10px] text-[#6B1F2A]/50">Drag to reorder</p></div><div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">{imageList.map((src, index) => <div key={`${src}-${index}`} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, index)} onDragEnd={() => setDraggedIndex(null)} className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-[#FFF9EB] transition active:cursor-grabbing ${index === 0 ? "border-[#942E3A] ring-2 ring-[#D8B46A]/45" : "border-[#942E3A]/10"} ${draggedIndex === index ? "scale-95 opacity-50" : ""}`}><img src={src} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" /><div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent px-1.5 pb-1.5 pt-4"><button type="button" onClick={() => makeMain(index)} disabled={index === 0} className="rounded-md p-1 text-white disabled:opacity-40" title="Make main"><Star className={`h-3.5 w-3.5 ${index === 0 ? "fill-[#D8B46A] text-[#D8B46A]" : ""}`} /></button><button type="button" onClick={() => removeImage(index)} className="rounded-md p-1 text-white hover:bg-red-600" title="Remove"><X className="h-3.5 w-3.5" /></button></div><span className="absolute left-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-white/90 px-1 text-[9px] font-black text-[#942E3A]">{index + 1}</span><GripVertical className="pointer-events-none absolute right-1.5 top-1.5 h-4 w-4 text-white drop-shadow" /></div>)}</div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => moveImage(1, 0)} disabled={imageList.length < 2} className="rounded-lg border border-[#942E3A]/12 px-2.5 py-1.5 text-[10px] font-bold text-[#942E3A] disabled:opacity-40">Make second image main</button><span className="flex items-center text-[10px] text-[#6B1F2A]/55">The first card is shown first on the storefront.</span></div></div></div>}
      {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  </section>;
}

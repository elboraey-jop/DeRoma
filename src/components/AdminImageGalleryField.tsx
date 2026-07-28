"use client";

import { useMemo, useState } from "react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";

export default function AdminImageGalleryField({ defaultValue = "" }: { defaultValue?: string }) {
  const [images, setImages] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const imageList = useMemo(() => images.split("\n").map((item) => item.trim()).filter(Boolean), [images]);

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set("file", file);
        const response = await fetch("/admin/api/upload", { method: "POST", body });
        const result = await response.json() as { url?: string; error?: string };
        if (!response.ok || !result.url) throw new Error(result.error || "Image upload failed.");
        uploaded.push(result.url);
      }
      if (uploaded.length) setImages((current) => [current.trim(), ...uploaded].filter(Boolean).join("\n"));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => setImages(imageList.filter((_, itemIndex) => itemIndex !== index).join("\n"));

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <textarea name="images" value={images} onChange={(event) => setImages(event.target.value)} rows={5} className="admin-input resize-y" placeholder="Upload images or paste one image URL per line. The first image is the main image." />
        <label className={`inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#D8B46A] px-4 py-3 text-xs font-bold text-[#942E3A] ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "Uploading..." : "Upload images"}
          <input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => { void uploadFiles(event.target.files); event.target.value = ""; }} className="sr-only" />
        </label>
      </div>
      <p className="mt-1 text-[10px] text-[#6B1F2A]/55">PNG, JPG or WebP up to 8 MB each. Drag ordering by placing the main image first in the URL list.</p>
      {error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      {imageList.length > 0 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{imageList.map((src, index) => <div key={`${src}-${index}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#FFF9EB]"><img src={src} alt={`Product preview ${index + 1}`} className="h-full w-full object-cover" />{index === 0 && <span className="absolute bottom-1 left-1 rounded bg-[#942E3A] px-1.5 py-0.5 text-[8px] font-bold text-white">Main</span>}<button type="button" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"><X className="h-3 w-3" /></button></div>)}</div>}
    </div>
  );
}

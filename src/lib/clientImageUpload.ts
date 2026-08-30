const maxImageSize = 8 * 1024 * 1024;
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadSignature = {
  apiKey?: string;
  cloudName?: string;
  folder?: string;
  signature?: string;
  timestamp?: number;
  error?: string;
};

type CloudinaryUploadResult = {
  secure_url?: string;
  error?: { message?: string };
};

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(
      response.ok
        ? "The upload service returned an empty response. Please try again."
        : `Image upload failed (HTTP ${response.status}). Please try again.`,
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(
      response.ok
        ? "The upload service returned an invalid response. Please try again."
        : `Image upload failed (HTTP ${response.status}). Please try again.`,
    );
  }
}

export async function uploadAdminImage(file: File): Promise<string> {
  if (!supportedImageTypes.has(file.type)) {
    throw new Error("Only JPG, PNG, and WebP images are allowed.");
  }
  if (file.size > maxImageSize) {
    throw new Error("Image size cannot exceed 8 MB.");
  }

  const signatureResponse = await fetch("/admin/api/upload/signature", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  const signature = await readJson<UploadSignature>(signatureResponse);
  if (
    !signatureResponse.ok ||
    !signature.apiKey ||
    !signature.cloudName ||
    !signature.folder ||
    !signature.signature ||
    !signature.timestamp
  ) {
    throw new Error(signature.error || "Unable to prepare the image upload.");
  }

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", signature.apiKey);
  body.set("folder", signature.folder);
  body.set("signature", signature.signature);
  body.set("timestamp", String(signature.timestamp));

  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/image/upload`,
    { method: "POST", body },
  );
  const result = await readJson<CloudinaryUploadResult>(cloudinaryResponse);
  if (!cloudinaryResponse.ok || !result.secure_url) {
    throw new Error(
      result.error?.message ||
        `Image upload failed (HTTP ${cloudinaryResponse.status}). Please try again.`,
    );
  }

  return result.secure_url;
}

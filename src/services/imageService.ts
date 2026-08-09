const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

export interface UploadResult {
  url: string;
  publicId: string;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_FORMATS.includes(file.type)) {
    return "Invalid format. Accepted: JPG, PNG, WebP";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
  }
  return null;
}

export async function uploadImage(
  file: File,
  folder?: string,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "tournament",
  );
  if (folder) {
    formData.append("folder", folder);
  }
  console.log("Uploading image to Cloudinary...");
  console.log(
    "Cloudinary Cloud Name:",
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  );
  console.log(
    "Cloudinary Upload Preset:",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  );
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

import sharp from "sharp";
import { randomBytes } from "crypto";
import { getSupabase, SUPABASE_BUCKET, isStorageEnabled } from "./supabase";

interface UploadResult {
  url: string;
  path: string;
  sizeBytes: number;
}

export async function uploadImageToStorage(buffer: Buffer, folder: string): Promise<UploadResult> {
  if (!isStorageEnabled()) throw Object.assign(new Error("ระบบอัพโหลดยังไม่ได้ตั้งค่า"), { status: 503 });

  const { data: webpBuffer, info } = await sharp(buffer, { failOn: "error" })
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  const path = `${folder}/${randomBytes(12).toString("hex")}.webp`;
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, webpBuffer, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;

  const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path, sizeBytes: info.size };
}

export async function deleteFromStorage(path: string): Promise<void> {
  if (!isStorageEnabled()) return;
  await getSupabase().storage.from(SUPABASE_BUCKET).remove([path]);
}

// Given a public URL, extract the storage object path (everything after /<bucket>/)
export function pathFromPublicUrl(url: string): string | null {
  const match = url.match(new RegExp(`/${SUPABASE_BUCKET}/(.+)$`));
  return match ? match[1] : null;
}

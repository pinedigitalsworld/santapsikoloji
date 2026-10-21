import { guard } from "@/lib/auth";
import { cloudinaryConfigured, signUpload } from "@/lib/cloudinary";

/** Tarayıcının görseli doğrudan Cloudinary'ye yükleyebilmesi için kısa ömürlü imza verir. */
export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  return Response.json(cloudinaryConfigured() ? { mode: "cloudinary", ...signUpload() } : { mode: "local" });
}

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const authorId = formData.get("author_id") as string | null;

    if (!file || !authorId) {
      return NextResponse.json({ error: "file and author_id required" }, { status: 400 });
    }

    // Validate file type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP allowed" }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large — max 2MB" }, { status: 400 });
    }

    const supabase = getSupabase();
    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const fileName = `${authorId}.${ext}`;
    const bytes = await file.arrayBuffer();

    // Upload to Supabase Storage bucket "author-avatars"
    const { error: uploadError } = await supabase.storage
      .from("author-avatars")
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: true, // overwrite if exists
      });

    if (uploadError) {
      // If bucket doesn't exist, create it first
      if (uploadError.message.includes("Bucket not found")) {
        await supabase.storage.createBucket("author-avatars", { public: true });
        await supabase.storage.from("author-avatars").upload(fileName, bytes, {
          contentType: file.type,
          upsert: true,
        });
      } else {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("author-avatars")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Save override URL to author_stats table
    await supabase.from("author_stats").upsert({
      author_id: authorId,
      avatar_url_override: publicUrl,
      updated_at: new Date().toISOString(),
    }, { onConflict: "author_id" });

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}
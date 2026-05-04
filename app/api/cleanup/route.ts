import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify secret key (optional security)
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("key");

  if (secret !== process.env.CLEANUP_SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    // Archive old images (6 months)
    const { data: oldArticles, error: fetchError } = await supabase
      .from("articles")
      .select("id, featured_image")
      .lt("published_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString())
      .eq("media_archived", false);

    if (fetchError) throw fetchError;

    let archivedCount = 0;

    for (const article of oldArticles || []) {
      // Delete from storage if exists
      if (article.featured_image) {
        const path = article.featured_image.split("/").pop();
        if (path) {
          await supabase.storage.from("news-images").remove([`articles/${path}`]);
        }
      }

      // Delete article_images records
      await supabase.from("article_images").delete().eq("article_id", article.id);

      // Mark article as archived
      await supabase
        .from("articles")
        .update({ media_archived: true, featured_image: null })
        .eq("id", article.id);

      archivedCount++;
    }

    // Clean up expired ads
    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("advertisements")
      .update({ is_active: false })
      .lt("end_date", today)
      .eq("is_active", true);

    return NextResponse.json({
      success: true,
      archived: archivedCount,
      message: `${archivedCount} पुराना समाचारको छवि अभिलेख गरियो`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Cleanup failed" },
      { status: 500 }
    );
  }
}

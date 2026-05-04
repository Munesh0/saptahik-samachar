import { NextResponse } from "next/server";
import { postToFacebook } from "@/lib/facebook";

export async function POST(request: Request) {
  try {
    const { title, excerpt, slug, featuredImage } = await request.json();

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Build article URL (use your domain)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saptahiksamachar.com.np";
    const articleUrl = `${baseUrl}/news/${slug}`;

    const result = await postToFacebook(title, excerpt || title, articleUrl, featuredImage);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

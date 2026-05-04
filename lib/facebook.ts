// Facebook Graph API posting utility
// Requires: FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in .env.local

interface FacebookPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export async function postToFacebook(
  title: string,
  excerpt: string,
  articleUrl: string,
  imageUrl?: string
): Promise<FacebookPostResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return {
      success: false,
      error: "Facebook credentials not configured. Add FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN to .env.local",
    };
  }

  const message = `${title}\n\n${excerpt}\n\nपूरा पढ्नुहोस्: ${articleUrl}`;

  try {
    const params = new URLSearchParams({
      message,
      link: articleUrl,
      access_token: accessToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed?${params.toString()}`,
      { method: "POST" }
    );

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        error: data.error.message || "Facebook API error",
      };
    }

    return {
      success: true,
      postId: data.id,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to post to Facebook",
    };
  }
}

// Check if Facebook sharing is configured
export function isFacebookConfigured(): boolean {
  return !!(
    process.env.FACEBOOK_PAGE_ID &&
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  );
}

// ============================================================
// Helper: Strip Nepali dateline (e.g. "भद्रपुर १२, बैशाख /")
// ============================================================
function stripDateline(text: string): string {
  const trimmed = text.trim();

  // Method 1: Look for " / " in first 60 chars (most robust)
  const slashIndex = trimmed.indexOf(" / ");
  if (slashIndex > 0 && slashIndex < 60) {
    const beforeSlash = trimmed.substring(0, slashIndex).trim();
    // If it contains Nepali script and is short, it's a dateline
    if (/[\u0900-\u097F]/.test(beforeSlash) && beforeSlash.length < 50) {
      return trimmed.substring(slashIndex + 3).trim();
    }
  }

  // Method 2: Regex fallback for month-name patterns
  const datelineRegex =
    /^[\u0900-\u097F\s\d०-९,]+(?:जनवरी|फेब्रुअरी|मार्च|अप्रिल|मे|जुन|जुलाई|अगस्ट|सेप्टेम्बर|अक्टोबर|नोभेम्बर|डिसेम्बर|बैशाख|जेठ|असार|साउन|भदौ|असोज|कार्तिक|मंसिर|पुष|माघ|फागुन|चैत)[\s]*\/\s*/;
  if (datelineRegex.test(trimmed)) {
    return trimmed.replace(datelineRegex, "").trim();
  }

  return trimmed;
}

// ============================================================
// META DESCRIPTION
// ============================================================
export function generateMetaDescription(
  title: string,
  content: string,
  excerpt: string
): string {
  // Priority 1: Use clean excerpt if available
  if (excerpt && excerpt.trim().length > 10) {
    return excerpt.trim().substring(0, 160);
  }

  // Priority 2: First sentence from content (dateline stripped)
  let textContent = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  textContent = stripDateline(textContent);

  const firstSentence = textContent.split(/[।!?.]/)[0];
  if (firstSentence && firstSentence.length > 10) {
    return firstSentence.trim().substring(0, 160);
  }

  // Priority 3: Fallback to title
  const cleanTitle = title.trim();
  if (cleanTitle.length > 0) {
    return `${cleanTitle} - साप्ताहिक समाचार, भद्रपुर, झापा`.substring(0, 160);
  }

  return "साप्ताहिक समाचार - भद्रपुर, झापाबाट प्रकाशित हुने विश्वसनीय समाचार पत्रिका।";
}

// ============================================================
// META TITLE
// ============================================================
export function generateMetaTitle(title: string, category?: string): string {
  const cleanTitle = title.trim();
  if (!cleanTitle) return "साप्ताहिक समाचार - भद्रपुर, झापा";

  // Best practice: 50-60 chars for Google display
  if (category) {
    return `${cleanTitle} | ${category} | साप्ताहिक समाचार`.substring(0, 60);
  }
  return `${cleanTitle} | साप्ताहिक समाचार`.substring(0, 60);
}

// ============================================================
// KEYWORDS (meta keywords tag)
// ============================================================
export function extractKeywords(title: string, content: string): string[] {
  const text = `${title} ${content}`
    .replace(/<[^>]*>/g, " ")
    .replace(/[।,!?.\-]/g, " ");

  const commonNepaliWords = [
    "र", "को", "मा", "ले", "छ", "छन्", "हो", "गरे", "भए", "भयो",
    "एक", "दुई", "यो", "त्यो", "उनको", "हाम्रो", "जसले", "जुन",
    "गर्दै", "भने", "पछि", "अनुसार", "जस", "यस", "क्रम", "मध्ये",
  ];

  const words = text
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter((w) => !commonNepaliWords.includes(w.toLowerCase()));

  const frequency: { [key: string]: number } = {};
  words.forEach((w) => {
    frequency[w] = (frequency[w] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// ============================================================
// EXCERPT (सारांश)
// ============================================================
export function generateExcerpt(title: string, content: string): string {
  let textContent = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Strip dateline BEFORE taking sentences
  textContent = stripDateline(textContent);

  const sentences = textContent
    .split(/[।!?.]/)
    .filter((s) => s.trim().length > 5);

  if (sentences.length >= 2) {
    return `${sentences[0].trim()}। ${sentences[1].trim()}।`.substring(0, 250);
  }

  if (sentences.length === 1) {
    return sentences[0].trim().substring(0, 250);
  }

  if (title.trim()) {
    return `${title.trim()} सम्बन्धी विस्तृत समाचार।`.substring(0, 250);
  }

  return "विस्तृत समाचार पढ्नुहोस्।";
}

// ============================================================
// SEO BEST PRACTICE: JSON-LD Structured Data
// Helps Google show articles in "Top Stories" & rich results
// ============================================================
interface ArticleSchemaInput {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string | null;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  categoryName?: string;
}

export function generateArticleSchema(article: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage ? [article.featuredImage] : [],
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: article.authorName || "साप्ताहिक समाचार",
    },
    publisher: {
      "@type": "Organization",
      name: "साप्ताहिक समाचार",
      logo: {
        "@type": "ImageObject",
        url:
          process.env.NEXT_PUBLIC_SITE_URL
            ? `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
            : "https://saptahiksamachar.com.np/logo.png",
      },
    },
    articleSection: article.categoryName || "समाचार",
    inLanguage: "ne-NP",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://saptahiksamachar.com.np"}/news/${article.slug}`,
    },
  };
}

// ============================================================
// Breadcrumb Structured Data
// ============================================================
export function generateBreadcrumbSchema(
  slug: string,
  title: string,
  categorySlug?: string,
  categoryName?: string
) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://saptahiksamachar.com.np";
  const items: any[] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "होम",
      item: base,
    },
  ];

  if (categoryName && categorySlug) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: categoryName,
      item: `${base}/category/${categorySlug}`,
    });
    items.push({
      "@type": "ListItem",
      position: 3,
      name: title,
      item: `${base}/news/${slug}`,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: title,
      item: `${base}/news/${slug}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

// ============================================================
// Open Graph / Social Sharing Metadata
// ============================================================
export function generateOpenGraph(article: {
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: string | null;
  categoryName?: string;
}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://saptahiksamachar.com.np";
  return {
    ogTitle: article.title,
    ogDescription: article.excerpt.substring(0, 200),
    ogImage:
      article.featuredImage || `${base}/default-og.jpg`,
    ogUrl: `${base}/news/${article.slug}`,
    ogType: "article",
    ogLocale: "ne_NP",
    ogSiteName: "साप्ताहिक समाचार",
    articleSection: article.categoryName,
    articleTag: article.categoryName,
  };
}
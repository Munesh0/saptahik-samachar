"use client";

interface ArticleImage {
  id: string;
  image_url: string;
  sort_order: number;
  is_banner: boolean;
}

interface ArticleContentProps {
  content: string;
  featuredImage?: string | null;
  images?: ArticleImage[];
}

export default function ArticleContent({
  content,
  featuredImage,
  images = [],
}: ArticleContentProps) {
  // Extract videos
  const videoRegex = /<iframe[^>]*>[\s\S]*?<\/iframe>/gi;
  const videos = (content || "").match(videoRegex) || [];
  const contentWithoutVideos = (content || "").replace(videoRegex, "").trim();

  // Sort all images by sort_order
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

  // Banner: use is_banner=true image, or fallback to featuredImage prop
  const bannerImage = sortedImages.find((img) => img.is_banner === true);
  const bannerUrl = bannerImage?.image_url || featuredImage || null;

  // Inline images: exclude banner by URL match AND is_banner flag
  const inlineImages = sortedImages.filter((img) => {
    if (img.is_banner === true) return false;
    if (bannerUrl && img.image_url === bannerUrl) return false;
    return true;
  });

  // Split content into paragraphs
  const rawBlocks = contentWithoutVideos
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Plain text → HTML with <br/> for single Enter keys
  const paragraphs = rawBlocks.map((block) => {
    const hasHtml = /<[a-z][\s\S]*>/i.test(block);
    if (hasHtml) return block;
    const safe = block
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");
    return `<p class="mb-5 leading-loose text-lg text-gray-800">${safe}</p>`;
  });

  // Distribute images between paragraphs
  const elements: React.ReactNode[] = [];
  let imgIdx = 0;

  const insertFrequency = Math.max(
    1,
    Math.floor(paragraphs.length / (inlineImages.length + 1))
  );

  paragraphs.forEach((para, idx) => {
    elements.push(
      <div key={`text-${idx}`} dangerouslySetInnerHTML={{ __html: para }} />
    );

    if (imgIdx < inlineImages.length && (idx + 1) % insertFrequency === 0) {
      elements.push(
        <figure key={`img-${imgIdx}`} className="my-8">
          <img
            src={inlineImages[imgIdx].image_url}
            alt="Article image"
            className="w-full h-auto rounded-lg object-cover max-h-[450px]"
            loading="lazy"
          />
        </figure>
      );
      imgIdx++;
    }
  });

  const remainingImages = inlineImages.slice(imgIdx);

  return (
    <article className="max-w-none">
      {/* Banner — ONCE only */}
      {bannerUrl && (
        <figure className="mb-8">
          <img
            src={bannerUrl}
            alt="Featured"
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
            loading="eager"
          />
        </figure>
      )}

      {/* Videos at top */}
      {videos.length > 0 && (
        <div className="space-y-6 mb-10">
          {videos.map((videoHtml, idx) => (
            <div
              key={`video-${idx}`}
              className="w-full rounded-lg overflow-hidden bg-black aspect-video"
              dangerouslySetInnerHTML={{ __html: videoHtml }}
            />
          ))}
        </div>
      )}

      {/* Content with inline images */}
      {elements}

      {/* Remaining images at bottom */}
      {remainingImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {remainingImages.map((img) => (
            <figure key={img.id} className="m-0">
              <img
                src={img.image_url}
                alt="Article image"
                className="w-full h-64 object-cover rounded-lg"
                loading="lazy"
              />
            </figure>
          ))}
        </div>
      )}
    </article>
  );
}
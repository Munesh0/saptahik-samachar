"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useImageCompression } from "@/hooks/useImageCompression";
import { createClient } from "@/lib/supabase/client";
import { detectCategory, getAllCategories } from "@/lib/categoryDetector";
import { generateMetaDescription, generateMetaTitle, generateExcerpt } from "@/lib/seoGenerator";
import Logo from "@/components/Logo";
import { getTodayBS } from "@/lib/nepaliDate";

interface Category {
  id: string;
  name: string;
}

interface UploadedImage {
  id: string;
  file: File | null;
  preview: string;
  url?: string;
  isBanner: boolean;
}

// Inner component that uses useSearchParams (must be inside Suspense)
function WriteArticleInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const supabase = createClient();
  const { compressImage, compressing } = useImageCompression();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("draft");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [categories, setCategories] = useState<Category[]>(getAllCategories());
  const [detectedCategory, setDetectedCategory] = useState<string>("");
  const [showDetection, setShowDetection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [shareToFacebook, setShareToFacebook] = useState(true);
  const [facebookResult, setFacebookResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "media">("content");
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if ((title.trim() || content.trim()) && !editId) {
      const detected = detectCategory(title, content);
      if (detected.confidence > 0) {
        setDetectedCategory(detected.categoryId);
        if (!categoryId || categoryId === detectedCategory) {
          setCategoryId(detected.categoryId);
        }
        setShowDetection(true);
      }
    }
  }, [title, content, editId, categoryId, detectedCategory]);

  useEffect(() => {
    if (title.trim()) {
      const autoExcerpt = generateExcerpt(title, content);
      if (!excerpt || excerpt === autoExcerpt) {
        setExcerpt(autoExcerpt);
      }
      const categoryName = categories.find((c) => c.id === categoryId)?.name;
      const autoMetaTitle = generateMetaTitle(title, categoryName);
      if (!metaTitle || metaTitle === autoMetaTitle) {
        setMetaTitle(autoMetaTitle);
      }
      if (!metaDescription) {
        setMetaDescription(generateMetaDescription(title, content, excerpt || autoExcerpt));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, categoryId]);

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name").order("sort_order");
      if (data && data.length > 0) setCategories(data);
    };
    loadCategories();
  }, [supabase]);

  // ← TROUBLESHOOTING: Separate fetches with detailed logging
  useEffect(() => {
    if (!editId) return;

    const loadArticle = async () => {
      console.log("[DEBUG] Loading article:", editId);

      // 1) Load article
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", editId)
        .single();

      if (error) {
        console.error("[DEBUG] Article load error:", error);
        setSaveError("लोड गर्न असफल: " + error.message);
        return;
      }

      console.log("[DEBUG] Article loaded:", data?.title);
      setTitle(data.title || "");
      setSlug(data.slug || "");
      setExcerpt(data.excerpt || "");
      setContent(data.content || "");
      setCategoryId(data.category_id || "");
      setStatus(data.status || "draft");
      setMetaTitle(data.meta_title || "");
      setMetaDescription(data.meta_description || "");
      setViewCount(typeof data.view_count === "number" ? data.view_count : null);

      // 2) Load images separately (no sort_order to avoid column-missing errors)
      console.log("[DEBUG] Fetching article_images for article_id:", editId);
      const { data: imgData, error: imgError } = await supabase
        .from("article_images")
        .select("*")
        .eq("article_id", editId);

      if (imgError) {
        console.error("[DEBUG] Image load ERROR:", imgError);
        setSaveError("छवि लोड गर्न असफल: " + imgError.message);
        setImages([]);
        return;
      }

      console.log("[DEBUG] article_images raw response:", imgData);

      if (!imgData || imgData.length === 0) {
        console.warn("[DEBUG] No rows in article_images for this article.");
        setImages([]);
        return;
      }

      const loadedImages: UploadedImage[] = imgData.map((img: any, idx: number) => {
        console.log(`[DEBUG] Image #${idx}:`, {
          id: img.id,
          image_url: img.image_url,
          is_banner: img.is_banner,
          article_id: img.article_id,
        });
        return {
          id: img.id,
          file: null,
          preview: img.image_url,
          url: img.image_url,
          isBanner: img.is_banner === true,
        };
      });

      console.log("[DEBUG] Setting images state:", loadedImages.length);
      setImages(loadedImages);
    };

    loadArticle();
  }, [editId, supabase]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 80);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!editId && !slugEdited) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file, 1200, 0.7);
        const isFirstImage = images.length === 0 && newImages.length === 0;
        newImages.push({
          id: Math.random().toString(36).substring(7),
          file: compressed.file,
          preview: compressed.preview,
          isBanner: isFirstImage,
        });
      } catch (err) {
        console.error("Compression failed:", err);
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploadingImages(false);
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleImageUpload(e);
  };

  const setBannerImage = (imageId: string) => {
    setImages((prev) => prev.map((img) => ({ ...img, isBanner: img.id === imageId })));
  };

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== imageId);
      if (filtered.length > 0 && !filtered.some((img) => img.isBanner)) {
        filtered[0].isBanner = true;
      }
      return filtered;
    });
  };

  const handleSave = async (publishStatus?: string) => {
    if (!title.trim()) {
      setSaveError("शीर्षक आवश्यक छ");
      return;
    }
    if (!categoryId) {
      setSaveError("श्रेणी छान्नुहोस्");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      let finalSlug = slug.trim();
      if (!finalSlug) {
        finalSlug = generateSlug(title);
      }

      let counter = 1;
      let testSlug = finalSlug;
      let isUnique = false;

      while (!isUnique && counter < 100) {
        const { data } = await supabase.from("articles").select("id").eq("slug", testSlug).limit(1);
        if (!data || data.length === 0) {
          isUnique = true;
          finalSlug = testSlug;
        } else if (editId && data[0].id === editId) {
          isUnique = true;
          finalSlug = testSlug;
        } else {
          testSlug = `${finalSlug}-${counter}`;
          counter++;
        }
      }

      if (!isUnique) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }
      setSlug(finalSlug);

      // Build image records
      const imageRecords: { article_id: string; image_url: string; is_banner: boolean; sort_order: number }[] = [];
      let sortIndex = 0;

      for (const image of images) {
        let publicUrl = image.url;

        if (!publicUrl && image.file) {
          const fileExt = image.file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `articles/${fileName}`;
          const { error: uploadError } = await supabase.storage.from("news-images").upload(filePath, image.file);
          if (uploadError) {
            console.error("Upload failed:", uploadError);
            continue;
          }
          const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(filePath);
          publicUrl = urlData.publicUrl;
        }

        if (publicUrl) {
          imageRecords.push({
            article_id: editId || "temp",
            image_url: publicUrl,
            is_banner: image.isBanner,
            sort_order: sortIndex++,
          });
        }
      }

      const featuredImageUrl = imageRecords.find((r) => r.is_banner)?.image_url || null;

      // Import at top: import { getTodayBS } from "@/lib/nepaliDate";

      const articleData = {
        title: title.trim(),
        slug: finalSlug,
        excerpt: excerpt.trim() || title.trim(),
        content: content.trim(),
        category_id: categoryId,
        status: publishStatus || status,
        featured_image: featuredImageUrl,
        meta_title: metaTitle.trim() || title.trim(),
        meta_description: metaDescription.trim() || excerpt.trim() || title.trim(),
        author_id: user?.id,
        ...(publishStatus === "published" || status === "published"
          ? { published_at: new Date().toISOString() }
          : {}),
        ...(publishStatus === "published" || status === "published"
          ? { published_date_bs: getTodayBS() }
          : {}),
      };

      let articleId = editId;

      if (editId) {
        const { error } = await supabase.from("articles").update(articleData).eq("id", editId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("articles").insert(articleData).select("id").single();
        if (error) throw error;
        articleId = data.id;
      }

      // Save images
      if (articleId && imageRecords.length > 0) {
        const finalRecords = imageRecords.map((r) => ({ ...r, article_id: articleId }));
        console.log("[DEBUG] Saving images:", finalRecords);
        if (editId) {
          const { error: delError } = await supabase.from("article_images").delete().eq("article_id", editId);
          if (delError) console.error("[DEBUG] Delete old images error:", delError);
        }
        const { error: insError } = await supabase.from("article_images").insert(finalRecords);
        if (insError) {
          console.error("[DEBUG] Insert images error:", insError);
          setSaveError("छवि सेभ गर्न असफल: " + insError.message);
        }
      }

      // Auto-share to Facebook (if API is configured)
      if ((publishStatus === "published" || status === "published") && shareToFacebook) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saptahiksamachar.com.np";
          const articleUrl = `${baseUrl}/news/${finalSlug}`;
          const fbResponse = await fetch("/api/share/facebook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title.trim(),
              excerpt: excerpt.trim() || title.trim(),
              slug: finalSlug,
              featuredImage: featuredImageUrl,
            }),
          });
          const fbResult = await fbResponse.json();
          setFacebookResult({
            success: fbResult.success,
            message: fbResult.success ? "फेसबुकमा सफलतापूर्वक साझा गरियो!" : (fbResult.error || "फेसबुक साझा गर्न असफल"),
          });
        } catch {
          setFacebookResult({ success: false, message: "फेसबुक साझा गर्न असफल" });
        }
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.message || "समाचार सेभ गर्न असफल");
    } finally {
      setSaving(false);
    }
  };

  const insertYoutubeVideo = () => {
    if (!youtubeUrl.trim()) return;
    const videoId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/)?.[1];
    if (!videoId) {
      setSaveError("अमान्य YouTube URL");
      return;
    }
    const embedHtml = `\n<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
    setContent((prev) => prev + embedHtml);
    setYoutubeUrl("");
    setShowVideoInput(false);
  };
  // ← ADD: Manual Facebook share dialog
  const shareToFacebookManual = () => {
    if (!slug) {
      setSaveError("पहिले समाचार सेभ गर्नुहोस्");
      return;
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saptahiksamachar.com.np";
    const articleUrl = `${baseUrl}/news/${slug}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(fbUrl, "_blank", "width=650,height=450,scrollbars=yes,resizable=yes");
  };

  const copyArticleLink = () => {
    if (!slug) return;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saptahiksamachar.com.np";
    const articleUrl = `${baseUrl}/news/${slug}`;
    navigator.clipboard.writeText(articleUrl).then(() => {
      alert("लिङ्क कपी गरियो!");
    });
  };
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हुँदैछ...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const bannerImage = images.find((img) => img.isBanner) || images[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-1 text-gray-600 hover:text-blue-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline text-sm">ड्यासबोर्ड</span>
              </Link>
              <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
              <h1 className="font-bold text-gray-900 text-sm sm:text-base truncate">{editId ? "सम्पादन" : "नयाँ समाचार"}</h1>
            </div>
                        <div className="flex items-center gap-2">
              <button
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="hidden sm:inline-flex px-3 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "..." : "ड्राफ्ट"}
              </button>
              <button
                onClick={() => handleSave("published")}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? "..." : "प्रकाशित"}
              </button>
              {/* ← ADD: Manual Facebook share */}
              {slug && (
                <button
                  onClick={shareToFacebookManual}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-lg transition-colors"
                  title="फेसबुकमा साझा गर्नुहोस्"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  फेसबुक
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{saveError}</div>
        )}
        {facebookResult && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${facebookResult.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-amber-50 border border-amber-200 text-amber-700"}`}>
            <div className="flex items-center gap-2">
              {facebookResult.success ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              )}
              <span className="font-medium">{facebookResult.message}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 mb-4 sm:mb-6 bg-white rounded-lg p-1 shadow-sm overflow-x-auto">
          {(["content", "media", "seo"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap min-w-[80px] ${activeTab === tab ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
              {tab === "content" && "सामग्री"}
              {tab === "media" && "मिडिया"}
              {tab === "seo" && "SEO"}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {activeTab === "content" && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">शीर्षक <span className="text-red-500">*</span></label>
                  <input type="text" value={title} onChange={handleTitleChange} placeholder="समाचारको शीर्षक लेख्नुहोस्"
                    className="w-full px-4 py-4 text-lg font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition-all min-h-[56px]" />
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    URL Slug <span className="text-xs font-normal text-gray-500 ml-2">(स्वचालित, सम्पादन गर्न सकिन्छ)</span>
                  </label>
                  <div className="flex items-center gap-2 p-3 border border-gray-300 rounded-xl bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-900">
                    <span className="text-gray-500 text-sm select-none">/news/</span>
                    <input type="text" value={slug}
                      onChange={(e) => { setSlugEdited(true); setSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, "-").replace(/-+/g, "-")); }}
                      placeholder="url-slug" className="flex-1 bg-transparent outline-none font-mono text-sm min-h-[40px]" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Preview: saptahiksamachar.com.np/news/{slug || "..."}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">श्रेणी <span className="text-red-500">*</span></label>
                    {showDetection && detectedCategory && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium animate-pulse">🤖 पहिचान</span>
                    )}
                  </div>
                  {showDetection && detectedCategory && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start justify-between gap-2">
                      <p className="text-sm text-blue-800">
                        <span className="font-bold">🤖 सुझाव:</span>{" "}
                        <span className="font-bold">{categories.find((c) => c.id === detectedCategory)?.name || detectedCategory}</span>
                        {categoryId && categoryId !== detectedCategory && <span className="text-blue-600"> (तपाईंले म्यानुअल रूपमा परिवर्तन गर्नुभयो)</span>}
                      </p>
                      {categoryId && categoryId !== detectedCategory && (
                        <button onClick={() => { setCategoryId(detectedCategory); setShowDetection(false); }}
                          className="text-xs bg-blue-900 text-white px-2 py-1 rounded hover:bg-blue-800 shrink-0">सुझाव अपनाउनुहोस्</button>
                      )}
                    </div>
                  )}
                  <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); if (e.target.value && e.target.value !== detectedCategory) setShowDetection(false); }}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-base bg-white min-h-[56px]">
                    <option value="">श्रेणी छान्नुहोस्</option>
                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  </select>
                </div>

                {excerpt && (
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-gray-700">सारांश (स्वचालित)</label>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">🤖 उत्पन्न</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{excerpt}</p>
                    <p className="text-xs text-gray-500 mt-2">सामग्रीको पहिलो वाक्यबाट स्वचालित रूपमा उत्पन्न हुन्छ।</p>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">मुख्य सामग्री</label>
                    <button onClick={() => setShowVideoInput(!showVideoInput)} className="text-sm text-blue-900 hover:underline flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                      भिडियो
                    </button>
                  </div>
                 {showVideoInput && (
  <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
    {/* Info banner */}
    <div className="flex items-start gap-2 text-xs text-blue-700 bg-white p-2.5 rounded-lg border border-blue-100">
      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>यो साइटमा YouTube भिडियो मात्र समर्थित छ। तपाईंको भिडियो पहिले YouTube मा अपलोड गर्नुपर्छ।</span>
    </div>

    {/* Step 1 */}
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-blue-900 text-white text-xs font-bold rounded-full">१</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">YouTube मा भिडियो अपलोड गर्नुहोस्</p>
        <p className="text-xs text-blue-600 mt-0.5">फोन वा कम्प्युटरबाट सीधै अपलोड गर्नुहोस्</p>
        <a href="https://www.youtube.com/upload" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          YouTube मा अपलोड गर्नुहोस्
        </a>
      </div>
    </div>

    <div className="border-t border-blue-200"></div>

    {/* Step 2 */}
    <div className="flex items-start gap-3">
      <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-blue-900 text-white text-xs font-bold rounded-full">२</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900">अपलोड पछि लिङ्क यहाँ पेस्ट गर्नुहोस्</p>
        <div className="flex gap-2 mt-2">
          <input type="text" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
            className="flex-1 px-4 py-3 border border-blue-200 rounded-xl text-base focus:ring-2 focus:ring-blue-900 outline-none min-h-[48px]" />
          <button onClick={insertYoutubeVideo} disabled={!youtubeUrl.trim()}
            className="px-4 py-3 bg-blue-900 text-white text-sm font-bold rounded-xl hover:bg-blue-800 whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            थप्नुहोस्
          </button>
        </div>
      </div>
    </div>
  </div>
)}



                  <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="समाचारको पूर्ण सामग्री लेख्नुहोस्..." rows={12}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none text-base leading-relaxed" />
                </div>
              </>
            )}

            {activeTab === "media" && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">छविहरू</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-900 hover:bg-blue-50 transition-colors">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-sm font-medium text-gray-700">ग्यालरी</p>
                      <p className="text-xs text-gray-500">फोनबाट</p>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                  <label className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-900 hover:bg-blue-50 transition-colors">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <p className="text-sm font-medium text-gray-700">क्यामेरा</p>
                      <p className="text-xs text-gray-500">तस्बिर खिच्नुहोस्</p>
                    </div>
                    <input type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
                  </label>
                </div>

                {compressing && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg text-center">
                    <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                    <p className="text-sm text-blue-600">छवि संकुचन हुँदैछ...</p>
                  </div>
                )}

                {images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((image, index) => (
                      <div key={image.id} className={`relative rounded-xl overflow-hidden border-2 ${image.isBanner ? "border-yellow-400 ring-2 ring-yellow-400" : "border-gray-200"}`}>
                        <div className="aspect-square bg-gray-100">
                          <img src={image.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        {image.isBanner && (
                          <div className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-blue-900 text-xs font-bold rounded shadow">★ ब्यानर</div>
                        )}
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {!image.isBanner && (
                            <button onClick={() => setBannerImage(image.id)} className="p-2 bg-white/95 hover:bg-yellow-50 text-blue-900 rounded-lg shadow-sm border border-gray-200" title="ब्यानर बनाउनुहोस्">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            </button>
                          )}
                          <button onClick={() => removeImage(image.id)} className="p-2 bg-white/95 hover:bg-red-50 text-red-600 rounded-lg shadow-sm border border-gray-200" title="मेटाउनुहोस्">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="font-medium text-gray-500">कुनै छवि छैन</p>
                    <p className="text-sm mt-1">माथिको बटन थिच्नुहोस्</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "seo" && (
              <>
                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">SEO शीर्षक</label>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">🤖 स्वचालित</span>
                  </div>
                  <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Google मा देखिने शीर्षक"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none text-base" />
                  <p className="text-xs text-gray-500 mt-2">शीर्षक र श्रेणीको आधारमा स्वचालित रूपमा उत्पन्न हुन्छ।</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">SEO विवरण</label>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">🤖 स्वचालित</span>
                  </div>
                  <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Google खोजी परिणाममा देखिने विवरण" rows={3}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none resize-none text-base" />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">सामग्रीको पहिलो वाक्यको आधारमा स्वचालित रूपमा उत्पन्न हुन्छ।</p>
                    <span className={`text-xs ${metaDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>{metaDescription.length}/160</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Google पूर्वावलोकन</h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <p className="text-xs text-gray-500 mb-1">saptahiksamachar.com.np › news › {slug || "..."}</p>
                    <h4 className="text-lg text-blue-700 hover:underline cursor-pointer line-clamp-1">{metaTitle || title || "SEO शीर्षक यहाँ देखिनेछ"}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{metaDescription || "SEO विवरण यहाँ देखिनेछ..."}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hidden lg:block space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">प्रकाशन सेटिङ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">स्थिति</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-900 outline-none">
                    <option value="draft">ड्राफ्ट</option>
                    <option value="published">प्रकाशित</option>
                    <option value="archived">अभिलेख</option>
                  </select>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button onClick={() => handleSave("published")} disabled={saving} className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors disabled:opacity-50 mb-2">{saving ? "..." : "प्रकाशित गर्नुहोस्"}</button>
                  <button onClick={() => handleSave("draft")} disabled={saving} className="w-full py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors disabled:opacity-50">ड्राफ्ट सेभ</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">पूर्वावलोकन</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                  {bannerImage ? (
                    <img src={bannerImage.preview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Logo size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-gray-400">ब्यानर छवि</p>
                    </div>
                  )}
                  {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-medium">{images.length} छविहरू</div>
                  )}
                </div>
                {images.length > 0 && (
                  <div className="flex gap-2 p-3 overflow-x-auto border-t border-gray-100 bg-gray-50">
                    {images.map((img, idx) => (
                      <div key={img.id} className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 ${img.isBanner ? "border-yellow-400" : "border-gray-200"}`}>
                        <img src={img.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{categories.find((c) => c.id === categoryId)?.name || "श्रेणी"}</p>
                  <h4 className="font-bold text-gray-900 line-clamp-2 text-sm">{title || "शीर्षक यहाँ देखिनेछ"}</h4>
                </div>
              </div>
            </div>

            {editId && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">थप जानकारी</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{viewCount === null ? "—" : viewCount.toLocaleString("ne-NP")}</p>
                    <p className="text-xs">पटक पढिएको</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-3">सुझावहरू</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• पहिलो छवि स्वचालित ब्यानर बन्छ</li>
                <li>• छवि संकुचन (~200KB)</li>
                <li>• भिडियो YouTube लिङ्क</li>
                <li>• ६ महिनापछि मेटिन्छ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
        <div className="flex gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex-1 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl border-2 border-gray-300 transition-colors disabled:opacity-50 text-base"
          >
            {saving ? "..." : "ड्राफ्ट सेभ"}
          </button>
          <button
            onClick={() => handleSave("published")}
            disabled={saving}
            className="flex-1 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-base"
          >
            {saving ? "..." : "प्रकाशित गर्नुहोस्"}
          </button>
          {slug && (
            <button
              onClick={shareToFacebookManual}
              className="px-4 py-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold rounded-xl transition-colors text-base"
              title="फेसबुकमा साझा गर्नुहोस्"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="lg:hidden h-24"></div>
    </div>
  );
}
// Outer export wrapped in Suspense (required by Next.js 14)
export default function WriteArticle() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">लोड हुँदैछ...</p>
          </div>
        </div>
      }
    >
      <WriteArticleInner />
    </Suspense>
  );
}
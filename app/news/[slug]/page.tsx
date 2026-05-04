import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import Link from "next/link";
import ArticleContent from "@/components/ArticleContent";
import LatestNewsTicker from "@/components/LatestNewsTicker";
import AdBanner from "@/components/AdBanner";

interface ArticleDetailProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticleDetailProps) {
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title, excerpt, meta_title, meta_description, featured_image")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!article) {
    return { title: "समाचार फेला परेन | साप्ताहिक समाचार" };
  }

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      images: article.featured_image ? [{ url: article.featured_image }] : [],
    },
  };
}

export default async function ArticleDetail({ params }: ArticleDetailProps) {
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select(`
      id, title, slug, excerpt, content, featured_image, status,
      published_at, created_at, view_count, meta_title, meta_description,
      categories(id, name, slug, color),
      article_images(id, image_url, sort_order, is_banner)
    `)
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!article) {
    notFound();
  }

  // Increment view count
  supabase.rpc("increment_article_views", { article_id: article.id });

  // ← FIX: categories is an array from Supabase, take the first element
  const category = article.categories?.[0];

  // Fetch related articles
  const { data: relatedArticles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, featured_image, published_at, categories(name)")
    .eq("category_id", category?.id)  // ← FIX: use category?.id
    .eq("status", "published")
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(3);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("ne-NP", {
      calendar: "bikram-sambat",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-white">
      <LatestNewsTicker />

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={40} />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-blue-900">साप्ताहिक समाचार</h1>
              </div>
            </Link>
            <Link href="/admin" className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-full transition-colors">
              प्रवेश
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-900 transition-colors">गृहपृष्ठ</Link>
          <span>/</span>
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-blue-900 transition-colors">
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 truncate">{article.title}</span>
        </nav>

        {/* Category Badge */}
        {category && (
          <div className="mb-4">
            <span
              className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full"
              style={{ backgroundColor: category.color || "#1e3a8a" }}
            >
              {category.name}
            </span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
          <span>{formatDate(article.published_at || article.created_at)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {(article.view_count ?? 0).toLocaleString("ne-NP")} पटक पढिएको
          </span>
        </div>

        {article.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium">
            {article.excerpt}
          </p>
        )}

        <ArticleContent
          content={article.content}
          featuredImage={article.featured_image}
          images={article.article_images}
        />

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm font-bold text-gray-700 mb-3">साझा गर्नुहोस्:</p>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
              <span className="text-xs font-bold">F</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-colors">
              <span className="text-xs font-bold">T</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors">
              <span className="text-xs font-bold">W</span>
            </button>
          </div>
        </div>
      </main>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8">सम्बन्धित समाचार</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((rel: any) => (
                <article key={rel.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/news/${rel.slug}`} className="block">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {rel.featured_image ? (
                        <img src={rel.featured_image} alt={rel.title} className="w-full h-full object-cover" />
                      ) : (
                        <Logo size={48} className="opacity-50" />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-blue-900 transition-colors">
                        {rel.title}
                      </h3>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-gray-950 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <div>
                <h3 className="font-bold">साप्ताहिक समाचार</h3>
                <p className="text-xs text-gray-400">भद्रपुर, झापा</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">© २०८२ साप्ताहिक समाचार। सर्वाधिकार सुरक्षित।</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
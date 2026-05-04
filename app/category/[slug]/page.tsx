import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import Link from "next/link";

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", params.slug)
    .single();

  if (!category) {
    return { title: "श्रेणी फेला परेन | साप्ताहिक समाचार" };
  }

  return {
    title: `${category.name} समाचार | साप्ताहिक समाचार`,
    description: category.description || `${category.name} सम्बन्धी समाचारहरू`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, featured_image, published_at, view_count")
    .eq("category_id", category.id)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-blue-900 text-yellow-400 text-xs py-1.5 text-center font-medium tracking-wide">
        भद्रपुर, झापा — नेपालको पूर्वाञ्चलबाट प्रकाशित
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={40} />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-blue-900">साप्ताहिक समाचार</h1>
              </div>
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-full transition-colors"
            >
              प्रवेश
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div
          className="rounded-2xl p-8 mb-8 text-white"
          style={{ backgroundColor: category.color || "#1e3a8a" }}
        >
          <h1 className="text-4xl font-black mb-2">{category.name}</h1>
          <p className="text-white/80">
            {articles?.length || 0} समाचारहरू
          </p>
        </div>

        {/* Articles Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/news/${article.slug}`} className="block">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {article.featured_image ? (
                      <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" />
                    ) : (
                      <Logo size={48} className="opacity-50" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                      <span>{formatDate(article.published_at)}</span>
                      <span>•</span>
                      <span>{article.view_count?.toLocaleString() || 0} पटक पढिएको</span>
                    </div>
                    <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-blue-900 transition-colors">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">कुनै समाचार छैन</h3>
            <p className="text-gray-600">यस श्रेणीमा अहिले कुनै समाचार छैन।</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white border-t border-gray-800 mt-16">
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

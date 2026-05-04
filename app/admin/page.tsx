"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  category_id: string;
  published_at: string;
  created_at: string;
  view_count: number;
  categories?: { name: string }[] | null;
}

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchArticles();
    }
  }, [user, filter]);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from("articles")
      .select(`
        id, title, slug, status, category_id, published_at, created_at, view_count,
        categories(name)
      `)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setArticles(data as Article[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("के तपाईं यो समाचार मेटाउन निश्चित हुनुहुन्छ?")) return;

    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (!error) {
      setArticles(articles.filter((a) => a.id !== id));
    }
  };

  const handlePublish = async (id: string) => {
    const { error } = await supabase
      .from("articles")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      fetchArticles();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-800";
      case "draft":
        return "bg-amber-100 text-amber-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "प्रकाशित";
      case "draft":
        return "ड्राफ्ट";
      case "archived":
        return "अभिलेख";
      default:
        return status;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">लोड हुँदैछ...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <Logo size={32} />
                <span className="font-bold text-blue-900 text-sm hidden sm:block">साप्ताहिक समाचार</span>
              </Link>
              <div className="h-5 w-px bg-gray-300 hidden sm:block"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">व्यवस्थापन</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 hidden md:block">{user.email}</span>
              <button
                onClick={signOut}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="बाहिर निस्कनुहोस्"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Cards - Scrollable on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          <div className="min-w-[140px] bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">कुल समाचार</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">{articles.length}</p>
          </div>
          <div className="min-w-[140px] bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">प्रकाशित</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">
              {articles.filter((a) => a.status === "published").length}
            </p>
          </div>
          <div className="min-w-[140px] bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">ड्राफ्ट</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-600">
              {articles.filter((a) => a.status === "draft").length}
            </p>
          </div>
          <div className="min-w-[140px] bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">जम्मा दृश्य</p>
            <p className="text-2xl sm:text-3xl font-black text-blue-900">
              {articles.reduce((sum, a) => sum + (a.view_count || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/admin/write"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors text-sm sm:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              नयाँ समाचार
            </Link>
            <Link
              href="/admin/ads"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              विज्ञापन
            </Link>
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
          >
            <option value="all">सबै</option>
            <option value="published">प्रकाशित</option>
            <option value="draft">ड्राफ्ट</option>
            <option value="archived">अभिलेख</option>
          </select>
        </div>

        {/* Articles List - Mobile Cards */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">लोड हुँदैछ...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">कुनै समाचार छैन</h3>
              <p className="text-gray-600 mb-4">तपाईंको पहिलो समाचार लेख्न सुरु गर्नुहोस्।</p>
              <Link
                href="/admin/write"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                नयाँ समाचार लेख्नुहोस्
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {articles.map((article) => (
                <div key={article.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded-full ${getStatusBadge(article.status)}`}>
                          {getStatusText(article.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {article.published_at
                            ? new Date(article.published_at).toLocaleDateString("ne-NP")
                            : new Date(article.created_at).toLocaleDateString("ne-NP")}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {article.categories?.[0]?.name || "समाचार"} • {article.view_count?.toLocaleString() || 0} पटक पढिएको
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {article.status === "draft" && (
                        <button
                          onClick={() => handlePublish(article.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="प्रकाशित गर्नुहोस्"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <Link
                        href={`/admin/write?id=${article.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

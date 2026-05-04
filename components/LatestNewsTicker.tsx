"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Article {
  id: string;
  title: string;
  slug: string;
}

export default function LatestNewsTicker() {
  const supabase = createClient();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(12);

      if (data) setArticles(data);
      setLoading(false);
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="bg-blue-900 text-yellow-300 text-xs py-2 px-4 text-center font-medium">
        ताजा समाचार लोड हुँदैछ...
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div className="bg-blue-900 text-white py-2.5 overflow-hidden border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <span className="bg-yellow-400 text-blue-900 text-[10px] font-black px-2 py-1 rounded uppercase shrink-0">
          ताजा
        </span>

        <div className="overflow-hidden relative flex-1">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{
              animation: "tickerScroll 40s linear infinite",
            }}
          >
            {/* Duplicate list for seamless loop */}
            {[...articles, ...articles].map((article, idx) => (
              <Link
                key={`${article.id}-${idx}`}
                href={`/news/${article.slug}`}
                className="text-sm hover:text-yellow-300 transition-colors inline-flex items-center gap-2 shrink-0"
              >
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
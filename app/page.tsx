import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";
import AdBanner from "@/components/AdBanner";   
import LatestNewsTicker from "@/components/LatestNewsTicker";



export const revalidate = 60; // Revalidate every 60 seconds


export default async function Home() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, color")
    .order("sort_order", { ascending: true });

  // Fetch hero article (latest published)
  const { data: heroArticles } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, featured_image, published_at, created_at, published_date_bs, categories(id, name, slug, color)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1);

  const heroArticle = heroArticles?.[0];

  // Fetch must-read articles (2nd-4th latest)
  const { data: mustReads } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, featured_image, published_at, created_at, published_date_bs, categories(id, name, slug, color)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(1, 3);

  // Fetch power/special articles (4th-5th)
  const { data: powerReads } = await supabase
    .from("articles")
    .select("id, title, slug, excerpt, featured_image, published_at, created_at, published_date_bs, categories(id, name, slug, color)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(3, 4);

  // Fetch latest news (remaining)
  const { data: latestNews } = await supabase
    .from("articles")
        .select("id, title, slug, excerpt, featured_image, published_at, created_at, published_date_bs, categories(id, name, slug, color)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(5, 10);

  const formatDate = (dateStr: string, bsDate?: string | null) => {
    if (bsDate) return bsDate;
    const date = new Date(dateStr);
    return date.toLocaleDateString("ne-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const allCategories = categories || [];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top Bar */}
      <div className="bg-blue-900 text-yellow-400 text-xs py-1.5 text-center font-medium tracking-wide">
        भद्रपुर, झापा — नेपालको पूर्वाञ्चलबाट प्रकाशित
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20">
                <Logo size={64} className="lg:w-20 lg:h-20" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 leading-tight">
                  साप्ताहिक समाचार
                </h1>
                <p className="text-sm text-gray-500 -mt-0.5">भद्रपुर, झापा — नेपालको पूर्वाञ्चलबाट प्रकाशित</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {allCategories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-full transition-colors"
              >
                प्रवेश
              </Link>
            </div>
          </div>
        </div>
        </header>

      {/* Header Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <AdBanner position="header" maxHeight={90} />
      </div>

            <LatestNewsTicker />

      <main>
        {/* HERO SECTION */}
        {heroArticle ? (
          <section className="relative bg-violet-950 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ backgroundColor: (heroArticle.categories as any)?.color || "#1e3a8a" }}
                    >
                      {(heroArticle.categories as any)?.name || "समाचार"}
                    </span>
                    <span className="text-violet-200 text-sm">
                      {formatDate(heroArticle.published_at || heroArticle.created_at, heroArticle.published_date_bs)}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
                    {heroArticle.title}
                  </h2>
                  <p className="text-lg text-violet-100 leading-relaxed mb-8 max-w-xl">
                    {heroArticle.excerpt}
                  </p>
                  <Link
                    href={`/news/${heroArticle.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white border-2 border-white/30 hover:border-white px-6 py-3 rounded-full transition-colors"
                  >
                    पूरा पढ्नुहोस्
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-violet-800 to-purple-900">
                    {heroArticle.featured_image ? (
                      <img
                        src={heroArticle.featured_image}
                        alt={heroArticle.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-24 h-24 mb-4">
                          <Logo size={96} className="opacity-90" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">साप्ताहिक समाचार</h3>
                        <p className="text-violet-200 text-sm">भद्रपुर, झापा</p>
                        <div className="mt-4 px-4 py-1.5 bg-white/10 rounded-full text-xs text-violet-200">
                          {(heroArticle.categories as any)?.name || "समाचार"}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="relative bg-violet-950 text-white overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 text-center">
              <h2 className="text-3xl font-black mb-4">कुनै समाचार छैन</h2>
              <p className="text-violet-200 mb-6">पहिलो समाचार प्रकाशित गर्नुहोस्</p>
              <Link
                href="/admin/write"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-950 font-bold rounded-full hover:bg-violet-100 transition-colors"
              >
                समाचार लेख्नुहोस्
              </Link>
            </div>
          </section>
            )}

    {/* Hero Ad */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <AdBanner position="hero" maxHeight={250} />
    </div>

    {/* MUST READS */}
        {mustReads && mustReads.length > 0 && (
          <section className="py-16 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                  पढ्नुपर्ने
                </h2>
                <div className="flex-1 h-1 bg-gradient-to-r from-violet-600 to-pink-500 rounded-full" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {mustReads.map((article) => (
                  <article key={article.id} className="group cursor-pointer">
                    <Link href={`/news/${article.slug}`} className="block">
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gray-100">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <div className="text-center p-6">
                              <span
                                className="inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                                style={{ backgroundColor: (article.categories as any)?.color || "#374151" }}
                              >
                                {(article.categories as any)?.name || "समाचार"}
                              </span>
                              <h4 className="text-white font-bold text-lg line-clamp-2">
                                {article.title}
                              </h4>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ backgroundColor: (article.categories as any)?.color || "#374151" }}
                        >
                          {(article.categories as any)?.name || "समाचार"}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatDate(article.published_at || article.created_at, article.published_date_bs)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors leading-snug mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
                </section>
    )}

    {/* Inline Ad */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdBanner position="inline" maxHeight={200} />
    </div>

    {/* POWER/SPECIAL SECTION */}
        {powerReads && powerReads.length > 0 && (
          <section className="py-16 lg:py-24 bg-gray-950 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-4xl lg:text-5xl font-black tracking-tight">विशेष</h2>
                <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full" />
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                {powerReads.map((article) => (
                  <article key={article.id} className="group cursor-pointer">
                    <Link href={`/news/${article.slug}`} className="block">
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-gray-800">
                        {article.featured_image ? (
                          <img
                            src={article.featured_image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                            <div className="text-center p-8">
                              <span
                                className="inline-block text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
                                style={{ backgroundColor: (article.categories as any)?.color || "#374151" }}
                              >
                                {(article.categories as any)?.name || "समाचार"}
                              </span>
                              <h4 className="text-white font-bold text-xl line-clamp-2">
                                {article.title}
                              </h4>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ backgroundColor: (article.categories as any)?.color || "#374151" }}
                        >
                          {(article.categories as any)?.name || "समाचार"}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold group-hover:text-amber-400 transition-colors leading-snug mb-3">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LATEST NEWS */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                ताजा समाचार
              </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {latestNews && latestNews.length > 0 ? (
                  latestNews.map((article) => (
                    <article key={article.id} className="group cursor-pointer bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <Link href={`/news/${article.slug}`} className="flex gap-5">
                        <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                          {article.featured_image ? (
                            <img
                              src={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span
                              className="text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                              style={{ backgroundColor: (article.categories as any)?.color || "#374151" }}
                            >
                              {(article.categories as any)?.name || "समाचार"}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{ backgroundColor: (article.categories as any)?.color || "#374151" }}
                            >
                              {(article.categories as any)?.name || "समाचार"}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {formatDate(article.published_at || article.created_at)}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors leading-snug mb-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 hidden sm:block">
                            {article.excerpt}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))
                ) : (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <p className="text-gray-500">थप समाचार छैन</p>
                  </div>
                )}
              </div>

              <aside className="space-y-8">
                {/* ← FIX: Live ad from admin instead of placeholder */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">विज्ञापन</p>
                  <AdBanner position="sidebar" maxHeight={400} />
                </div>

                {/* Popular Categories */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">लोकप्रिय श्रेणी</h3>
                  <div className="flex flex-wrap gap-2">
                    {allCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: cat.color || "#1e3a8a" }}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-blue-900 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">समाचार पाउनुहोस्</h3>
                  <p className="text-blue-200 text-sm mb-4">ताजा समाचार सीधै इमेलमा</p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="तपाईंको इमेल"
                      className="w-full px-4 py-2.5 rounded-lg text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold text-sm rounded-lg transition-colors">
                      सदस्यता लिनुहोस्
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CATEGORY GRID */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                श्रेणी
              </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {allCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl p-8 text-white hover:shadow-xl transition-all hover:-translate-y-1"
                  style={{ backgroundColor: cat.color || "#1e3a8a" }}
                >
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2">{cat.name}</h3>
                    <p className="text-white/80 text-sm font-medium">सबै समाचार हेर्नुहोस् →</p>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Ad */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdBanner position="footer" maxHeight={120} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Logo size={48} />
                <div>
                  <h3 className="text-lg font-bold">साप्ताहिक समाचार</h3>
                  <p className="text-gray-400 text-xs">भद्रपुर, झापा</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                झापा जिल्लाको भद्रपुरबाट प्रकाशित हुने साप्ताहिक अनलाइन समाचार पत्रिका। स्थीय समाचार, खेलकुद, शिक्षा र स्वास्थ्यको विश्वसनीय स्रोत।
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">मुख्य लिङ्क</h4>
              <ul className="space-y-2.5">
                {["गृहपृष्ठ", "ताजा समाचार", "खेलकुद", "मनोरञ्जन", "अन्तर्राष्ट्रिय"].map((item) => (
                  <li key={item}>
                    <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">सम्पर्क</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li>भद्रपुर नगरपालिका, झापा</li>
                <li>प्रदेश नं. १, नेपाल</li>
                <li>इमेल: girigopal99@gmail.com</li>
                <li>फोन: ९८४२६५२८२७, ०२३-५२१०९९</li>
                <li className="pt-2 border-t border-gray-800 mt-2 text-gray-300">
                  प्रकाशक / सम्पादक – गोपाल गिरी
                </li>
                <li className="text-xs text-gray-500">
                  सुचना बिभाग दर्ता नं. ५०/२०५२-५३
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">सामाजिक सञ्जाल</h4>
              <div className="flex gap-3">
                {["Facebook", "Twitter", "YouTube"].map((social) => (
                  <button
                    key={social}
                    className="w-10 h-10 rounded-full bg-gray-800 hover:bg-blue-900 flex items-center justify-center transition-colors"
                    aria-label={social}
                  >
                    <span className="text-xs font-bold">{social[0]}</span>
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-4">
                © २०८२ साप्ताहिक समाचार। सर्वाधिकार सुरक्षित।
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
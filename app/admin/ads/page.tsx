"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useImageCompression } from "@/hooks/useImageCompression";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/Logo";

interface Advertisement {
  id: string;
  name: string;
  image_url: string;
  target_url: string | null;
  position: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  impression_count: number;
  click_count: number;
}

const positions = [
  { value: "header", label: "हेडर (सबै पृष्ठको शीर्ष)" },
  { value: "hero", label: "हिरो (मुख्य समाचार तल)" },
  { value: "sidebar", label: "साइडबार (डेस्कटप मात्र)" },
  { value: "inline", label: "इनलाइन (लेख बीचमा)" },
  { value: "footer", label: "फुटर (पृष्ठको तल)" },
];

export default function AdManagement() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const { compressImage, compressing } = useImageCompression();

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [position, setPosition] = useState("sidebar");
  const [targetUrl, setTargetUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchAds();
  }, [user]);

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setAds(data);
    setLoading(false);
  };

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // ← FIX: Skip compression for GIFs to preserve animation
  if (file.type === "image/gif") {
    const reader = new FileReader();
    reader.onload = () => {
      setImageFile(file);
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    return;
  }

  // Compress non-GIF images
  try {
    const compressed = await compressImage(file, 800, 0.8);
    setImageFile(compressed.file);
    setImagePreview(compressed.preview);
  } catch (err) {
    console.error("Compression failed:", err);
  }
};

  // ← FIX: Auto-prepend https:// and normalize URL on blur
  const handleUrlBlur = () => {
    let url = targetUrl.trim();
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
      setTargetUrl(url);
    }
  };

  // ← FIX: Load existing ad into form for editing
  const handleEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setName(ad.name);
    setPosition(ad.position);
    setTargetUrl(ad.target_url || "");
    setIsActive(ad.is_active);
    setStartDate(ad.start_date || "");
    setEndDate(ad.end_date || "");
    setImagePreview(ad.image_url); // Show existing image
    setImageFile(null); // No new file yet
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("नाम आवश्यक छ");
      return;
    }
    // Image required only for new ads, optional for edit
    if (!editingId && !imageFile && !imagePreview) {
      alert("छवि आवश्यक छ");
      return;
    }

    setSaving(true);

    try {
      let publicUrl = imagePreview;

      // Upload only if a new file was selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `ads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("news-images").upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      const adData = {
        name: name.trim(),
        image_url: publicUrl,
        target_url: targetUrl.trim() || null,
        position,
        is_active: isActive,
        start_date: startDate || null,
        end_date: endDate || null,
      };

      if (editingId) {
        const { error } = await supabase.from("advertisements").update(adData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("advertisements").insert(adData);
        if (error) throw error;
      }

      resetForm();
      fetchAds();
    } catch (err: any) {
      alert(err.message || "सेभ गर्न असफल");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("के तपाईं यो विज्ञापन मेटाउन निश्चित हुनुहुन्छ?")) return;
    await supabase.from("advertisements").delete().eq("id", id);
    fetchAds();
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await supabase.from("advertisements").update({ is_active: !current }).eq("id", id);
    fetchAds();
  };

  const resetForm = () => {
    setName("");
    setPosition("sidebar");
    setTargetUrl("");
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
    setShowForm(false);
  };

  const getPositionLabel = (pos: string) => {
    return positions.find((p) => p.value === pos)?.label || pos;
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-blue-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">ड्यासबोर्ड</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="font-bold text-gray-900">विज्ञापन व्यवस्थापन</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showForm ? "रद्द गर्नुहोस्" : "नयाँ विज्ञापन"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              {editingId ? "विज्ञापन सम्पादन" : "नयाँ विज्ञापन"}
            </h2>

            <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    विज्ञापनको नाम <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदाहरण: भद्रपुर आँखा अस्पताल"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    स्थान <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  >
                    {positions.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    लक्ष्य URL (क्लिक गर्दा जाने लिङ्क)
                  </label>
                  {/* ← FIX: type="text" instead of type="url" + auto-prepend https:// on blur */}
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    onBlur={handleUrlBlur}
                    placeholder="https://example.com वा www.example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">https:// स्वचालित रूपमा थपिन्छ</p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 text-blue-900 rounded focus:ring-blue-900"
                    />
                    <span className="text-sm font-medium text-gray-700">सक्रिय</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    छवि {editingId ? "(नयाँ छवि नछान्दा पुरानै रहन्छ)" : <span className="text-red-500">*</span>}
                  </label>
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-900 hover:bg-blue-50 transition-colors">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded" />
                      ) : (
                        <>
                          <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-600">छवि अपलोड गर्नुहोस्</p>
                        </>
                      )}
                      {compressing && <p className="text-sm text-blue-600 mt-2">संकुचन हुँदैछ...</p>}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">सुरु मिति</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">अन्त्य मिति</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? "सेभ हुँदै..." : editingId ? "अपडेट गर्नुहोस्" : "सेभ गर्नुहोस्"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
                >
                  रद्द गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ads List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">लोड हुँदैछ...</p>
            </div>
          ) : ads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">कुनै विज्ञापन छैन</h3>
              <p className="text-gray-600">माथिको "नयाँ विज्ञापन" बटन थिच्नुहोस्।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">छवि</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">नाम</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase hidden sm:table-cell">स्थान</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">स्थिति</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">कार्यहरू</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ads.map((ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <img src={ad.image_url} alt={ad.name} className="w-16 h-16 object-cover rounded-lg" />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{ad.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{ad.impression_count} दृश्य</p>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{getPositionLabel(ad.position)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(ad.id, ad.is_active)}
                          className={`inline-flex px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                            ad.is_active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {ad.is_active ? "सक्रिय" : "निष्क्रिय"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* ← FIX: Edit button added */}
                          <button
                            onClick={() => handleEdit(ad)}
                            className="p-2 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                            title="सम्पादन"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="मेटाउनुहोस्"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
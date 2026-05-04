"use client";

import { useCallback } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  keywords: string[];
}

// Category definitions with Nepali keywords for auto-detection
const categoryKeywords: Category[] = [
  {
    id: "mukhya",
    name: "मुख्य",
    slug: "mukhya",
    keywords: ["मुख्य", "प्रमुख", "महत्वपूर्ण", "ब्रेकिङ", "ताजा", " breaking", "main", "important"],
  },
  {
    id: "padhnu",
    name: "पढ्नुपर्ने",
    slug: "padhnu-parne",
    keywords: ["पढ्नुपर्ने", "विशेष", "विस्तृत", "feature", "must read", "exclusive"],
  },
  {
    id: "manoranjan",
    name: "मनोरञ्जन",
    slug: "manoranjan",
    keywords: [
      "मनोरञ्जन", "फिल्म", "सिनेमा", "गीत", "सङ्गीत", "नाच", "कला", "साहित्य",
      "entertainment", "movie", "film", "song", "music", "dance", "art", "literature",
      "बलिउड", "हलिउड", "कोलिउड", "नायक", "नायिका", "गायक", "गायिका",
    ],
  },
  {
    id: "khelkud",
    name: "खेलकुद",
    slug: "khelkud",
    keywords: [
      "खेल", "खेलकुद", "फुटबल", "क्रिकेट", "भलिबल", "बास्केटबल", "टेनिस",
      "sports", "football", "cricket", "volleyball", "basketball", "tennis",
      "प्रतियोगिता", "खेलाडी", "टिम", "क्लब", "लिग", "च्याम्पियनसिप", "टूर्नामेन्ट",
      "गोल्डकप", "कप", "म्याच", "खेल", "जित", "हार", "बराबरी",
    ],
  },
  {
    id: "antarrastriya",
    name: "अन्तर्राष्ट्रिय",
    slug: "antarrastriya",
    keywords: [
      "अन्तर्राष्ट्रिय", "विदेश", "विश्व", "global", "international", "foreign", "world",
      "भारत", "चीन", "अमेरिका", "इङ्ल्यान्ड", "जापान", "कोरिया", "पाकिस्तान", "बङ्गलादेश",
      "india", "china", "usa", "america", "uk", "japan", "korea", "pakistan", "bangladesh",
      "संयुक्त राष्ट्र", "UN", "विश्व बैंक", "आइएमएफ", "diplomacy", "embassy",
    ],
  },
  {
    id: "shiksha",
    name: "शिक्षा",
    slug: "shiksha",
    keywords: [
      "शिक्षा", "विद्यालय", "कलेज", "विश्वविद्यालय", "परीक्षा", "पढाइ", "विद्यार्थी",
      "education", "school", "college", "university", "exam", "study", "student",
      "एसईई", "एसएलसी", "प्लस टु", "ब्याचलर", "मास्टर", "पीएचडी", " scholarship",
      "शिक्षक", "प्रधानाध्यापक", "पाठ्यक्रम", "पढाइ", "विद्यालय", "बोर्ड",
    ],
  },
  {
    id: "swasthya",
    name: "स्वास्थ्य",
    slug: "swasthya",
    keywords: [
      "स्वास्थ्य", "उपचार", "अस्पताल", "क्लिनिक", "डाक्टर", "नर्स", "औषधि",
      "health", "medical", "hospital", "clinic", "doctor", "nurse", "medicine",
      "रोग", "बिरामी", "सर्जरी", "अपरेसन", "भ्याक्सिन", "खोप", "सरसफाइ",
      "आँखा", "दाँत", "हृदय", "क्यान्सर", "diabetes", "blood pressure",
      "शिविर", "निःशुल्क", "health camp", "eye camp",
    ],
  },
  {
    id: "samaj",
    name: "समाज",
    slug: "samaj",
    keywords: [
      "समाज", "सामाजिक", "सांस्कृतिक", "चाडपर्व", "रितिरिवाज", "परम्परा",
      "society", "social", "cultural", "festival", "tradition", "culture",
      "दशैं", "तिहार", "होली", "चैते दशैं", "महाशिवरात्रि", "बुद्ध जयन्ती",
      "विवाह", "ब्रतबन्ध", "जन्मदिन", "श्राद्ध", "पूजा", "आरती",
      "अपराध", "दुर्घटना", "आगलागी", "बाढी", "पहिरो", "भूकम्प",
    ],
  },
  {
    id: "arthatantra",
    name: "अर्थतन्त्र",
    slug: "arthatantra",
    keywords: [
      "अर्थतन्त्र", "आर्थिक", "बजार", "व्यापार", "उद्योग", "वाणिज्य",
      "economy", "economic", "market", "trade", "business", "industry", "commerce",
      "मूल्य", "महङ्गी", "मुद्रास्फीति", "बजेट", "कर", "राजस्व",
      "बैंक", "बीमा", "लगानी", "शेयर", "stock", "bank", "insurance", "investment",
      "कृषि", "किसान", "बाली", "उत्पादन", "agriculture", "farmer", "crop",
    ],
  },
  {
    id: "prabidhi",
    name: "प्रविधि",
    slug: "prabidhi",
    keywords: [
      "प्रविधि", "टेक्नोलोजी", "कम्प्युटर", "इन्टरनेट", "मोबाइल", "स्मार्टफोन",
      "technology", "computer", "internet", "mobile", "smartphone", "tech",
      "सोसल मिडिया", "फेसबुक", "ट्विटर", "इन्स्टाग्राम", "youtube", "टिकटक",
      "एआई", "रोबोट", "डिजिटल", "online", "app", "software", "website",
    ],
  },
];

export function useAutoCategory() {
  const detectCategory = useCallback((title: string, content?: string): string => {
    const text = (title + " " + (content || "")).toLowerCase();
    let bestMatch = { categoryId: "", score: 0 };

    for (const category of categoryKeywords) {
      let score = 0;
      for (const keyword of category.keywords) {
        const keywordLower = keyword.toLowerCase();
        // Exact word match gets higher score
        const regex = new RegExp(`\b${keywordLower}\b`, "g");
        const matches = text.match(regex);
        if (matches) {
          score += matches.length * 2;
        }
        // Partial match gets lower score
        if (text.includes(keywordLower)) {
          score += 1;
        }
      }

      if (score > bestMatch.score) {
        bestMatch = { categoryId: category.id, score };
      }
    }

    // Only return if score is significant (at least 2 points)
    return bestMatch.score >= 2 ? bestMatch.categoryId : "";
  }, []);

  const getCategorySuggestions = useCallback((title: string, content?: string) => {
    const text = (title + " " + (content || "")).toLowerCase();
    const suggestions = categoryKeywords
      .map((category) => {
        let score = 0;
        for (const keyword of category.keywords) {
          const keywordLower = keyword.toLowerCase();
          const regex = new RegExp(`\b${keywordLower}\b`, "g");
          const matches = text.match(regex);
          if (matches) {
            score += matches.length * 2;
          }
          if (text.includes(keywordLower)) {
            score += 1;
          }
        }
        return { ...category, score };
      })
      .filter((c) => c.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return suggestions;
  }, []);

  return { detectCategory, getCategorySuggestions, categoryKeywords };
}

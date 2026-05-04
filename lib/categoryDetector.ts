// Auto-detect category based on article title and content
// Uses Nepali keyword matching for each category

export interface CategoryKeywordMap {
  [key: string]: {
    id: string;
    name: string;
    keywords: string[];
    weight: number;
  };
}

export const categoryKeywords: CategoryKeywordMap = {
  mukhya: {
    id: "11111111-1111-1111-1111-111111111111",
    name: "मुख्य",
    keywords: [
      "मुख्य", "ताजा", "ब्रेकिङ", "ब्रेकिंग", "breaking", "महत्त्वपूर्ण", "important",
      "जरुरी", "आज", "आजको", "ताजा समाचार", "headline", "प्रमुख"
    ],
    weight: 1.0,
  },
  rajniti: {
    id: "22222222-2222-2222-2222-222222222222",
    name: "राजनीति",
    keywords: [
      "राजनीति", "राजनिति", "मन्त्री", "मन्त्रालय", "संसद", "प्रधानमन्त्री",
      "राष्ट्रपति", "उपराष्ट्रपति", "निर्वाचन", "चुनाव", "election", "vote",
      "मेयर", "उपमेयर", "अध्यक्ष", "उपाध्यक्ष", "पार्टी", "कांग्रेस", "एमाले",
      "माओवादी", "सभा", "बैठक", "निर्णय", "कार्यक्रम", "नगरपालिका", "गाउँपालिका",
      "वडा", "जिल्ला", "प्रशासन", "प्रमुख जिल्ला अधिकारी", "सीडीओ", "सुरक्षा",
      "प्रहरी", "प्रहरी प्रमुख", "प्रशासकीय", "कार्यालय"
    ],
    weight: 1.2,
  },
  khelkud: {
    id: "33333333-3333-3333-3333-333333333333",
    name: "खेलकुद",
    keywords: [
      "खेल", "खेलकुद", "स्पोर्ट्स", "sports", "फुटबल", "football", "क्रिकेट", "cricket",
      "भलिबल", "volleyball", "बास्केटबल", "basketball", "टेनिस", "badminton",
      "खेलाडी", "खेलाडी", "प्रशिक्षक", "coach", "टिम", "team", "क्लब", "club",
      "प्रतियोगिता", "tournament", "खेल मैदान", "स्टेडियम", "stadium",
      "जित", "हार", "गोल", "खेलाडी", "कप्तान", "उपकप्तान", "म्याच", "match",
      "लिग", "च्याम्पियन", "उपाधि", "ट्रफी", "पदक", "medal", "खेलकुद",
      "अन्तर्राष्ट्रिय खेल", "राष्ट्रिय खेल", "olympic", "ओलम्पिक"
    ],
    weight: 1.3,
  },
  swasthya: {
    id: "44444444-4444-4444-4444-444444444444",
    name: "स्वास्थ्य",
    keywords: [
      "स्वास्थ्य", "health", "अस्पताल", "hospital", "उपचार", "treatment",
      "डाक्टर", "doctor", "नर्स", "चिकित्सक", "औषधि", "medicine", "औषधालय",
      "फार्मेसी", "pharmacy", "क्लिनिक", "clinic", "भ्याक्सिन", "vaccine",
      "खोप", "रोग", "disease", "बिरामी", "patient", "सर्जरी", "surgery",
      "अपरेसन", "operation", "आँखा", "eye", "दाँत", "dental", "मानसिक स्वास्थ्य",
      "mental health", "पोषण", "nutrition", "आयुर्वेद", "योग", "ambulance",
      "एम्बुलेन्स", "रक्तदान", "blood donation", "शिविर", "camp", "checkup",
      "जाँच", "निःशुल्क", "free health"
    ],
    weight: 1.3,
  },
  shiksha: {
    id: "55555555-5555-5555-5555-555555555555",
    name: "शिक्षा",
    keywords: [
      "शिक्षा", "education", "school", "स्कूल", "विद्यालय", "कलेज", "college",
      "विश्वविद्यालय", "university", "परीक्षा", "exam", "नतिजा", "result",
      "उत्तीर्ण", "pass", "विद्यार्थी", "student", "शिक्षक", "teacher",
      "प्राध्यापक", "professor", "पढाइ", "reading", "पाठ्यक्रम", "curriculum",
      "बोर्ड", "board", "एसइई", "SEE", "एसएलसी", "SLC", "प्लस टु", "+2",
      "प्रवेश", "admission", "छात्रवृत्ति", "scholarship", "निःशुल्क शिक्षा",
      "शिक्षण", "teaching", "कक्षा", "class", "पढाइ", "study"
    ],
    weight: 1.3,
  },
  manoranjan: {
    id: "66666666-6666-6666-6666-666666666666",
    name: "मनोरञ्जन",
    keywords: [
      "मनोरञ्जन", "entertainment", "फिल्म", "movie", "सिनेमा", "cinema",
      "गीत", "song", "संगीत", "music", "नृत्य", "dance", "नाटक", "drama",
      "कला", "art", "कलाकार", "artist", "गायक", "singer", "गायिका",
      "अभिनेता", "actor", "अभिनेत्री", "actress", "निर्देशक", "director",
      "प्रदर्शनी", "exhibition", "सांस्कृतिक", "cultural", "मेला", "fair",
      "उत्सव", "festival", "पर्व", "celebration", "party", "कार्यक्रम",
      "program", "सांगीतिक", "musical", "कन्सर्ट", "concert", "radio",
      "टिभी", "television", "online", "viral", "ट्रेन्डिङ", "trending"
    ],
    weight: 1.2,
  },
  arthatantra: {
    id: "77777777-7777-7777-7777-777777777777",
    name: "अर्थतन्त्र",
    keywords: [
      "अर्थतन्त्र", "economy", "economic", "बजार", "market", "व्यापार", "business",
      "व्यवसाय", "commerce", "बैंक", "bank", "बैंकिङ", "banking", "बजेट", "budget",
      "कर", "tax", "राजस्व", "revenue", "लगानी", "investment", "शेयर", "share",
      "सेयर", "stock", "ब्याज", "interest", "ऋण", "loan", "कर्जा", "मुद्रा",
      "currency", "रुपैयाँ", "dollar", "मूल्य", "price", "महङ्गी", "inflation",
      "निर्यात", "export", "आयात", "import", "व्यापार घाटा", "trade",
      "उद्योग", "industry", "कृषि", "agriculture", "किसान", "farmer",
      "उत्पादन", "production", "रोजगार", "employment", "बेरोजगार", "unemployment"
    ],
    weight: 1.2,
  },
  samaj: {
    id: "88888888-8888-8888-8888-888888888888",
    name: "समाज",
    keywords: [
      "समाज", "society", "सामाजिक", "social", "समस्या", "problem", "चुनौती",
      "challenge", "अपराध", "crime", "दुर्घटना", "accident", "आगलागी", "fire",
      "बाढी", "flood", "पहिरो", "landslide", "भूकम्प", "earthquake", "प्राकृतिक",
      "natural", "विपद", "disaster", "मौसम", "weather", "पानी", "rain",
      "सडक", "road", "यातायात", "transport", "बस", "gadi", "सवारी",
      "मानव अधिकार", "human rights", "महिला", "women", "बालबालिका", "children",
      "जेष्ठ नागरिक", "elderly", "अपाङ्ग", "disabled", "सहयोग", "help",
      "दान", "donation", "सहयोग", "support", "स्वयंसेवक", "volunteer"
    ],
    weight: 1.1,
  },
  antarrastriya: {
    id: "99999999-9999-9999-9999-999999999999",
    name: "अन्तर्राष्ट्रिय",
    keywords: [
      "अन्तर्राष्ट्रिय", "international", "विदेश", "foreign", "विश्व",
      "world", "global", "देश", "country", "भारत", "india", "चीन", "china",
      "अमेरिका", "america", "usa", "युरोप", "europe", "एसिया", "asia",
      "संयुक्त राष्ट्र", "united nations", "UN", "विदेश नीति", "foreign policy",
      "राजदूत", "ambassador", "दूतावास", "embassy", "कूटनीति", "diplomacy",
      "विदेशी", "foreigner", "प्रवासी", "migrant", "NRI", "NRN",
      "वैदेशिक रोजगार", "foreign employment", "गल्फ", "gulf", "मलेसिया",
      "malaysia", "कोरिया", "korea", "जापान", "japan", "ऑस्ट्रेलिया", "australia"
    ],
    weight: 1.2,
  },
  prabidhi: {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    name: "प्रविधि",
    keywords: [
      "प्रविधि", "technology", "tech", "इन्टरनेट", "internet", "मोबाइल",
      "mobile", "कम्प्युटर", "computer", "ल्यापटप", "laptop", "सफ्टवेयर",
      "software", "हार्डवेयर", "hardware", "एप", "app", "वेबसाइट", "website",
      "डिजिटल", "digital", "अनलाइन", "online", "साइबर", "cyber", "सुरक्षा",
      "security", "ह्याक", "hack", "सोसल मिडिया", "social media", "फेसबुक",
      "facebook", "ट्विटर", "twitter", "इन्स्टाग्राम", "instagram", "टिकटक",
      "tiktok", "युट्युब", "youtube", "एआइ", "AI", "artificial intelligence",
      "रोबोट", "robot", "ड्रोन", "drone", "साटेलाइट", "satellite", "5G", "4G"
    ],
    weight: 1.2,
  },
};

export function detectCategory(title: string, content: string): {
  categoryId: string;
  categoryName: string;
  confidence: number;
  matchedKeywords: string[];
} {
  const text = `${title} ${content}`.toLowerCase();
  let bestMatch = {
    categoryId: "mukhya",
    categoryName: "मुख्य",
    confidence: 0,
    matchedKeywords: [] as string[],
  };

  for (const [key, category] of Object.entries(categoryKeywords)) {
    let score = 0;
    const matched: string[] = [];

    for (const keyword of category.keywords) {
      const keywordLower = keyword.toLowerCase();
      // Check exact match or partial match
      if (text.includes(keywordLower)) {
        score += category.weight;
        matched.push(keyword);
      }
    }

    // Title matches get higher weight
    const titleLower = title.toLowerCase();
    for (const keyword of category.keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        score += category.weight * 2; // Double weight for title matches
      }
    }

    if (score > bestMatch.confidence) {
      bestMatch = {
        categoryId: category.id,
        categoryName: category.name,
        confidence: score,
        matchedKeywords: matched.slice(0, 5), // Top 5 matches
      };
    }
  }

  return bestMatch;
}

// Helper to get all categories for dropdown
export function getAllCategories() {
  return Object.values(categoryKeywords).map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));
}

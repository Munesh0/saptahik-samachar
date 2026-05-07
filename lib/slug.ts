// lib/slug.ts
const nepaliToLatin: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah',
  'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
  'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'yan',
  'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
  'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
  'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
  'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'wa', 'श': 'sha',
  'ष': 'sha', 'स': 'sa', 'ह': 'ha', 'क्ष': 'chya', 'त्र': 'tra',
  'ज्ञ': 'gya', 'श्र': 'shra', 'ड़': 'da', 'ढ़': 'dha',
  'ा': 'a', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'm', 'ः': 'h',
  '्': '', 'ँ': 'n', 'ृ': 'ri', 'ॄ': 'ri',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

export function generateSlug(title: string, id?: string | number): string {
  if (!title || title.trim().length === 0) {
    return id ? `news-${id}` : 'untitled';
  }

  let latin = title.trim().toLowerCase();

  // Transliterate Nepali to Latin
  for (const [nepali, latinChar] of Object.entries(nepaliToLatin)) {
    latin = latin.split(nepali).join(latinChar);
  }

  // Clean up
  latin = latin
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!latin || latin === '-') {
    return id ? `news-${id}` : 'untitled';
  }

  return latin;
}
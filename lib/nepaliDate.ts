// lib/nepaliDate.ts
const BS_MONTHS = [
  "वैशाख", "जेठ", "असार", "श्रावण", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुष", "माघ", "फाल्गुन", "चैत"
];

// Approximate month boundaries for 2081-2083 BS
// Format: [Gregorian Start Month, Start Day]
const MONTH_STARTS = [
  [4, 14],   // Baisakh
  [5, 15],   // Jestha
  [6, 15],   // Asar
  [7, 16],   // Shrawan
  [8, 17],   // Bhadra
  [9, 17],   // Ashwin
  [10, 17],  // Kartik
  [11, 16],  // Mangsir
  [12, 16],  // Poush
  [1, 14],   // Magh
  [2, 13],   // Falgun
  [3, 15],   // Chaitra
];

export function gregorianToBS(date: Date): string {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1; // 1-12
  const gDay = date.getDate();

  // Determine BS year
  let bsYear: number;
  const isNewYear = gMonth > 4 || (gMonth === 4 && gDay >= 14);
  if (isNewYear) {
    bsYear = gYear + 57;
  } else {
    bsYear = gYear + 56;
  }

  // Find BS month and day
  let bsMonthIndex = 0;
  let bsDay = gDay;

  for (let i = 0; i < 12; i++) {
    const [startMonth, startDay] = MONTH_STARTS[i];
    const nextIndex = (i + 1) % 12;
    const [nextMonth, nextDay] = MONTH_STARTS[nextIndex];

    const currentDate = gMonth * 100 + gDay;
    const startDate = startMonth * 100 + startDay;
    let nextDate = nextMonth * 100 + nextDay;

    // Handle year wrap-around (Poush → Magh)
    if (nextDate < startDate) nextDate += 1200;

    let checkDate = currentDate;
    if (i >= 8 && gMonth < 4) checkDate += 1200; // Months 9-12 are in next Gregorian year

    if (checkDate >= startDate && checkDate < nextDate) {
      bsMonthIndex = i;
      bsDay = gDay - startDay + 1;
      if (bsDay <= 0) bsDay += 30; // rough correction
      break;
    }
  }

  // Nepali numerals
  const toNepaliNum = (n: number) =>
    n.toString().replace(/[0-9]/g, (w) => "०१२३४५६७८९"[parseInt(w)]);

  return `${toNepaliNum(bsDay)} ${BS_MONTHS[bsMonthIndex]} ${toNepaliNum(bsYear)}`;
}

export function getTodayBS(): string {
  return gregorianToBS(new Date());
}
/**
 * Parse a Russian voice/text utterance into { text, scheduledFor? }.
 * Recognizes: «на 17:00», «в 10 утра», «в 9 вечера», «сегодня», «завтра»,
 * «послезавтра», «в понедельник/вторник/...».
 */

const WEEKDAYS_RU = [
  ["воскресенье", "вс"],
  ["понедельник", "пн"],
  ["вторник", "вт"],
  ["среду", "среда", "ср"],
  ["четверг", "чт"],
  ["пятницу", "пятница", "пт"],
  ["субботу", "суббота", "сб"],
];

export interface ParsedVoice {
  text: string;
  scheduledFor?: number;
  timeKnown: boolean;
  dateKnown: boolean;
}

export function parseVoice(input: string, now: Date = new Date()): ParsedVoice {
  let s = " " + input.trim() + " ";
  let dateOffset = 0; // days from today
  let dateKnown = false;
  let hour: number | null = null;
  let minute = 0;

  // --- date keywords ---
  const dateMatchers: { re: RegExp; offset: number }[] = [
    { re: /\bпослезавтра\b/i, offset: 2 },
    { re: /\bзавтра\b/i, offset: 1 },
    { re: /\bсегодня\b/i, offset: 0 },
  ];
  for (const m of dateMatchers) {
    if (m.re.test(s)) {
      dateOffset = m.offset;
      dateKnown = true;
      s = s.replace(m.re, " ");
      break;
    }
  }

  // weekday
  if (!dateKnown) {
    for (let i = 0; i < WEEKDAYS_RU.length; i++) {
      for (const word of WEEKDAYS_RU[i]) {
        const re = new RegExp(`\\b(в|во)\\s+${word}\\b`, "i");
        if (re.test(s)) {
          let diff = (i - now.getDay() + 7) % 7;
          if (diff === 0) diff = 7;
          dateOffset = diff;
          dateKnown = true;
          s = s.replace(re, " ");
          break;
        }
      }
      if (dateKnown) break;
    }
  }

  // --- time: «17:00», «на 17:00», «в 17:30» ---
  const hhmm = s.match(/\b(?:на|в|к)?\s*(\d{1,2}):(\d{2})\b/i);
  if (hhmm) {
    hour = parseInt(hhmm[1], 10);
    minute = parseInt(hhmm[2], 10);
    s = s.replace(hhmm[0], " ");
  } else {
    // «в 10 утра / 9 вечера / 3 дня / 11 ночи»
    const tod = s.match(/\b(?:на|в|к)\s+(\d{1,2})\s*(утра|утром|дня|днём|днем|вечера|вечером|ночи|ночью)\b/i);
    if (tod) {
      let h = parseInt(tod[1], 10);
      const period = tod[2].toLowerCase();
      if (/вечер|ноч/.test(period) && h < 12) h += 12;
      if (/дн/.test(period) && h < 12) h += 12;
      // утра — оставляем как есть; 12 утра трактуем как 0
      if (/утр/.test(period) && h === 12) h = 0;
      hour = h;
      minute = 0;
      s = s.replace(tod[0], " ");
    } else {
      const bare = s.match(/\b(?:на|в|к)\s+(\d{1,2})\s+часов?\b/i);
      if (bare) {
        hour = parseInt(bare[1], 10);
        minute = 0;
        s = s.replace(bare[0], " ");
      }
    }
  }

  const timeKnown = hour !== null;

  let scheduledFor: number | undefined;
  if (timeKnown || dateKnown) {
    const d = new Date(now);
    d.setDate(d.getDate() + dateOffset);
    if (hour !== null) {
      d.setHours(hour, minute, 0, 0);
    } else {
      // date-only — leave at noon
      d.setHours(12, 0, 0, 0);
    }
    scheduledFor = d.getTime();
  }

  // cleanup leftover prepositions
  const text = s.replace(/\s+/g, " ").trim().replace(/^(на|в|к)\s+/i, "");

  return { text, scheduledFor, timeKnown, dateKnown };
}

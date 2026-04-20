export type CustomRange = { start: string; end: string };

export const getTimeRangeTotalMinutes = (
  range: string,
  customRange?: CustomRange | null,
): number => {
  switch (range) {
    case '5m':
      return 5;
    case '30m':
      return 30;
    case '6h':
      return 6 * 60;
    case '12h':
      return 12 * 60;
    case '24h':
      return 24 * 60;
    case 'thisWeek':
    case 'lastWeek':
      return 7 * 24 * 60;
    case 'thisMonth':
    case 'lastMonth':
      return 30 * 24 * 60;
    case 'custom': {
      if (!customRange) return 24 * 60;
      const startMs = new Date(customRange.start).getTime();
      const endMs = new Date(customRange.end).getTime();
      const safeEnd = Number.isFinite(endMs) ? endMs : Date.now();
      const safeStart = Number.isFinite(startMs) ? startMs : safeEnd - 24 * 60 * 60 * 1000;
      const diff = Math.max(5, Math.round((safeEnd - safeStart) / 60000));
      return diff;
    }
    default:
      return 5;
  }
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const makeSeededRandom = (seedInput: string) => {
  let seed = hashString(seedInput) || 1;

  // Mulberry32 PRNG
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

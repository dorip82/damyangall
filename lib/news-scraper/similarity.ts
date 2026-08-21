/**
 * Same story often runs on multiple local outlets with near-identical
 * headlines ("담양군, OOO 실시" vs "담양군 OOO 실시했다"). A simple
 * normalized-token Jaccard overlap is enough to catch that without pulling
 * in an NLP dependency for what's just a few dozen headlines a day.
 */
function normalize(title: string): Set<string> {
  const cleaned = title
    .toLowerCase()
    .replace(/\[[^\]]*\]/g, " ") // strip "[담양신문]" style source tags
    .replace(/[^\p{L}\p{N}\s]/gu, " ") // strip punctuation, keep letters/digits
    .trim();
  return new Set(cleaned.split(/\s+/).filter((w) => w.length > 1));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const SIMILARITY_THRESHOLD = 0.6;

export function isSimilarTitle(a: string, b: string): boolean {
  return jaccard(normalize(a), normalize(b)) >= SIMILARITY_THRESHOLD;
}

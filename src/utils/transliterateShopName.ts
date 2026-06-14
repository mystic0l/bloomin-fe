/**
 * Display-only transliteration for shop names when Hindi UI is active.
 * Keeps semantics unchanged and only converts Latin-script names to Devanagari-like text.
 */
const DIRECT_WORDS: Record<string, string> = {
  and: 'एंड',
  '&': 'एंड',
  shop: 'शॉप',
  store: 'स्टोर',
  bakery: 'बेकरी',
  breads: 'ब्रेड्स',
  bread: 'ब्रेड',
  bun: 'बन',
  buns: 'बन्स',
};

function transliterateToken(token: string): string {
  const lower = token.toLowerCase();
  if (DIRECT_WORDS[lower]) return DIRECT_WORDS[lower];

  // Very small phonetic mapping for common shop-name words.
  let out = lower
    .replace(/tion/g, 'शन')
    .replace(/ph/g, 'फ')
    .replace(/sh/g, 'श')
    .replace(/ch/g, 'च')
    .replace(/th/g, 'थ')
    .replace(/kh/g, 'ख')
    .replace(/gh/g, 'घ')
    .replace(/bh/g, 'भ')
    .replace(/dh/g, 'ध')
    .replace(/oo/g, 'ू')
    .replace(/ee/g, 'ी')
    .replace(/ai/g, 'ै')
    .replace(/au/g, 'ौ')
    .replace(/a/g, 'अ')
    .replace(/b/g, 'ब')
    .replace(/c/g, 'क')
    .replace(/d/g, 'ड')
    .replace(/e/g, 'े')
    .replace(/f/g, 'फ')
    .replace(/g/g, 'ग')
    .replace(/h/g, 'ह')
    .replace(/i/g, 'ि')
    .replace(/j/g, 'ज')
    .replace(/k/g, 'क')
    .replace(/l/g, 'ल')
    .replace(/m/g, 'म')
    .replace(/n/g, 'न')
    .replace(/o/g, 'ो')
    .replace(/p/g, 'प')
    .replace(/q/g, 'क')
    .replace(/r/g, 'र')
    .replace(/s/g, 'स')
    .replace(/t/g, 'ट')
    .replace(/u/g, 'ु')
    .replace(/v/g, 'व')
    .replace(/w/g, 'व')
    .replace(/x/g, 'क्स')
    .replace(/y/g, 'य')
    .replace(/z/g, 'ज');

  if (out.length > 0) out = out[0].toUpperCase() + out.slice(1);
  return out;
}

export function getDisplayShopName(name: string, isHindi: boolean): string {
  if (!isHindi) return name;
  if (!name) return '';

  return name
    .replace(/&/g, ' & ')
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => transliterateToken(token))
    .join(' ');
}
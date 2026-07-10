// Matches: ==phrase==[type: value] — tolerant of surrounding whitespace,
// e.g. `== phrase ==[ gif : url ]`, so natural typing in Notion just works.
// Types: gif | meme | quote | link (url is an alias for link).
const RE = /==\s*([^=]+?)\s*==\s*\[\s*(gif|meme|quote|link|url)\s*:\s*([^\]]+?)\s*\]/g;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// Splits a quote value like: "text" — source   ->  { quote, source }
function parseQuote(raw) {
  const m = raw.match(/^\s*"([^"]*)"\s*(?:[—-]\s*(.+))?\s*$/);
  if (m) return { quote: m[1], source: m[2] ? m[2].trim() : null };
  return { quote: raw.trim(), source: null };
}

export function parseFootnotes(markdown) {
  const footnotes = [];
  const mdx = markdown.replace(RE, (_full, phrase, type, value) => {
    phrase = phrase.trim();
    if (type === 'quote') {
      const { quote, source } = parseQuote(value);
      footnotes.push({ kind: 'quote', phrase, quote, source });
      return `<Footnote kind="quote" quote="${esc(quote)}"${
        source ? ` source="${esc(source)}"` : ''
      }>${phrase}</Footnote>`;
    }
    if (type === 'link' || type === 'url') {
      const href = value.trim();
      footnotes.push({ kind: 'link', phrase, href });
      return `<Footnote kind="link" href="${esc(href)}">${phrase}</Footnote>`;
    }
    const src = value.trim();
    footnotes.push({ kind: type, phrase, src });
    return `<Footnote kind="${type}" src="${esc(src)}">${phrase}</Footnote>`;
  });
  return { mdx, footnotes };
}

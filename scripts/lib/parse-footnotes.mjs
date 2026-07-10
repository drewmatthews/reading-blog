// Matches: ==phrase==[type: value] — tolerant of surrounding whitespace,
// e.g. `== phrase ==[ gif : url ]`, so natural typing in Notion just works.
const RE = /==\s*([^=]+?)\s*==\s*\[\s*(gif|meme|quote)\s*:\s*([^\]]+?)\s*\]/g;

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
  const mdx = markdown.replace(RE, (_full, phrase, kind, value) => {
    phrase = phrase.trim();
    if (kind === 'quote') {
      const { quote, source } = parseQuote(value);
      footnotes.push({ kind, phrase, quote, source });
      return `<Footnote kind="quote" quote="${esc(quote)}"${
        source ? ` source="${esc(source)}"` : ''
      }>${phrase}</Footnote>`;
    }
    const src = value.trim();
    footnotes.push({ kind, phrase, src });
    return `<Footnote kind="${kind}" src="${esc(src)}">${phrase}</Footnote>`;
  });
  return { mdx, footnotes };
}

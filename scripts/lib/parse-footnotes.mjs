// Matches: ==phrase==[type: value] — tolerant of surrounding whitespace,
// e.g. `== phrase ==[ gif : url ]`, so natural typing in Notion just works.
// Types: gif | meme | quote | link (aliases: url→link, img/image→meme).
const RE = /==\s*([^=]+?)\s*==\s*\[\s*(gif|meme|img|image|quote|link|url)\s*:\s*([^\]]+?)\s*\]/g;

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// Google mobile often hands you a google.com/url?...&url=<real> wrapper. Unwrap it so
// the popover gets (and can detect/embed) the real destination.
function unwrapRedirect(u) {
  try {
    const url = new URL(u);
    if (url.hostname.replace(/^www\./, '') === 'google.com' && url.pathname === '/url') {
      return url.searchParams.get('url') || url.searchParams.get('q') || u;
    }
  } catch {
    // not a parseable URL — leave it alone
  }
  return u;
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
      const href = unwrapRedirect(value.trim());
      footnotes.push({ kind: 'link', phrase, href });
      return `<Footnote kind="link" href="${esc(href)}">${phrase}</Footnote>`;
    }
    // media: gif | meme | img | image  (img/image render like a meme)
    const kind = type === 'img' || type === 'image' ? 'meme' : type;
    const src = value.trim();
    footnotes.push({ kind, phrase, src });
    return `<Footnote kind="${kind}" src="${esc(src)}">${phrase}</Footnote>`;
  });
  return { mdx, footnotes };
}

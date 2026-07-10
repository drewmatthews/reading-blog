// Usage: node scripts/build-update.mjs <update-slug> <input.md>
// Reads a pasted update (frontmatter + shorthand body), downloads gif/meme media
// into public/media/<slug>/, and writes src/content/updates/<slug>.mdx.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { parseFootnotes } from './lib/parse-footnotes.mjs';

const [slug, inputPath] = process.argv.slice(2);
if (!slug || !inputPath) {
  console.error('Usage: node scripts/build-update.mjs <update-slug> <input.md>');
  process.exit(1);
}

const raw = await readFile(inputPath, 'utf8');
const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
if (!fmMatch) throw new Error('Input must start with a --- frontmatter block ---');
const [, frontmatter, body] = fmMatch;

let { mdx, footnotes } = parseFootnotes(body);

const mediaFootnotes = footnotes.filter((f) => f.kind === 'gif' || f.kind === 'meme');
if (mediaFootnotes.length) await mkdir(`public/media/${slug}`, { recursive: true });

let i = 0;
for (const f of mediaFootnotes) {
  i += 1;
  const res = await fetch(f.src);
  if (!res.ok) throw new Error(`Failed to fetch ${f.src}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = extname(new URL(f.src).pathname) || '.gif';
  const localPath = `/media/${slug}/${i}${ext}`;
  await writeFile(`public${localPath}`, buf);
  // match the exact (HTML-escaped) src the parser emitted, so `&` in URLs still swaps
  const escSrc = f.src.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  mdx = mdx.replace(`src="${escSrc}"`, `media="${localPath}"`);
}

const importLine = footnotes.length
  ? `import Footnote from '@components/Footnote.astro';\n\n`
  : '';
const out = `---\n${frontmatter}\n---\n${importLine}${mdx}\n`;
await writeFile(`src/content/updates/${slug}.mdx`, out);
console.log(`Wrote src/content/updates/${slug}.mdx (${footnotes.length} footnotes, ${mediaFootnotes.length} media)`);

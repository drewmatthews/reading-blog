import { getEntry, type CollectionEntry } from 'astro:content';

// Book override wins; else the series theme; else 'default'.
export async function resolveTheme(book: CollectionEntry<'books'>): Promise<string> {
  if (book.data.theme) return book.data.theme;
  if (book.data.series) {
    const s = await getEntry(book.data.series);
    if (s) return s.data.theme;
  }
  return 'default';
}

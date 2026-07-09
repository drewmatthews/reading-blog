import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const series = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/series' }),
  schema: z.object({
    title: z.string(),
    theme: z.string().default('default'),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      series: reference('series').optional(),
      order: z.number().default(0),
      cover: image().optional(),
      status: z.enum(['reading', 'finished', 'up-next']).default('reading'),
      format: z.string().default('audiobook'),
      theme: z.string().optional(), // overrides series theme when set
    }),
});

const updates = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/updates' }),
  schema: z.object({
    title: z.string(),
    book: reference('books'),
    chapters: z.string(),
    date: z.coerce.date(),
    rating: z.number().nullable().default(null),
    prediction: z.boolean().default(false),
  }),
});

export const collections = { series, books, updates };

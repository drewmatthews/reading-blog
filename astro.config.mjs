import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  // We own base styles in global.css (which has the @tailwind directives),
  // so disable the integration's base-style injection.
  integrations: [mdx(), tailwind({ applyBaseStyles: false })],
  site: 'https://reading.drewmatthews.ca',
});

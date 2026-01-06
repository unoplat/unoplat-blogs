// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import photosuite from 'photosuite';
import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://blogs.unoplat.io',
	integrations: [
		mdx({ remarkPlugins: [remarkReadingTime] }),
		sitemap(),
		react(),
		photosuite({
			scope: '.prose',
			glightbox: true,
			imageAlts: true,
		}),
	],
	markdown: {
		remarkPlugins: [remarkReadingTime],
	},
	vite: {
		plugins: [tailwindcss()],
	},
});

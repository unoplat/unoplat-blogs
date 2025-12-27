import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			// Tags for categorization
			tags: z.array(z.string()).default([]),
			// Reference to author from authors collection
			author: reference('authors'),
			// Draft posts are excluded from production builds
			draft: z.boolean().default(false),
		}),
});

const authors = defineCollection({
	// Load individual JSON files for each author
	loader: glob({ base: './src/content/authors', pattern: '**/*.json' }),
	schema: z.object({
		name: z.string(),
		bio: z.string(),
		avatar: z.string().optional(),
		// Social links
		twitter: z.string().optional(),
		github: z.string().optional(),
		linkedin: z.string().optional(),
		website: z.string().optional(),
	}),
});

export const collections = { blog, authors };

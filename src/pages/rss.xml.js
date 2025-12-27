import { getCollection, getEntry } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '@/consts';

export async function GET(context) {
	const posts = await getCollection('blog', ({ data }) => {
		// Filter out draft posts in production
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// Sort posts by publication date (newest first)
	const sortedPosts = posts.sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	// Resolve author references for each post
	const items = await Promise.all(
		sortedPosts.map(async (post) => {
			const author = await getEntry(post.data.author);
			const authorName = author?.data?.name ?? 'Unoplat';

			return {
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: `/blog/${post.id}/`,
				categories: post.data.tags,
				// Include author in customData as dc:creator element
				customData: `<dc:creator><![CDATA[${authorName}]]></dc:creator>`,
			};
		}),
	);

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		// Add Dublin Core namespace for dc:creator
		xmlns: {
			dc: 'http://purl.org/dc/elements/1.1/',
		},
		items,
	});
}

import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
	return function (tree, { data }) {
		const text = toString(tree);
		const readingTime = getReadingTime(text);

		if (!data.astro) data.astro = {};
		if (!data.astro.frontmatter) data.astro.frontmatter = {};

		data.astro.frontmatter.minutesRead = readingTime.text;
	};
}

import { defineHastPlugin, type HastContent } from 'satteri';

type Element = Extract<HastContent, { type: 'element' }>;

function figure(image: Element): Element {
	const caption = String(image.properties.title || image.properties.alt || '').trim();
	return {
		type: 'element',
		tagName: 'figure',
		properties: {},
		children: caption
			? [image, {
				type: 'element',
				tagName: 'figcaption',
				properties: {},
				children: [{ type: 'text', value: caption }],
			}]
			: [image],
	};
}

// Runs before Astro's image marker, preserving local image optimization in MD/MDX.
export const satteriFigures = defineHastPlugin({
	name: 'satteri-figures',
	element: {
		filter: ['p'],
		visit(node) {
			const children = node.children.filter(
				(child) => !(child.type === 'text' && !child.value.trim()),
			);
			if (!children.length || !children.every(
				(child): child is Element => child.type === 'element' && child.tagName === 'img',
			)) return;

			const figures = children.map(figure);
			return figures.length === 1 ? figures[0] : {
				type: 'element',
				tagName: 'div',
				properties: { className: ['image-grid'] },
				children: figures,
			};
		},
	},
});

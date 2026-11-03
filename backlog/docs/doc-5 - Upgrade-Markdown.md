---
id: doc-5
title: 'Upgrade Markdown: features removed for the Astro 7 (Sätteri) upgrade'
type: other
created_date: '2026-11-03 00:00'
---
# Upgrade Markdown: features removed for the Astro 7 upgrade

The site now uses Astro 7's native Sätteri Markdown processor. Two features
that depended on remark/rehype plugins were removed or replaced. This doc
captures the reading-time removal and the open-source image replacements.

# 1. Reading Time Plugin

## Why it was removed

Astro 7 replaced the remark/rehype (`unified`) Markdown pipeline with
[Sätteri](https://satteri.bruits.org/) as the default processor, and
`@astrojs/markdown-remark` is no longer installed by default. Our custom
`remarkReadingTime` remark plugin was registered via the now-deprecated
`markdown.remarkPlugins` option, which makes `astro build` fail on Astro 7:

```
`markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype`
run on the `unified` processor from `@astrojs/markdown-remark`, which is no
longer installed by default now that Sätteri is the default Markdown processor.
```

To unblock the Astro 5 → 7 upgrade, the plugin was removed. This doc captures
exactly what was removed so the feature can be brought back.

Upgrade guide: https://docs.astro.build/en/guides/upgrade-to/v7/#new-default-markdown-processor-sätteri

## What the feature did

Each blog post showed an estimated reading time (e.g. `8 min read`) in the
post header meta row, next to the publish date.

## What was removed

### 1. `remark-reading-time.mjs` (repo root, deleted)

```js
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
```

### 2. `astro.config.mjs`

```js
import { remarkReadingTime } from "./remark-reading-time.mjs";
// ...
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
```

### 3. `src/pages/blog/[...slug].astro`

```astro
const { Content, remarkPluginFrontmatter } = await render(post);
const minutesRead = remarkPluginFrontmatter?.minutesRead as string | undefined;
// ...
<BlogPost {...post.data} author={author} minutesRead={minutesRead}>
```

### 4. `src/layouts/BlogPost.astro`

```astro
// Props
	minutesRead?: string;
// destructure
const { ..., minutesRead } = Astro.props;
// meta row, after <FormattedDate date={pubDate} />
{minutesRead && <span>{minutesRead}</span>}
```

### 5. Dependencies (`package.json`)

- `reading-time` `^1.5.0`
- `mdast-util-to-string` `^4.0.0`

## Options to bring it back

1. **Stay on `unified()` for Markdown** (smallest change, verified to build on Astro 7.4.4):
   ```bash
   pnpm add @astrojs/markdown-remark reading-time mdast-util-to-string
   ```
   ```js
   import { unified } from "@astrojs/markdown-remark";
   markdown: { processor: unified({ remarkPlugins: [remarkReadingTime] }) },
   ```
   Trade-off: opts out of the faster Sätteri pipeline. Note that `astro-mermaid`
   2.x detects the processor and handles both `unified` and `satteri`.

2. **Port the plugin to a Sätteri MDAST plugin** (keeps the native pipeline).
   See https://satteri.bruits.org/docs/plugins/ — needs checking whether
   Sätteri plugins can still write to `data.astro.frontmatter` /
   `remarkPluginFrontmatter`.

3. **Compute it outside the Markdown pipeline**: in `[...slug].astro`, run
   `reading-time` on `post.body` (the raw MDX source available from the
   content layer). No Markdown plugin needed; slightly less accurate because it
   counts import lines / JSX / code fences unless stripped first.

# 2. Photosuite replaced with open-source image features

## What changed

`photosuite` is fully removed, including its CSS, client, integration and
transitive Fancybox dependency. Photosuite 0.4.0 is GPL-3.0 and Fancybox has
commercial licensing requirements; the replacement keeps the Sätteri pipeline
without either dependency.

## What replaced it

- **PhotoSwipe v5 (MIT)** supplies the lightbox in `src/layouts/BlogPost.astro`.
  Its core is lazy-loaded on opening. Prose images support click, Enter and
  Space, and the lightbox shows figcaption text (falling back to alt text).
  Initialization runs on `astro:page-load`; listeners and lightbox instances
  are destroyed on `astro:before-swap` for ClientRouter navigation. Mermaid,
  SVGs, icons and images marked `data-no-zoom` are excluded.
- **Local Sätteri HAST plugin**, `src/plugins/satteri-figures.ts`, provides
  server-rendered figures and captions in Markdown and MDX. Image-only
  paragraphs become figures; two or more images in the same paragraph become
  an `image-grid`. Captions prefer title over alt and omit empty text. Existing
  posts use Markdown image syntax, not JSX image components. Astro still
  optimizes local images inside the figures.
- **Site CSS** in `src/styles/global.css` styles muted captions and responsive
  grids (one column on mobile, two from 640px), plus zoom cursors and focus rings.

Intentionally dropped:
- **EXIF overlay** (`exiftoolVendored`). Our blog images had no EXIF data, so
  nothing was shown before either.
- **Image URL rewriting** (`imageUrl`: `imageBase` / `imageDir` / `fileDir`). We
  never configured these options, so this did nothing.

## Version risk

`satteri` is pre-1.0, so its plugin API can change. It is pinned directly to
**0.10.5**, the same version resolved by the pinned
`@astrojs/markdown-satteri` **0.4.6**, to avoid separate runtime copies. Upgrade
these together and re-check captions, grids, MDX, optimized images and Mermaid.

# 3. Markdown processor config added for mermaid

`astro-mermaid` 2.2 adds a Sätteri plugin that returns raw
`<pre class="mermaid">` HTML. MDX on Sätteri rejects raw HTML by default
(`mdxjs-rs:raw-html` build error), so `astro.config.mjs` now sets:

```js
import { satteri } from "@astrojs/markdown-satteri";
import { satteriFigures } from "./src/plugins/satteri-figures.ts";
markdown: {
  processor: satteri({ features: { rawHtml: true }, hastPlugins: [satteriFigures] }),
},
```

`@astrojs/markdown-satteri` was added as a direct dependency for this import.
If you switch to `unified()` (section 1), replace this processor. astro-mermaid
supports both.

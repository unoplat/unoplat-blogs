import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownToHtml, mdxToJs } from 'satteri';
import { satteriFigures } from '../src/plugins/satteri-figures.ts';

const render = (source) => markdownToHtml(source, { hastPlugins: [satteriFigures] }).html;

test('satteri-figures wraps an image with its alt caption', () => {
  assert.equal(render('![A diagram](/diagram.webp)'),
    '<figure><img src="/diagram.webp" alt="A diagram"><figcaption>A diagram</figcaption></figure>\n');
});

test('satteri-figures prefers title over alt and escapes caption text', () => {
  assert.equal(render('![Alt](/a.png "Title & <detail>")'),
    '<figure><img src="/a.png" alt="Alt" title="Title &amp; <detail>"><figcaption>Title &amp; &lt;detail&gt;</figcaption></figure>\n');
});

test('satteri-figures omits empty captions', () => {
  assert.equal(render('![](/a.png)'), '<figure><img src="/a.png" alt=""></figure>\n');
});

test('satteri-figures groups adjacent images with whitespace into a grid', () => {
  const html = render('![One](/one.png)\n![Two](/two.png)');
  assert.match(html, /^<div class="image-grid"><figure>/);
  assert.equal((html.match(/<figure>/g) || []).length, 2);
  assert.equal((html.match(/<figcaption>/g) || []).length, 2);
});

test('satteri-figures leaves mixed text and linked images as paragraphs', () => {
  assert.match(render('Text ![Alt](/a.png)'), /^<p>Text <img/);
  assert.match(render('[![Alt](/a.png)](/link)'), /^<p><a/);
  assert.equal(render('Plain text'), '<p>Plain text</p>\n');
});

test('satteri-figures supports Markdown image syntax in MDX posts', () => {
  const { code } = mdxToJs('![One](/one.png)\n![Two](/two.png)', {
    hastPlugins: [satteriFigures],
  });
  assert.match(code, /className: "image-grid"/);
  assert.match(code, /figure: "figure"/);
  assert.match(code, /figcaption: "figcaption"/);
});

test('satteri-figures preserves raw Mermaid output', () => {
  const { html } = markdownToHtml('<pre class="mermaid">graph TD; A-->B</pre>', {
    features: { rawHtml: true },
    hastPlugins: [satteriFigures],
  });
  assert.match(html, /<pre class="mermaid">graph TD; A--&gt;B<\/pre>/);
});

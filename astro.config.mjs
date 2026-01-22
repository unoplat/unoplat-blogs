// @ts-check

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import mermaid from "astro-mermaid";
import photosuite from "photosuite";
import { defineConfig } from "astro/config";
import { remarkReadingTime } from "./remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://blogs.unoplat.io",
  integrations: [
    mermaid({
      theme: "forest",
      autoTheme: true,
      mermaidConfig: {
        flowchart: {
          curve: "basis",
          nodeSpacing: 60,
          rankSpacing: 80,
        },
        er: {
          diagramPadding: 30,
          minEntityWidth: 200,
          minEntityHeight: 120,
          entityPadding: 25,
          layoutDirection: "TB",
        },
        themeCSS: `
          /* Flowchart lines */
          .edgePath .path, .flowchart-link, .relationshipLine { stroke-width: 2px; }
          .arrowheadPath { stroke-width: 2px; }

          /* ER Diagram Entity Names - CORRECT Mermaid v11 selectors */
          /* The old .entityLabel class NO LONGER EXISTS in v11 */
          g.label.name, g.label.name text, g.label.name .nodeLabel, g.label.name tspan {
            font-size: 18px !important;
            font-weight: 600 !important;
          }

          /* ER Diagram Attributes */
          g.label.attribute-type, g.label.attribute-name,
          g.label.attribute-type text, g.label.attribute-name text,
          g.label.attribute-type .nodeLabel, g.label.attribute-name .nodeLabel {
            font-size: 14px !important;
          }

          /* ER Diagram - All nodeLabel elements */
          .nodeLabel {
            font-size: 16px !important;
          }

          /* ER Diagram - Relationship labels on edges */
          .edgeLabel .label, .edgeLabel .label text {
            font-size: 14px !important;
            font-weight: 500 !important;
          }
        `,
      },
    }),
    mdx({ extendMarkdownConfig: true }),
    sitemap(),
    react(),
    photosuite({
      scope: ".prose",
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

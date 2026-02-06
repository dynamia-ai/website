import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

interface RehypeImageCaptionsOptions {
  language: 'en' | 'zh';
}

export default function rehypeImageCaptions(options: RehypeImageCaptionsOptions) {
  return (tree: Root) => {
    let imageCounter = 0;

    visit(tree, 'element', (node, index, parent) => {
      // Only process img tags with alt text
      if (
        node.tagName === 'img' &&
        node.properties?.alt &&
        typeof node.properties.alt === 'string' &&
        node.properties.alt.trim().length > 0 &&
        parent && // Make sure we have a parent
        typeof index === 'number' // Make sure we have a valid index
      ) {
        imageCounter++;

        // Get alt text
        const altText = node.properties.alt as string;

        // Generate caption based on language
        let captionNumber: string;
        if (options.language === 'zh') {
          // Chinese numbering: 图1, 图2, 图3...
          captionNumber = `图${imageCounter}`;
        } else {
          // English numbering: Figure 1, Figure 2, ...
          captionNumber = `Figure ${imageCounter}`;
        }

        // Create a new figure element
        const figureNode: Element = {
          type: 'element',
          tagName: 'figure',
          properties: {
            className: ['blog-image-figure'],
          },
          children: [
            { ...node }, // Clone the image node
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {
                className: ['blog-image-caption'],
              },
              children: [
                {
                  type: 'text',
                  value: `${captionNumber}: ${altText}`,
                },
              ],
            },
          ],
        };

        // Replace the img node with the figure node in the parent's children array
        (parent as Element).children[index!] = figureNode;
      }
    });
  };
}

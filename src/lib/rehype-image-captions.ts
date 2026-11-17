import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

interface RehypeImageCaptionsOptions {
  figureLabel: string;
}

export default function rehypeImageCaptions(options: RehypeImageCaptionsOptions) {
  return (tree: Root) => {
    let imageCounter = 0;

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'img' && node.properties.title === 'no-caption') {
        delete node.properties.title;
        return;
      }

      if (
        node.tagName === 'img' &&
        node.properties?.alt &&
        typeof node.properties.alt === 'string' &&
        node.properties.alt.trim().length > 0 &&
        parent &&
        typeof index === 'number'
      ) {
        const altText = node.properties.alt as string;
        const unnumbered = node.properties.title === 'unnumbered-caption';
        if (unnumbered) delete node.properties.title;
        const caption = unnumbered
          ? altText
          : `${options.figureLabel.replace('{n}', String(++imageCounter))}: ${altText}`;

        const figureNode: Element = {
          type: 'element',
          tagName: 'figure',
          properties: {
            className: ['blog-image-figure'],
          },
          children: [
            { ...node },
            {
              type: 'element',
              tagName: 'figcaption',
              properties: {
                className: ['blog-image-caption'],
              },
              children: [
                {
                  type: 'text',
                  value: caption,
                },
              ],
            },
          ],
        };

        (parent as Element).children[index!] = figureNode;
      }
    });
  };
}

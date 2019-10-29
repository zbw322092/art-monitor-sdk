import { serializedNodeWithId, NodeType, elementNode, tagMap, idNodeMap, INode } from './types';
import { parse } from './cssParser';

const tagMap: tagMap = {
  script: 'noscript',
  // camel case svg element tag names
  altglyph: 'altGlyph',
  altglyphdef: 'altGlyphDef',
  altglyphitem: 'altGlyphItem',
  animatecolor: 'animateColor',
  animatemotion: 'animateMotion',
  animatetransform: 'animateTransform',
  clippath: 'clipPath',
  feblend: 'feBlend',
  fecolormatrix: 'feColorMatrix',
  fecomponenttransfer: 'feComponentTransfer',
  fecomposite: 'feComposite',
  feconvolvematrix: 'feConvolveMatrix',
  fediffuselighting: 'feDiffuseLighting',
  fedisplacementmap: 'feDisplacementMap',
  fedistantlight: 'feDistantLight',
  fedropshadow: 'feDropShadow',
  feflood: 'feFlood',
  fefunca: 'feFuncA',
  fefuncb: 'feFuncB',
  fefuncg: 'feFuncG',
  fefuncr: 'feFuncR',
  fegaussianblur: 'feGaussianBlur',
  feimage: 'feImage',
  femerge: 'feMerge',
  femergenode: 'feMergeNode',
  femorphology: 'feMorphology',
  feoffset: 'feOffset',
  fepointlight: 'fePointLight',
  fespecularlighting: 'feSpecularLighting',
  fespotlight: 'feSpotLight',
  fetile: 'feTile',
  feturbulence: 'feTurbulence',
  foreignobject: 'foreignObject',
  glyphref: 'glyphRef',
  lineargradient: 'linearGradient',
  radialgradient: 'radialGradient',
};

function getElementTagName(node: elementNode): string {
  let tagName = tagMap[node.tagName] || node.tagName;
  if (tagName === 'link' && node.attributes._cssText) {
    tagName = 'style';
  }
  return tagName;
}

const HOVER_SELECTOR = /([^\\]):hover/g;
export function addHoverClass(cssText: string): string {
  const ast = parse(cssText, { silent: true });
  if (!ast.stylesheet) {
    return cssText;
  }

  ast.stylesheet.rules.forEach((rule) => {
    if ('selectors' in rule) {
      (rule.selectors || []).forEach((selector: string) => {
        if (HOVER_SELECTOR.test(selector)) {
          const newSelector = selector.replace(HOVER_SELECTOR, '$1.\\:hover');
          cssText = cssText.replace(selector, `${selector}, ${newSelector}`);
        }
      });
    }
  });

  return cssText;
}

function buildNode(
  node: serializedNodeWithId,
  document: Document,
  HACK_CSS: boolean
): Node | null {

  switch (node.type) {
    // DOMImplementation Doc: https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation
    case NodeType.Document:
      return document.implementation.createHTMLDocument();
    case NodeType.DocumentType:
      return document.implementation.createDocumentType(
        node.name,
        node.publicId,
        node.systemId
      );
    case NodeType.Element:
      const tagName = getElementTagName(node);
      let element: Element;
      if (node.isSVG) {
        element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
      } else {
        element = document.createElement(tagName);
      }
      for (const name in node.attributes) {
        if (!node.attributes.hasOwnProperty(name)) {
          continue;
        }

        let value = node.attributes[name];
        value = typeof value === 'boolean' ? '' : value;

        if (!name.startsWith('art_')) {
          const isTextarea = tagName === 'textarea' && name === 'value';
          const isRemoteOrDynamicCss =
            tagName === 'style' && name === '_cssText'
          if (isRemoteOrDynamicCss && HACK_CSS) {
            value = addHoverClass(value);
          }
          if (isTextarea || isRemoteOrDynamicCss) {
            const textNodeChild = document.createTextNode(value);
            for (const child of Array.from(element.childNodes)) {
              if (child.nodeType === element.TEXT_NODE) {
                element.removeChild(child);
              }
            }
            element.appendChild(textNodeChild);
            continue;
          }
          if (tagName === 'iframe' && name === 'src') {
            continue;
          }
          try {
            if (node.isSVG && name === 'xlink:href') {
              element.setAttributeNS('http://www.w3.org/1999/xlink', name, value);
            } else {
              element.setAttribute(name, value);
            }
          } catch (error) {
            // skip invalid attribute, do nothing
          }
        } else {
          if (tagName === 'canvas' && name === 'art_dataURL') {
            const image = document.createElement('img');
            image.src = value;
            image.onload = () => {
              const context = (element as HTMLCanvasElement).getContext('2d');
              if (context) {
                context.drawImage(image, 0, 0, image.width, image.height);
              }
            };
          }
          if (name === 'art_width') {
            (element as HTMLElement).style.width = value;
          }
          if (name === 'art_height') {
            (element as HTMLElement).style.height = value;
          }
        }
      }
      return element;
    case NodeType.Text:
      return document.createTextNode(
        node.isStyle && HACK_CSS ? addHoverClass(node.textContent) : node.textContent
      );
    case NodeType.CDATA:
      return document.createCDATASection(node.textContent);
    case NodeType.Comment:
      return document.createComment(node.textContent);
    default:
      return null;
  }
}

export function buildNodeWithSerializedNode(
  node: serializedNodeWithId,
  document: Document,
  map: idNodeMap,
  skipChild = false,
  HACK_CSS = true,
): INode | null {
  let builtNode = buildNode(node, document, HACK_CSS);
  if (!builtNode) { return null; }

  if (node.type === NodeType.Document) {
    document.close();
    document.open();
    builtNode = document;
  }

  (builtNode as INode).__sn = node;
  map[node.id] = builtNode as INode;
  if (
    (node.type === NodeType.Document || node.type === NodeType.Element) &&
    !skipChild
  ) {
    for (const childNode of node.childNodes) {
      const builtChildNode = buildNodeWithSerializedNode(childNode, document, map, false, HACK_CSS);
      if (!builtChildNode) {
        console.warn('Failed to rebuild', childNode);
      } else {
        builtNode.appendChild(builtChildNode);
      }
    }
  }
  return builtNode as INode;
}

function rebuild(
  node: serializedNodeWithId,
  document: Document,
  HACK_CSS: boolean = true
): [Node | null, idNodeMap] {

  const idNodeMap: idNodeMap = {};
  return [buildNodeWithSerializedNode(node, document, idNodeMap, false, HACK_CSS), idNodeMap];
}

export default rebuild;
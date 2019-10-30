import { attributes, NodeType, serializedNode, INode, idNodeMap, serializedNodeWithId } from './types';

let _id = 1;
function getId(): number {
  return _id++;
}

function getAbsoluteRef(document: Document, attributeValue: string): string {
  if (attributeValue.trim() === '') {
    return attributeValue;
  }
  let ancher = document.createElement('a');
  ancher.href = attributeValue;
  const href = ancher.href;
  return href;
}

function getAbsoluteSrcset(document: Document, attributeValue: string): string {
  if (attributeValue.trim() === '') {
    return attributeValue;
  }

  const srcsets = attributeValue.split(',');
  const absoluteSrcsets = srcsets.map((src) => {
    const urlAndDescriptor = src.trim().split(' ');
    const absUrl = getAbsoluteRef(document, urlAndDescriptor[0]);
    if (urlAndDescriptor.length === 1) {
      return `${absUrl}`;
    } else if (urlAndDescriptor.length === 2) {
      return `${absUrl} ${urlAndDescriptor[1]}`
    }
    return '';
  }).join(',');

  return absoluteSrcsets;
}

function extractOrigin(url: string): string {
  let origin;
  if (url.indexOf('//') > -1) {
    // example: "https://www.google.com/maps" => "https://www.google.com"
    origin = url
      .split('/')
      .slice(0, 3)
      .join('/');
  } else {
    origin = url.split('/')[0];
  }
  origin = origin.split('?')[0];
  return origin;
}

const URL_IN_CSS_REF = /url\((?:'([^']*)'|"([^"]*)"|([^)]*))\)/gm;
const RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/;
const DATA_URI = /^(data:)([\w\/\+\-]+);(charset=[\w-]+|base64).*,(.*)/i;
function getAbsoluteStylesheet(cssText: string, href: string): string {
  return cssText.replace(URL_IN_CSS_REF, (origin, path1, path2, path3) => {
    const filePath = path1 || path2 || path3;
    if (!filePath) {
      return origin;
    }
    if (!RELATIVE_PATH.test(filePath)) {
      return `url('${filePath}')`;
    }
    if (DATA_URI.test(filePath)) {
      return `url(${filePath})`;
    }
    if (filePath[0] === '/') {
      return `url('${extractOrigin(href) + filePath}')`;
    }
    const stack = href.split('/');
    const parts = filePath.split('/');
    stack.pop();
    for (const part of parts) {
      if (part === '.') {
        continue;
      } else if (part === '.') {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return `url('${stack.join('/')}')`;
  });
}

function getCSSRulesString(styleSheet: CSSStyleSheet): string | null {
  try {
    const rules = styleSheet.rules || styleSheet.cssRules;
    return rules ?
      Array.from(rules).reduce(
        (prev, cur) => prev + getCSSRuleString(cur),
        ''
      ) : null;
  } catch (error) {
    return null;
  }
}

function getCSSRuleString(rule: CSSRule): string {
  return isCSSImportRule(rule) ?
    getCSSRulesString(rule.styleSheet) || ''
    : rule.cssText;
}

function isCSSImportRule(rule: CSSRule): rule is CSSImportRule {
  return 'styleSheet' in rule;
}

function isSVGElement(element: Element): boolean {
  return element.tagName === 'svg' || element instanceof SVGElement;
}

function serializeNode(
  node: Node,
  document: Document,
  blockClass: string | RegExp,
  inlineStylesheet: boolean,
  maskAllInputs: boolean
): serializedNode | false {

  switch (node.nodeType) {
    case node.DOCUMENT_NODE:
      return {
        type: NodeType.Document,
        childNodes: []
      };
    case node.DOCUMENT_TYPE_NODE:
      return {
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/DocumentType
        type: NodeType.DocumentType,
        name: (node as DocumentType).name,
        publicId: (node as DocumentType).publicId,
        systemId: (node as DocumentType).systemId
      };
    case node.ELEMENT_NODE:
      let needBlock = false;
      if (typeof blockClass === 'string') {
        needBlock = (node as Element).classList.contains(blockClass);
      } else {
        (node as Element).classList.forEach((className) => {
          if (blockClass.test(className)) {
            needBlock = true;
          }
        });
      }
      const tagName = (node as Element).tagName.toLowerCase();
      const attributes: attributes = {};
      for (const { name, value } of Array.from((node as Element).attributes)) {
        if (name === 'src' || name === 'href') {
          attributes[name] = getAbsoluteRef(document, value);
        } else if (name === 'srcset') {
          attributes[name] = getAbsoluteSrcset(document, value);
        } else if (name === 'style') {
          attributes[name] = getAbsoluteStylesheet(value, window.location.href);
        } else {
          attributes[name] = value;
        }
      }

      if (tagName === 'link' && inlineStylesheet) {
        const styleSheet = Array.from(document.styleSheets).find((s) => {
          return s.href === (node as HTMLLinkElement).href;
        });

        const cssText = getCSSRulesString(styleSheet as CSSStyleSheet);
        if (cssText) {
          delete attributes.rel;
          delete attributes.href;
          attributes._cssText = getAbsoluteStylesheet(
            cssText,
            styleSheet!.href!,
          );
        }
      }

      if (
        tagName === 'style' &&
        (node as HTMLStyleElement).sheet &&
        !(
          (node as HTMLElement).innerText ||
          (node as HTMLElement).textContent ||
          ''
        ).trim().length
      ) {
        const cssText = getCSSRulesString((node as HTMLStyleElement).sheet as CSSStyleSheet);
        if (cssText) {
          attributes._cssText = getAbsoluteStylesheet(cssText, location.href);
        }
      }

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select'
      ) {
        const value = (node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
        if (
          attributes.type !== 'radio' &&
          attributes.type !== 'checkbox' &&
          value
        ) {
          attributes.value = maskAllInputs ? '*'.repeat(value.length) : value;
        } else if ((node as HTMLInputElement).checked) {
          attributes.checked = (node as HTMLInputElement).checked;
        }
      }

      if (tagName === 'option') {
        const selectValue = (node as HTMLOptionElement).parentElement;
        if (attributes.value === (selectValue as HTMLSelectElement).value) {
          attributes.selected = (node as HTMLOptionElement).selected;
        }
      }

      if (tagName === 'canvas') {
        attributes.art_dataURL = (node as HTMLCanvasElement).toDataURL();
      }

      if (needBlock) {
        const { width, height } = (node as Element).getBoundingClientRect();
        attributes.art_width = `${width}px`;
        attributes.art_height = `${height}px`;
      }

      return {
        type: NodeType.Element,
        tagName,
        attributes,
        childNodes: [],
        isSVG: isSVGElement(node as Element) || undefined,
        needBlock
      };
    
    case node.TEXT_NODE:
      // The parent node may not be a element which has a tagName attribute.
      // So just let it be undefined which is ok in this use case.
      const parentTagName =
        node.parentNode && (node.parentNode as Element).tagName;
      let textContent = (node as Text).textContent;
      const isStyle = parentTagName === 'STYLE' ? true : undefined;
      if (isStyle && textContent) {
        textContent = getAbsoluteStylesheet(textContent, window.location.href);
      }
      if (parentTagName === 'SCRIPT') {
        textContent = 'SCRIPT_PLACEHOLDER';
      }
      return {
        type: NodeType.Text,
        textContent: textContent || '',
        isStyle
      };

    case node.CDATA_SECTION_NODE:
      return {
        type: NodeType.CDATA,
        textContent: ''
      };
    
    case node.COMMENT_NODE:
      return {
        type: NodeType.Comment,
        textContent: (node as Comment).textContent || ''
      };

    default:
      return false;
  }
}

export function serializeNodeWithId(
  node: Node | INode,
  document: Document,
  map: idNodeMap,
  blockClass: string | RegExp,
  skipChild = false,
  inlineStylesheet = true,
  maskAllInputs = false
): serializedNodeWithId | null {
  const serializedNode = serializeNode(
    node,
    document,
    blockClass,
    inlineStylesheet,
    maskAllInputs
  );

  if (!serializedNode) {
    return null;
  }

  let id;
  if ('__sn' in node) {
    id = node.__sn.id;
  } else {
    id = getId();
  }

  const serializedNodeWithId = Object.assign(serializedNode, { id });
  (node as INode).__sn = serializedNodeWithId;
  map[id] = node as INode;

  let recordChild = !skipChild;
  if (serializedNodeWithId.type === NodeType.Element) {
    recordChild = !skipChild && !serializedNodeWithId.needBlock;
    delete serializedNodeWithId.needBlock;
  }

  if (
    (serializedNodeWithId.type === NodeType.Document ||
    serializedNodeWithId.type === NodeType.Element) &&
    recordChild
  ) {
    for (const childNode of Array.from(node.childNodes)) {
      const serializedChildNode = serializeNodeWithId(
        childNode,
        document,
        map,
        blockClass,
        skipChild,
        inlineStylesheet,
        maskAllInputs
      );

      if (serializedChildNode) {
        serializedNodeWithId.childNodes.push(serializedChildNode);
      }
    }
  }

  return serializedNodeWithId;
}
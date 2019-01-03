/**
 * Determines whether the passed element is a DOM element
 * see: https://developer.mozilla.org/en-US/docs/Web/API/Element
 */
export const isElement = (element: Element): boolean => {
  let isElem;

  if (typeof Element === 'function') {
    isElem = element instanceof Element;
  } else {
    isElem = !!element && typeof element === 'object' &&
      element.nodeType === 1 && typeof element.nodeName === 'string';
  }

  return isElem;
};
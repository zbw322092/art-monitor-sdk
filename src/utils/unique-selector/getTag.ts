/**
 * Return the tag name of the element
 * @param {Element} element
 */
export const getTag = (element: Element): string => {
  // Element.tagName
  return element.tagName.toLowerCase().replace(/:/g, '\\:');
};
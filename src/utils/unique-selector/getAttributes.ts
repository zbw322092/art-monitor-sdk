/**
 * Returns the Attribute selectors of the element
 * @param element
 * @param attributesToIgnore
 */
export const getAttributes = (
  element: Element,
  attributesToIgnore: string[] = ['id', 'class', 'length']
): string | null => {
  const { attributes } = element;

  if (attributes === null) { return null; }
  const acc: string[] = [];
  Array.prototype.forEach.call(attributes, (attr: Node) => {
    if (!(attributesToIgnore.indexOf(attr.nodeName) > -1)) {
      acc.push(`[${attr.nodeName}="${attr.nodeValue}"]`);
    }
  });
  return acc.join('');
};
/**
 * Checks if the selector is unique
 * @param element
 * @param selector
 */
export const isUnique = (element: Element, selector: string) => {
  if (!selector) { return false; }
  const doc = element.ownerDocument;
  if (doc === null) { return false; }
  const elems = doc.querySelectorAll(selector);
  return elems.length === 1 && elems[0] === element;
};
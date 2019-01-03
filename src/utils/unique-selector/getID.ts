/**
 * Return the id attribute of the element
 * @param {Element} element
 */
export const getID = (element: Element): string | null => {
  // Element.getAttribute()
  const id = element.getAttribute('id');

  if (id !== null && id !== '') {
    // if the ID starts with a number selecting with a hash will cause a DOMException
    return id.match(/^\d/) ? `[id="${id}"]` : '#' + id;
  }

  return null;
};
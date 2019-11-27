import { SelectionDirection } from "src/enums/SelectionDirection";

export function detectSelectionDirection (selection: Selection): number {
  // console.log('selection: ', selection);
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  if (anchorNode === null || focusNode === null) { return SelectionDirection.null; }
  const position = anchorNode.compareDocumentPosition(focusNode);
  // positon 0 if nodes are the same
  if (
    (position === 0 && anchorOffset > focusOffset) ||
    position === Node.DOCUMENT_POSITION_PRECEDING ||
    (position === (Node.DOCUMENT_POSITION_PRECEDING + Node.DOCUMENT_POSITION_CONTAINS))
  ) {
    return SelectionDirection.backward;
  } else if (selection.isCollapsed) {
    return SelectionDirection.collapsed
  } else {
    return SelectionDirection.forward
  }
}
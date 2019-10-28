import { serializedNodeWithId, idNodeMap } from './types';
import { serializeNodeWithId } from './serializeNodeWithId';

function snapshot(
  node: Document,
  blockClass: string | RegExp = 'art-block',
  inlineStylesheet = true,
  maskAllInputs = false,
): [serializedNodeWithId | null, idNodeMap] {
  const idNodeMap: idNodeMap = {};

  return [
    serializeNodeWithId(
      node,
      node,
      idNodeMap,
      blockClass,
      false,
      inlineStylesheet,
      maskAllInputs
    ),
    idNodeMap
  ];
}

export default snapshot;
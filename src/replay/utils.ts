import { idNodeMap, INode } from "../snapshot/types";

export type Mirror = {
  map: idNodeMap;
  getId: (n: INode) => number;
  getNode: (id: number) => INode | null;
  removeNodeFromMap: (n: INode) => void;
  has: (id: number) => boolean;
};

export const nodeMirror: Mirror = {
  map: {},
  getId(node: INode) {
    // if node has not been serialized, return -1
    if (!node.__sn) {
      return -1;
    }
    return node.__sn.id;
  },
  getNode(id: number) {
    return nodeMirror.map[id] || null;
  },
  removeNodeFromMap(node: INode) {
    const id = node.__sn && node.__sn.id;
    delete nodeMirror.map[id];
    if (node.childNodes) {
      node.childNodes.forEach((child) => {
        nodeMirror.removeNodeFromMap((child as Node)as INode);
      });
    }
  },
  has(id: number) {
    return nodeMirror.map.hasOwnProperty(id);
  }
}
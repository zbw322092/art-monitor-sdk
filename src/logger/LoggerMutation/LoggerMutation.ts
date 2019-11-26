import LoggerBase from '../LoggerBase';
import { serializedNodeWithId } from '../../snapshot/types';

// const isNodeNotElement = (node: Node | Element) => {
//   return node instanceof Node && !(node instanceof Element);
// };

// const getNodeInfo = (node: Node) => {
//   if (isNodeNotElement(node)) {
//     if (node.parentElement) {
//       return unique(node.parentElement) + ', nodeValue: ' + node.nodeValue;
//     } else { return ''; }
//   }

//   return unique(node as Element);
// };

// const handleNode = (node: NodeList | Node) => {
//   console.log('nodenode: ', node);
//   if (node instanceof Node) {
//     return getNodeInfo(node);
//   }
//   return JSON.stringify(
//     Array.prototype.map.call(node, (n: Node | Element) => {
//       return getNodeInfo(n);
//     })
//   );
// };

// export class LoggerMutation extends LoggerBase {
//   constructor(TrackType: number, mutationRecord: MutationRecord) {
//     super(TrackType);

//     this.type = mutationRecord.type;
//     this.target = handleNode(mutationRecord.target);
//     this.addedNode = handleNode(mutationRecord.addedNodes);
//     this.removedNodes = handleNode(mutationRecord.removedNodes);
//     this.attributeName = mutationRecord.attributeName;
//     this.attributeNamespace = mutationRecord.attributeNamespace;
//     this.previousSibling = mutationRecord.previousSibling ? handleNode(mutationRecord.previousSibling) : null;
//     this.nextSibling = mutationRecord.nextSibling ? handleNode(mutationRecord.nextSibling) : null;
//     this.oldValue = mutationRecord.oldValue;
//   }

//   public type: string;
//   public target: string;
//   public addedNode: string;
//   public removedNodes: string;
//   public attributeName: string | null;
//   public attributeNamespace: string | null;
//   public previousSibling: string | null;
//   public nextSibling: string | null;
//   public oldValue: string | null;
// }

export enum MutationType {
  'attributes' = 'attributes',
  'characterData' = 'characterData',
  'childList' = 'childList'
};

export interface MutationData {
  type: string;
  target: number | serializedNodeWithId | null;
  attributeName: string | null;
  oldValue: string | null;
  newValue: string | null;
  addedNodes: Array<number | serializedNodeWithId | null>;
  removedNodes: Array<number | serializedNodeWithId | null>;
  previousSibling: number | null;
  nextSibling: number | null;
}

export class LoggerMutation extends LoggerBase {
  constructor(TrackType: number, mutationData: MutationData) {
    super(TrackType);

    this.mutationType = mutationData.type;
    this.target = mutationData.target;
    this.addedNodes = mutationData.addedNodes;
    this.removedNodes = mutationData.removedNodes;
    this.attributeName = mutationData.attributeName;
    // this.attributeNamespace = mutationData;
    this.previousSibling = mutationData.previousSibling;
    this.nextSibling = mutationData.nextSibling;
    this.oldValue = mutationData.oldValue;
    this.newValue = mutationData.newValue;
  }

  public mutationType: string;
  public target: number | serializedNodeWithId | null;
  public addedNodes: Array<number | serializedNodeWithId | null>;
  public removedNodes: Array<number | serializedNodeWithId | null>;
  public attributeName: string | null;
  // public attributeNamespace: string | null;
  public previousSibling: number | null;
  public nextSibling: number | null;
  public oldValue: string | null;
  public newValue: string | null;
}
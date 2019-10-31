import LoggerBase from './LoggerBase';
import unique from '../utils/unique-selector/index';

const isNodeNotElement = (node: Node | Element) => {
  return node instanceof Node && !(node instanceof Element);
};

const getNodeInfo = (node: Node) => {
  if (isNodeNotElement(node)) {
    if (node.parentElement) {
      return unique(node.parentElement) + ', nodeValue: ' + node.nodeValue;
    } else { return ''; }
  }

  return unique(node as Element);
};

const handleNode = (node: NodeList | Node) => {
  if (node instanceof Node) {
    return getNodeInfo(node);
  }
  return JSON.stringify(
    Array.prototype.map.call(node, (n: Node | Element) => {
      return getNodeInfo(n);
    })
  );
};

export class LoggerMutation extends LoggerBase {
  constructor(TrackType: number, mutationRecord: MutationRecord) {
    super(TrackType);

    this.type = mutationRecord.type;
    this.target = handleNode(mutationRecord.target);
    this.addedNode = handleNode(mutationRecord.addedNodes);
    this.removedNodes = handleNode(mutationRecord.removedNodes);
    this.attributeName = mutationRecord.attributeName;
    this.attributeNamespace = mutationRecord.attributeNamespace;
    this.previousSibling = mutationRecord.previousSibling ? handleNode(mutationRecord.previousSibling) : null;
    this.nextSibling = mutationRecord.nextSibling ? handleNode(mutationRecord.nextSibling) : null;
    this.oldValue = mutationRecord.oldValue;
  }

  public type: string;
  public target: string;
  public addedNode: string;
  public removedNodes: string;
  public attributeName: string | null;
  public attributeNamespace: string | null;
  public previousSibling: string | null;
  public nextSibling: string | null;
  public oldValue: string | null;
}
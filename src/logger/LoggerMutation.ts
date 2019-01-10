import LoggerBase from './LoggerBase';

export class LoggerMutation extends LoggerBase {
  constructor(
    type: string, target: string, addedNode: string, removedNodes: string, attributeName: string | null,
    attributeNamespace: string | null, previousSibling: string | null, nextSibling: string | null, oldValue: string | null
  ) {
    super();
    this.type = type;
    this.target = target;
    this.addedNode = addedNode;
    this.removedNodes = removedNodes;
    this.attributeName = attributeName;
    this.attributeNamespace = attributeNamespace;
    this.previousSibling = previousSibling;
    this.nextSibling = nextSibling;
    this.oldValue = oldValue;
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
import unique from '../utils/unique-selector';

const targetNode = document.querySelector('body');

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
  return Array.prototype.map.call(node, (n: Node | Element) => {
    return getNodeInfo(n);
  });
};

const consoleMutation = (mutationRecord: MutationRecord) => {
  // console.log(mutationRecord);
  const target = handleNode(mutationRecord.target);
  const addedNodes = handleNode(mutationRecord.addedNodes);
  const removedNodes = handleNode(mutationRecord.removedNodes);

  const nextSibling = mutationRecord.nextSibling ? handleNode(mutationRecord.nextSibling) : null;
  const previousSibling = mutationRecord.previousSibling ? handleNode(mutationRecord.previousSibling) : null;
  console.log(
    'timestamp: ' + performance.now() + ', ' +
    'type: ' + mutationRecord.type + ', ' +
    'target: ' + target + ', ' +
    'addedNode: ' + JSON.stringify(addedNodes) + ', ' +
    'removedNodes: ' + JSON.stringify(removedNodes) + ', ' +
    'attributeName: ' + mutationRecord.attributeName + ', ' +
    'attributeNamespace: ' + mutationRecord.attributeNamespace + ', ' +
    'previousSibling: ' + previousSibling + ', ' +
    'nextSibling: ' + nextSibling + ', ' +
    'oldValue: ' + mutationRecord.oldValue + ', '
  );
};

const callback: MutationCallback = (mutations: MutationRecord[]) => {
  mutations.forEach((mutation) => {
    consoleMutation(mutation);
  });
};
const config: MutationObserverInit = {
  attributes: true,
  attributeOldValue: true,
  childList: true,
  characterData: true,
  characterDataOldValue: true,
  subtree: true
};

const mutationObserver = new MutationObserver(callback);

if (targetNode) {
  targetNode.addEventListener('click', (event) => {
    console.log(event);
  });
  window.addEventListener('scroll', (event) => {
    console.log(event);
  });
  mutationObserver.observe(targetNode, config);
}
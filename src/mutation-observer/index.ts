import { LoggerMutation, MutationType, MutationData } from '../logger/LoggerMutation/LoggerMutation';
import { TrackType } from '../enums/TrackType';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';
import { INode } from '../snapshot/types';
import { isBlocked } from '../recorder/utils';
import { serializeNodeWithId } from '../snapshot/serializeNodeWithId';
import { nodeMirror } from 'src/state/nodeMirror';

function isSerializedNode(node: Node | INode) {
  return '__sn' in node;
}

export function initMutationObserver(
  blockClass: string | RegExp = 'art-block',
  inlineStylesheet: boolean = true,
  maskAllInputs: boolean = false
) {
  const targetNode = document.querySelector('body');

  let styleAttrMutationTimeout: number | null;
  const storeMutation = (mutationData: MutationData) => {
    const mutaionLog = new LoggerMutation(TrackType.MUTATION, mutationData);

    iDBStoreInstance.set(OBJECTNAME, mutaionLog)
      .then(() => {
        console.log('mutaion log added');
      })
      .catch((err) => {
        console.log('mutaion log err: ', err);
      });

    if (mutationData.type === 'attributes' && mutationData.attributeName === 'style') {
      styleAttrMutationTimeout = window.setTimeout(() => {
        window.clearTimeout(styleAttrMutationTimeout as number);
        styleAttrMutationTimeout = null;
      }, 200);
    }
  };

  const callback: MutationCallback = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      // if (mutation.type === 'attributes' &&
      //   mutation.attributeName === 'style' &&
      //   styleAttrMutationTimeout
      // ) { return; }
      // storeMutation(mutation);
      console.log('mutation: ', mutation);
      const { type, target, attributeName, oldValue,
        addedNodes, removedNodes, previousSibling, nextSibling } = mutation;
      let mutationData: MutationData;
      switch (type) {
        case MutationType.attributes:
          const attribute = (target as Element).getAttribute(attributeName!);
          if (isBlocked(target, blockClass) || attribute === oldValue) {
            console.log('attribute not changed');
            return;
          }
          mutationData = {
            type: MutationType.attributes,
            target: nodeMirror.getId(target as INode),
            attributeName,
            oldValue,
            newValue: attribute,
            addedNodes: [],
            removedNodes: [],
            previousSibling: null,
            nextSibling: null
          };
          console.log('mutationData attributes: ', mutationData);
          break;
        case MutationType.characterData:
          const characterValue = target.textContent;
          if (isBlocked(target, blockClass) || characterValue === oldValue) {
            console.log('character not changed');
            return;
          }
          mutationData = {
            type: MutationType.characterData,
            target: nodeMirror.getId(target as INode),
            attributeName: null,
            oldValue,
            newValue: characterValue,
            addedNodes: [],
            removedNodes: [],
            previousSibling: null,
            nextSibling: null
          };
          console.log('mutationData characterData: ', mutationData);
          break;
        case MutationType.childList:
          let targetNode;
          if (!isSerializedNode(target)) {
            targetNode = serializeNodeWithId(target, document, nodeMirror.map, blockClass, true, inlineStylesheet, maskAllInputs);
          }
          const serializedAddedNodes = Array.from(addedNodes).map((node) => {
            return serializeNodeWithId(node, document, nodeMirror.map, blockClass, false, inlineStylesheet, maskAllInputs);
          });
          const serializedRemovedNodes = Array.from(removedNodes).map((node) => {
            nodeMirror.removeNodeFromMap(node as INode);
            return nodeMirror.getId(node as INode);
          });
          
          mutationData = {
            type: MutationType.childList,
            target: targetNode || nodeMirror.getId(target as INode),
            attributeName: null,
            oldValue: null,
            newValue: null,
            addedNodes: serializedAddedNodes,
            removedNodes: serializedRemovedNodes,
            previousSibling: previousSibling === null ? previousSibling : nodeMirror.getId(previousSibling as INode),
            nextSibling: nextSibling === null ? nextSibling: nodeMirror.getId(nextSibling as INode)
          }
          console.log('mutationData childList: ', mutationData);
          break;
        default:
          break;
      }

      if (styleAttrMutationTimeout) { return; }
      // @ts-ignore
      storeMutation(mutationData);
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
    mutationObserver.observe(targetNode, config);
  }
}
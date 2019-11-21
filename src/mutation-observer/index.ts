import { LoggerMutation } from '../logger/LoggerMutation/LoggerMutation';
import { TrackType } from '../enums/TrackType';
import { iDBStoreInstance } from '../data-store/IDBStore';
import { OBJECTNAME } from '../constants/DB';
import { INode } from '../snapshot/types';
import { isBlocked } from '../recorder/utils';

export function initMutationObserver(blockClass: string | RegExp = 'art-block') {
  const targetNode = document.querySelector('body');

  let styleAttrMutationTimeout: number | null;
  const storeMutation = (mutationRecord: MutationRecord) => {
    const mutaionLog = new LoggerMutation(TrackType.MUTATION, mutationRecord);
    console.log('mutaion log', mutaionLog);

    iDBStoreInstance.set(OBJECTNAME, mutaionLog)
      .then(() => {
        console.log('mutaion log added');
      })
      .catch((err) => {
        console.log('mutaion log err: ', err);
      });

    if (mutationRecord.type === 'attributes' && mutationRecord.attributeName === 'style') {
      styleAttrMutationTimeout = window.setTimeout(() => {
        window.clearTimeout(styleAttrMutationTimeout as number);
        styleAttrMutationTimeout = null;
      }, 1000);
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
      const { type, target, attributeName, oldValue } = mutation;
      switch (type) {
        case 'attributes':
          const attribute = (target as Element).getAttribute(attributeName!);
          if (!isBlocked(target, blockClass) && attribute !== oldValue) {
            
          }
          break;
        case 'characterData':
          break;
        case 'childList':
          break;
        default:
          break;
      }
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
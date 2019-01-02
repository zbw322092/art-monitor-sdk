const targetNode = document.querySelector('body');

const callback: MutationCallback = (mutations) => {
  console.log('mutations: ', mutations);
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
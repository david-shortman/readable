const replaceOnActiveTab = (replacements, keys, { target = document.body } = {}) => {
  [
    target,
    ...target.querySelectorAll("*:not(script):not(noscript):not(style)")
  ].forEach(({ childNodes: [...nodes] }) => nodes
    .filter(({ nodeType, rdblHasReplaced }) => nodeType === document.TEXT_NODE && !rdblHasReplaced)
    .forEach((textNode) => {
      const oldContent = textNode.textContent.slice();
      let newContent = '';
      [...oldContent].forEach((oldCharacter, i) => {
        const replacement = replacements[oldCharacter];
        if (replacement) {
          newContent += replacement;
        } else {
          newContent += oldCharacter;
        }
      });
      textNode.textContent = newContent;
      textNode['rdblHasReplaced'] = true;
    }));
};

let characterMap;

const browser = window['browser'] || chrome;

function onDOMChanged() {
  browser.runtime.sendMessage("DOM_CHANGED");
}

function makeDocumentReadable() {
  if (characterMap) {
    replaceOnActiveTab(characterMap, Object.keys(characterMap));
  } else {
    fetch('https://raw.githubusercontent.com/david-shortman/readable/main/alphabets/character-map.json').then(data => data.json()).then(res => {
      characterMap = res;
      replaceOnActiveTab(characterMap, Object.keys(characterMap));
    });
  }
}

browser.runtime.onMessage.addListener(function (message) {
  if (message === 'DOM_CHANGED_ON_ACTIVE_TAB') {
    makeDocumentReadable();
  }
});

const observer = new MutationObserver(onDOMChanged);

observer.observe(document.body, {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true
});
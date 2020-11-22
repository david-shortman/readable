const replaceCharactersOnDocument = (replacements, { target = document.body } = {}) => {
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

function onDOMChanged(mutations) {
  if (mutations.filter(mut => mut.type !== 'attributes').length) {
    browser.runtime.sendMessage("DOM_CHANGED");
  }
}

function makeDocumentReadable() {
  if (characterMap) {
    replaceCharactersOnDocument(characterMap);
  } else {
    fetch('https://raw.githubusercontent.com/david-shortman/readable/main/alphabets/character-map.json')
      .then(response => response.json())
      .then(map => {
        characterMap = map;
        replaceCharactersOnDocument(characterMap);
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
/** Replaces non-standard characters with appropriate replacement. */
function makeTextNodesOnDocumentReadable(replacements, { target = document.body } = {}) {
  [
    target,
    ...target.querySelectorAll("*:not(script):not(noscript):not(style)")
  ].forEach(({ childNodes: [...nodes] }) => nodes
    // Ignore non-text nodes, and ignore text nodes that have been marked as already being replaced by the Readable extension
    .filter(({ nodeType, rdblExtHasReplaced }) => nodeType === document.TEXT_NODE && !rdblExtHasReplaced)
    .forEach((textNode) => {
      const oldContent = textNode.textContent.slice();
      let newContent = '';
      // Spread operator correctly puts unicode characters into individual entries in array
      [...oldContent].forEach(oldCharacter => {
        const replacement = replacements[oldCharacter];
        if (replacement) {
          newContent += replacement;
        } else {
          newContent += oldCharacter;
        }
      });
      textNode.textContent = newContent;
      // Mark node as replaced
      textNode['rdblExtHasReplaced'] = true;
    }));
}

// Prefer the more standard `browser` before Chrome API
const browser = window['browser'] || chrome;

let isComposing = false;

function onDOMChanged(mutations) {
  /* Non-text 'attribute' changes should be ignored
   * Although 'characterData' could include text updates that should be converted,
   * it's much more likely that user input will trigger this.
   * Changing text content during user input can reset their cursor position.
  */
  if (!isComposing && mutations.filter(mut => !['attributes', 'characterData'].includes(mut.type)).length) {
    // Must notify background service that DOM_CHANGED so that it can notify this tab
    // if the change was made while it was the active tab
    browser.runtime.sendMessage("DOM_CHANGED");
  }
}

let characterMap;

function makeDocumentReadable() {
  if (characterMap) {
    makeTextNodesOnDocumentReadable(characterMap);
  } else {
    browser.runtime.sendMessage("NEED_CHARACTER_MAP");
  }
}

browser.runtime.onMessage.addListener(function (message) {
  if (message.type === "CHARACTER_MAP_READY") {
    characterMap = message.characterMap;
    makeDocumentReadable();
  }
});

browser.runtime.onMessage.addListener(function (message) {
  if (message === 'DOM_CHANGED_ON_ACTIVE_TAB') {
    makeDocumentReadable();
  }
});

// Watch the entire body for changes
const observer = new MutationObserver(onDOMChanged);
observer.observe(document.body, {
  childList: true,
  attributes: true,
  subtree: true,
  characterData: true
});

let afterDoneTyping;
document.addEventListener("keydown", event => {
  const key = event.key.trim();
  if (key.length === 1) { // user pressed a printable character (i.e., a key with the likely intent to input text)
    isComposing = true;
    if (!!afterDoneTyping) {
      clearTimeout(afterDoneTyping);
    }
    afterDoneTyping = setTimeout(function() {
      isComposing = false;
    }, 10000); // extra long timeout because the input cursor resetting is annoying
  }
});
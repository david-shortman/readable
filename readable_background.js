const isChrome = !window['browser'] && !!chrome;
// Prefer the more standard `browser` before Chrome API
const browser = isChrome ? chrome : window['browser'];

function onGotCurrentTab(currentTabOrTabs) {
    let currentTabId;
    if (Array.isArray(currentTabOrTabs)) {
        currentTabId = currentTabOrTabs[0].id;
    } else {
        currentTabId = currentTabOrTabs.id;
    }
    if (currentTabId >= 0) {
        browser.tabs.sendMessage(currentTabId, "DOM_CHANGED_ON_ACTIVE_TAB");
    }
}

browser.runtime.onMessage.addListener(function (message) {
    if (message === 'DOM_CHANGED') {
        if (isChrome) {
            browser.tabs.getSelected(onGotCurrentTab);
        } else {
            browser.tabs.query({ active: true }).then(onGotCurrentTab)
        }
    }
  });
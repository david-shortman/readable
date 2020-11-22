const isChrome = !window['browser'] && !!chrome;
const browser = isChrome ? chrome : window['browser'];

function onGotCurrentTab(currentTabOrTabs) {
    let currentTabId;
    if (Array.isArray(currentTabOrTabs)) {
        currentTabId = currentTabOrTabs[0].id;
    } else {
        currentTabId = currentTabOrTabs.id;
    }
    if (currentTabId >= 0) {
        browser.tabs.sendMessage(currentTabId, "updateCurrentTab");
    }
}

setInterval(function () {
    if (isChrome) {
        browser.tabs.getSelected(onGotCurrentTab);
    } else {
        browser.tabs.query({ active: true }).then(onGotCurrentTab)
    }
}, 5000);

/* global chrome */

const windows = {};

chrome.tabs.query({ active: true }, (tabs) => {
  tabs.forEach((tab) => {
    windows[tab.windowId] = [tab.id];
  });
});

function removeTab(tabID, winID) {
  var list = windows[winID];
  var i = list.indexOf(tabID);
  if (i > -1) { list.splice(i, 1); }
}

var updating = false;
function focusLastTab(tabID, winID) {
  var list = windows[winID];
  if (list.length > 1 && list[list.length - 1] === tabID) {
    updating = true;
    chrome.tabs.update(list[list.length - 2], { active: true }, () => {
      updating = false;
    });
  }
  removeTab(tabID, winID);
}

chrome.tabs.onActivated.addListener((info) => {
  if (!windows[info.windowId]) {
    windows[info.windowId] = [info.tabId];
  } else if (!updating) {
    removeTab(info.tabId, info.windowId);
    windows[info.windowId].push(info.tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabID, info) => {
  if (info.isWindowClosing) {
    delete windows[info.windowId];
    return;
  }
  focusLastTab(tabID, info.windowId);
});

chrome.tabs.onDetached.addListener((tabID, info) => {
  focusLastTab(tabID, info.oldWindowId);
});

chrome.tabs.onAttached.addListener((tabID, info) => {
  if (!windows[info.newWindowId]) {
    windows[info.newWindowId] = [tabID];
  } else {
    windows[info.newWindowId].push(tabID);
  }
});

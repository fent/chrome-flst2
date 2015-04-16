/* global chrome */

var windows = {};

chrome.tabs.query({ active: true }, function(tabs) {
  tabs.forEach(function(tab) {
    windows[tab.windowId] = [tab.id];
  });
});

function removeTab(tabID, winID) {
  var list = windows[winID];
  var i = list.indexOf(tabID);
  if (i > -1) { list.splice(i, 1); }
}

var updating = false;
function focusLastTab(list) {
  updating = true;
  chrome.tabs.update(list[list.length - 2], { active: true }, function() {
    updating = false;
  });
}

chrome.tabs.onActivated.addListener(function(info) {
  if (!windows[info.windowId]) {
    windows[info.windowId] = [info.tabId];
  } else if (!updating) {
    removeTab(info.tabId, info.windowId);
    windows[info.windowId].push(info.tabId);
  }
});

chrome.tabs.onRemoved.addListener(function(tabID, info) {
  if (info.isWindowClosing) {
    delete windows[info.windowId];
    return;
  }
  var list = windows[info.windowId];
  if (list[list.length - 1] === tabID) {
    focusLastTab(list);
  }
  removeTab(tabID, info.windowId);
});

chrome.tabs.onDetached.addListener(function(tabID, info) {
  var list = windows[info.oldWindowId];
  if (list.length) {
    focusLastTab(list);
  }
  removeTab(tabID, info.oldWindowId);
});

chrome.tabs.onAttached.addListener(function(tabID, info) {
  if (!windows[info.newWindowId]) {
    windows[info.newWindowId] = [tabID];
  } else {
    windows[info.newWindowId].push(tabID);
  }
});

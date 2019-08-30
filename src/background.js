import store from './store';

// adjust time speed
const oneMinute = 60 * 1000;

// update message
chrome.runtime.onInstalled.addListener(() => {
  chrome.notifications.create('noti_id_update', {
    type: 'basic',
    iconUrl: 'assets/tomato.png',
    title: 'Tomato-pie updated',
    message: 'click to see update details',
    requireInteraction: true, // do not close until click
  });
});

// open new tab when click icon; ref: https://stackoverflow.com/a/14682627/4674834
chrome.browserAction.onClicked.addListener(() => {
  window.focus();
  chrome.tabs.create({ url: chrome.extension.getURL('index.html#from_action') });
});

// open new tab when click notification
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === 'noti_id_update') {
    window.focus();
    chrome.tabs.create({ url: chrome.extension.getURL('https://github.com/t9tio/tomato-pie/tree/master/blog#updates') });
    chrome.notifications.clear(notificationId);
  } else {
    window.focus();
    chrome.tabs.create({ url: chrome.extension.getURL('index.html#from_action') });
    chrome.notifications.clear(notificationId);
  }
});

let current = 25;
let rest = 5;
let currentTimeout;
let restTimeout;

async function updateRest() {
  if (rest === 0) {
    chrome.browserAction.setBadgeText({ text: '' });
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/tomato.png',
      title: 'Rest done',
      message: (new Date()).toLocaleTimeString(),
      requireInteraction: true, // do not close until click
      buttons: [{
        title: 'Start another tomato for current todo directly',
      }, {
        title: 'Abandon this tomato',
      }],
    });
    await store.CurrentStartAt.remove();
  } else {
    chrome.browserAction.setBadgeText({ text: `${rest.toString()}m` });
    chrome.browserAction.setBadgeBackgroundColor({ color: 'green' });
    rest -= 1;
    restTimeout = setTimeout(updateRest, oneMinute);
  }
}

async function updateCurrent() {
  if (current === 0) {
    rest = 5;
    updateRest();
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/tomato.png',
      title: 'Tomato got, take a break~',
      message: (new Date()).toLocaleTimeString(),
      requireInteraction: true, // do not close until click
      // eventTime: Date.now() + 1000 * 10,
    });
  } else {
    chrome.browserAction.setBadgeText({ text: `${current.toString()}m` });
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
    current -= 1;
    currentTimeout = setTimeout(updateCurrent, oneMinute);
  }
}

function startTimer() {
  current = 25;
  rest = 5;

  // when calling startTimer multiple times, previous timeout should be cleared
  clearTimeout(currentTimeout);
  clearTimeout(restTimeout);
  updateCurrent();
}

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  const today = new Date();
  const tomatoes = await store.Tomato.getAll();
  const lastTomato = tomatoes[tomatoes.length - 1];

  // start another tomato for current todo directly
  if (buttonIndex === 0) {
    const startTime = today.getTime();
    const newTomato = {
      startAt: startTime,
      todoId: lastTomato.todoId,
    };
    await store.Tomato.push(newTomato);
    await store.CurrentStartAt.put(startTime);
    chrome.browserAction.setBadgeText({ text: '25m' });
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
    startTimer();

  // abandon current tomato
  } else if (buttonIndex === 1) {
    await store.Tomato.pop();
  }
});


// export function from background page
// (load in other place by `chrome.extension.getBackgroundPage();`)
window.startTimer = startTimer;

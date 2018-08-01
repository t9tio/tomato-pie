import store from './store';

// open new tab when click ico
// ref: https://stackoverflow.com/questions/3188384/google-chrome-extensions-open-new-tab-when-clicking-a-toolbar-icon
chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({});
});

let current = 25;
let rest = 5;
let currentTimeout = undefined;
let restTimeout = undefined;

function updateCurrent () {
    if (current === 0) {
        rest = 5;
        updateRest();
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/tomato.png',
            title: 'Tomato got, take a break~',
            message: (new Date()).toLocaleTimeString(),
            // requireInteraction: true,  // do not close until click
            eventTime: Date.now() + 1000 * 10,
        });
    } else {
        console.log('updateCurrent')
        chrome.browserAction.setBadgeText({ text: current.toString() + "m" });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'red'});
        current = current - 1;
        currentTimeout = setTimeout(() => updateCurrent(), 1000 * 60);
    }
}

async function updateRest () {
    if (rest === 0) {
        chrome.browserAction.setBadgeText({ text: '' });
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'assets/tomato.png',
            title: 'Rest done',
            message: (new Date()).toLocaleTimeString(),
            requireInteraction: true,  // do not close until click
            buttons: [{
                title: 'Start another tomato directly',
            }],
        });

        // TODO: add tomato to history
        // startTime, date, description
        // store.addTomato({
        //     startTimme: 21,
        //     date: '2018-07-27',
        //     tag: 'tomato pie',
        //     description: 'css'
        // });
        const startAt = await store.CurrentStartAt.get();
        await store.Tomato.add({
            startAt,
        });

        await store.CurrentStartAt.put(null);
        // TODO: Improvement: If there's already an empty, switch to it instead of creating a new one. 
        // chrome.tabs.create({});
    } else {
        console.log('updateRest');
        chrome.browserAction.setBadgeText({ text: rest.toString() + "m" });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'green'});
        rest = rest - 1;
        restTimeout = setTimeout(() => updateRest(), 1000 * 60);
    }
}

// export function from background page (load in other place by `chrome.extension.getBackgroundPage();`)
window.startTimmer = function () {
    current = 25;
    rest = 5;

    // when calling startTimmer multiple times, previous timeout should be cleard
    clearTimeout(currentTimeout);
    clearTimeout(restTimeout)
    updateCurrent();
}

// When user want to start another tomato directly
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    console.log(notificationId, buttonIndex);
});
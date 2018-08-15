import store from './store';

// open new tab when click ico
// ref: https://stackoverflow.com/questions/3188384/google-chrome-extensions-open-new-tab-when-clicking-a-toolbar-icon
chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({});
});

// open new tab when click notification
chrome.notifications.onClicked.addListener(() => {
    chrome.tabs.create({});
});

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
    const today = new Date();
    const tomatoes = await store.Tomato.getByDate(today);
    const lastTomato = tomatoes[tomatoes.length - 1];

    // start another tomato for current todo directly
    if (buttonIndex === 0) {
        const startTime = today.getTime();
        const newTomato = {
            startAt: startTime,
            todoId: lastTomato.todoId,
        };
        tomatoes.push(newTomato);
        await store.CurrentStartAt.put(startTime);
        await store.Tomato.putByDate(today, tomatoes);
        chrome.browserAction.setBadgeText({ text: '25m' });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'red'});
        startTimmer();
    // abandon current tomato
    } else if (buttonIndex === 1) {
        lastTomato.abandonReason = '';
        await store.Tomato.putByDate(today, tomatoes);
    }
});

let current = 25;
let rest = 5;
let currentTimeout = undefined;
let restTimeout = undefined;

async function updateCurrent () {
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

        // const startAt = await store.CurrentStartAt.get();
        // await store.Tomato.add({
        //     startAt,
        // });

    } else {
        console.log('updateCurrent')
        chrome.browserAction.setBadgeText({ text: current.toString() + "m" });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'red'});
        current = current - 1;
        currentTimeout = setTimeout(async () => await updateCurrent(), 1000 * 60);
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
                title: 'Start another tomato for current todo directly',
            }, {
                title: 'Abandon this tomato'
            }],
        });


        await store.CurrentStartAt.put(null);
        // TODO: Improvement: If there's already an empty, switch to it instead of creating a new one. 
        // chrome.tabs.create({});
    } else {
        console.log('updateRest');
        chrome.browserAction.setBadgeText({ text: rest.toString() + "m" });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'green'});
        rest = rest - 1;
        restTimeout = setTimeout(async () => await updateRest(), 1000 * 60);
    }
}

function startTimmer() {
    current = 25;
    rest = 5;

    // when calling startTimmer multiple times, previous timeout should be cleard
    clearTimeout(currentTimeout);
    clearTimeout(restTimeout)
    updateCurrent();
}

// export function from background page (load in other place by `chrome.extension.getBackgroundPage();`)
window.startTimmer = startTimmer;
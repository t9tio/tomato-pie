import './index.scss';
import './generateClockAnimations';
import minuteAnimation from './minuteAnimation';
import store from './store';
import getFormatedDateStr from './util/getFormatedDateStr';
import showTomatoesOfLast12hours from './showTomatoesOfLast12hours';

// communicate with background page: https://stackoverflow.com/a/11967860/4674834
const backgroundPage = chrome.extension.getBackgroundPage();

console.log(backgroundPage);

(async () => {
    const currentStartAt = await store.CurrentStartAt.get();
    if (currentStartAt && new Date().getTime() - currentStartAt < 1000 * 60 * 30) {
        minuteAnimation.show(currentStartAt);
    } else {
        await store.CurrentStartAt.put(null);
        chrome.browserAction.setBadgeText({ text: '' });
    }

    const today = new Date();
    const yesterday = new Date().setDate(today.getDate() - 1);
    const todayStr = getFormatedDateStr(today);
    const yesterdayStr = getFormatedDateStr(yesterday);
    const tomatoesToday = await store.Tomato.getByDateStr(todayStr);
    const tomatoesYesterday = await store.Tomato.getByDateStr(yesterdayStr);
    
    const tomatoesMightNeedToShow = [];
    if (Array.isArray(tomatoesToday)) {
        tomatoesMightNeedToShow.push(...tomatoesToday);
    }

    if (Array.isArray(tomatoesYesterday)) {
        tomatoesMightNeedToShow.push(...tomatoesYesterday);
    }

    showTomatoesOfLast12hours(tomatoesMightNeedToShow);
})();

document.querySelector('#start-tomato').addEventListener('click', async () => {
    const startTime = new Date().getTime();

    chrome.browserAction.setBadgeText({ text: '25m' });
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red'});

    await store.CurrentStartAt.put(startTime);
    minuteAnimation.show(startTime);
    backgroundPage.startTimmer();
});

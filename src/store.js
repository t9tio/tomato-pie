import 'chrome-storage-promise';
import getFormatedDateStr from './util/getFormatedDateStr';

const CurrentStartAt = {
    get: async () => {
        const storage = await chrome.storage.promise.sync.get('currentStartAt');
        if (storage) {
            return storage.currentStartAt;
        }
        return null;
    },

    put: async (currentStartAt) => {
        await chrome.storage.promise.sync.set({ currentStartAt });
    },
};

const Tomato = {
    add: async ({ startAt, tag, description }) => {
        const dateStr = getFormatedDateStr(new Date(startAt));
        const tomatoToday = (await chrome.storage.promise.sync.get(dateStr))[dateStr];

        if (tomatoToday) {
            tomatoToday.push({
                startAt,
                tag,
                description,
            });

            const obj = {};
            obj[dateStr] = tomatoToday;
            await chrome.storage.promise.sync.set(obj);
        } else {
            const obj = {};
            obj[dateStr] = [{
                startAt,
                tag,
                description,
            }];
            await chrome.storage.promise.sync.set(obj);
        }
    },

    getByDateStr: async (dateStr) => {
        const tomatoes = (await chrome.storage.promise.sync.get(dateStr))[dateStr];
        return tomatoes;
    },
};

// TODO: about tags
export default {
    CurrentStartAt,
    Tomato,
}
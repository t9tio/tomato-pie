import 'chrome-storage-promise';
import getFormatedDateStr from './util/getFormatedDateStr';

/**
 * store data structure
 * {
 *     "tomatoes-2018-08-07": [{
 *         startAt: 1533653542468, // also used as id
 *         isAbandoned: false, // abandoned if not undefined
 *         todoId: "abc",
 *     }],
 *
 *
 *     "todoList-2018-08-07": [{
 *         createdAt: 1533653542468 // also used as id
 *         content: "master css position",
 *         isDone: fasle,
 *     }],
 *
 *     "emergencyList?"
 * }
 */

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
  getByDate: async (date) => {
    const dateStr = getFormatedDateStr(date);
    const tomatoesKey = `tomatoes-${dateStr}`;
    let tomatoes = (await chrome.storage.promise.sync.get(tomatoesKey))[tomatoesKey];

    // init tomatoes if no tomato fond
    if (!tomatoes) {
      tomatoes = [];
      const obj = {};
      obj[tomatoesKey] = tomatoes;
      await chrome.storage.promise.sync.set(obj);
    }

    return tomatoes;
  },

  putByDate: async (date, tomatoes) => {
    const dateStr = getFormatedDateStr(date);
    const tomatoesKey = `tomatoes-${dateStr}`;
    const obj = {};
    obj[tomatoesKey] = tomatoes;
    await chrome.storage.promise.sync.set(obj);
    return tomatoes;
  },
};

const TodoList = {
  getByDate: async (date) => {
    const dateStr = getFormatedDateStr(date);
    const todoListKey = `todoList-${dateStr}`;
    let todoList = (await chrome.storage.promise.sync.get(todoListKey))[todoListKey];

    // init todoList if no todo fond
    if (!todoList) {
      todoList = [];
      const obj = {};
      obj[todoListKey] = todoList;
      await chrome.storage.promise.sync.set(obj);
    }

    return todoList;
  },

  /**
     * @param date {Object} date obj
     * @param todoList {Array} [{id: '', content: ''}]
     */
  putByDate: async (date, todoList) => {
    const dateStr = getFormatedDateStr(date);
    const todoListKey = `todoList-${dateStr}`;
    const obj = {};
    obj[todoListKey] = todoList;
    await chrome.storage.promise.sync.set(obj);
    return todoList;
  },
};

// TODO: about tags
export default {
  CurrentStartAt,
  Tomato,
  TodoList,
};

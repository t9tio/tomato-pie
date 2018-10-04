import 'chrome-storage-promise';
import getFormatedDateStr from './util/getFormatedDateStr';

/**
 * store data structure
 * {
 *     CurrentStartAt: 132413241234,
 *
 *     IsOldUser: true,
 *
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
 *         isDone: fasle, // default undefined
 *         isIgnoredFromRecentList: false,
 *         isCopyed: false,
 *     }],
 *
 * }
 */

const IsOldUser = {
  get: async () => {
    const storage = await chrome.storage.promise.sync.get('isOldUser');
    if (storage) {
      return storage.isOldUser;
    }
    return false;
  },
  put: async (isOldUser) => {
    await chrome.storage.promise.sync.set({ isOldUser });
  },
};

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

class TodoList {
  async getByDate(date) {
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
  }

  /**
     * @param date {Object} date obj
     * @param todoList {Array} [{id: '', content: ''}]
     */
  async putByDate(date, todoList) {
    const dateStr = getFormatedDateStr(date);
    const todoListKey = `todoList-${dateStr}`;
    const obj = {};
    obj[todoListKey] = todoList;
    await chrome.storage.promise.sync.set(obj);
    return todoList;
  }

  /**
   * return last N day's todoLists
   * @param lastN {Number} number of days privious
   * @return {Array} last N days' todoList
   * @example
   * [
   *    {
   *     "todoList-2018-08-07": [{
   *         createdAt: 1533653542468 // also used as id
   *         content: "master css position",
   *         isDone: fasle,
   *     }],
   *    }
   * ]
   */
  async getByDateRange(today, lastN) {
    const dateArr = [];
    for (let i = 1; i <= lastN; i += 1) {
      // ref: https://stackoverflow.com/a/1296374/4674834
      const newDate = new Date(new Date().setDate(today.getDate() - i));
      dateArr.push(newDate);
    }

    const dateStrArr = dateArr.map(date => getFormatedDateStr(date));

    const todoLists = await Promise.all(dateStrArr.map(dateStr => chrome.storage.promise.sync.get(`todoList-${dateStr}`)));

    return todoLists;
  }

  /**
   * for updating one todo
   */
  async putTODO(createdAt, newTODO) {
    const todoDate = new Date(createdAt);
    const todoList = await this.getByDate(todoDate);
    const newTodoList = todoList.map((todo) => {
      if (todo.createdAt === createdAt) {
        return newTODO;
      }
      return todo;
    });
    await this.putByDate(todoDate, newTodoList);
    return newTodoList;
  }
}

// TODO: about tags
export default {
  IsOldUser,
  CurrentStartAt,
  Tomato,
  TodoList: new TodoList(),
};

// Init store, For like debuging driver
// IsOldUser.put(false);
// Tomato.putByDate(new Date(), []);
// TodoList.putByDate(new Date(), []);
// CurrentStartAt.put(null);

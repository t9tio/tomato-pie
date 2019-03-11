/**
 * store data structure
 *
 * currentStartAt: 132413241234,
 *
 * isShowStatics: boolean,
 *
 * isShowTextarea: boolean,
 *
 * textareData: string,
 *
 * tomatoList: [{
 *   startAt: 1533653542468, // also used as id
 *   todoId: 1533653542468,
 * }],
 *
 * todoList: [{
 *   createdAt: 1533653542468, // also used as id
 *   content: "master css position",
 * }]
 *
 * doneList: [{
 *   createdAt: 1533653542468, // also used as id
 *   doneAt: 1533653542468,
 *   content: "master css position",
 * }]
 */

const ShowStatics = {
  get: () => localStorage.getItem('isShowStatics'),
  set: (boolean) => {
    if (boolean) {
      localStorage.setItem('isShowStatics', true);
    } else {
      localStorage.removeItem('isShowStatics');
    }
  },
};

const ShowTextarea = {
  get: () => localStorage.getItem('isShowTextarea'),
  set: (boolean) => {
    if (boolean) {
      localStorage.setItem('isShowTextarea', true);
    } else {
      localStorage.removeItem('isShowTextarea');
    }
  },
};

const Textarea = {
  get: () => localStorage.getItem('textareaData'),
  set: content => localStorage.setItem('textareaData', content),
};

const CurrentStartAt = {
  get: () => Number(localStorage.getItem('currentStartAt')),
  put: currentStartAt => localStorage.setItem('currentStartAt', currentStartAt),
  remove: () => localStorage.removeItem('currentStartAt'),
};

const Tomato = {
  getAll: () => {
    const all = JSON.parse(localStorage.getItem('tomatoList'));
    if (!all) return [];
    return all;
  },
  // get tomatoes of last 12 hours
  get12h: () => {
    const all = JSON.parse(localStorage.getItem('tomatoList'));
    if (!all) return [];
    return all.filter(tomato => tomato.startAt > new Date().getTime() - 1000 * 60 * 60 * 12);
  },
  push: (tomato) => {
    const cur = JSON.parse(localStorage.getItem('tomatoList'));
    let next;
    if (!cur) {
      next = [tomato];
    } else {
      next = cur.concat(tomato);
    }
    localStorage.setItem('tomatoList', JSON.stringify(next));
    return next;
  },
  pop: () => {
    const cur = JSON.parse(localStorage.getItem('tomatoList'));
    const next = cur.slice(0, -1);
    localStorage.setItem('tomatoList', JSON.stringify(next));
    return next;
  },
};

const Todo = {
  getAll: () => {
    const all = JSON.parse(localStorage.getItem('todoList'));
    if (!all) return [];
    return all;
  },
  remove: (createdAt) => {
    const cur = JSON.parse(localStorage.getItem('todoList'));
    const next = cur.filter(todo => todo.createdAt !== createdAt);
    localStorage.setItem('todoList', JSON.stringify(next));
    return next;
  },
  push: (todo) => {
    const cur = JSON.parse(localStorage.getItem('todoList'));
    let next;
    if (!cur) {
      next = [todo];
    } else {
      next = cur.concat(todo);
    }
    localStorage.setItem('todoList', JSON.stringify(next));
    return next;
  },
  update: (createdAt, content) => {
    const cur = JSON.parse(localStorage.getItem('todoList'));
    const next = cur.map((todo) => {
      const newTodo = todo;
      if (newTodo.createdAt === createdAt) newTodo.content = content;
      return newTodo;
    });
    localStorage.setItem('todoList', JSON.stringify(next));
    return next;
  },
  move: (oldIndex, newIndex) => {
    const cur = JSON.parse(localStorage.getItem('todoList'));
    const [oldTodo] = cur.splice(oldIndex, 1);
    cur.splice(newIndex, 0, oldTodo);
    const next = cur;
    localStorage.setItem('todoList', JSON.stringify(next));
    return next;
  },
};

const Done = {
  getAll: () => JSON.parse(localStorage.getItem('doneList')),
  remove: (createdAt) => {
    const cur = JSON.parse(localStorage.getItem('doneList'));
    const next = cur.filter(todo => todo.createdAt !== createdAt);
    localStorage.setItem('doneList', JSON.stringify(next));
    return next;
  },
  push: (todo) => {
    const cur = JSON.parse(localStorage.getItem('doneList'));
    let next;
    if (!cur) {
      next = [todo];
    } else {
      next = cur.concat(todo);
    }
    localStorage.setItem('doneList', JSON.stringify(next));
    return next;
  },
};

// TODO: todo tags??
export default {
  ShowStatics,
  ShowTextarea,
  Textarea,
  CurrentStartAt,
  Tomato,
  Todo,
  Done,
};

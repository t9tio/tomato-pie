import Sortable from 'sortablejs';
import store from '../store';
import minuteAnimation from './minuteAnimation';

// communicate with background page: https://stackoverflow.com/a/11967860/4674834
const backgroundPage = chrome.extension.getBackgroundPage();

async function showTodoListAndTomatoes(todoList, tomatoes) {
  const currentStartAt = await store.CurrentStartAt.get();

  // TODO: show right svg for different kind of tomatoes
  // calculate tomato angle and display them
  const tomatoContainer = document.getElementById('tomato-container');
  const tomatoHTMLs = tomatoes
    .map((tomato, i) => {
      if (tomato.startAt === currentStartAt) {
        return `<img id="tomato-${tomato.startAt}" src="./assets/onGoingTomato.svg" width="22px"/>`;
      } if (tomato.isAbandoned) {
        // return '';
        return `<img id="tomato-${tomato.startAt}" class="abandoned-tomato" src="./assets/abandonedTomato.svg" width="22px"/>`;
      }
      return `<img id="tomato-${tomato.startAt}" src="./assets/tomato.svg" width="22px"/>`;
    });
  tomatoContainer.innerHTML = tomatoHTMLs.join('');
  tomatoes.forEach((tomato, i) => {
    const { startAt } = tomato;
    const date = new Date(startAt);
    const angle = date.getHours() / 12 * 360 + date.getMinutes() / 60 * 30 + 30 / 4;
    const tomatoEl = document.querySelector(`#tomato-${tomato.startAt}`);
    tomatoEl.style.position = 'absolute';
    tomatoEl.style.zIndex = 6;
    tomatoEl.style.margin = '113px 114px';
    tomatoEl.style.transform = `rotate(${angle}deg) translateY(-140px)`;
    tomatoEl.style.display = 'block';
  });

  // show todo list
  const ul = document.getElementById('list');
  const todoHTMLs = todoList.map((todo) => {
    const todoTomatoHTMLs = tomatoes
      .filter(tomato => tomato.todoId === todo.createdAt)
      .map((tomato) => {
        if (tomato.startAt === currentStartAt) {
          return '<img class="todo-tomato" src="./assets/onGoingTomato.svg"/>';
        } if (tomato.isAbandoned) {
          return '<img class="todo-tomato" src="./assets/abandonedTomato.svg"/>';
        }
        return '<img class="todo-tomato" src="./assets/tomato.svg"/>';
      });

    return `
            <li id="todo-${todo.createdAt}">
                <input type="checkbox" ${todo.isDone ? 'checked' : ''} class="checkbox"></input>
                <div class="content-div ${todo.isDone ? 'done' : ''}" contenteditable="true">
                    ${todo.content}
                </div>
                ${todoTomatoHTMLs.join('')}
                <input type="image" class="add-tomato-btn" src="./assets/add.svg"/>
                <input type="image" class="rm-tomato-btn" src="./assets/rmTODO.svg"/>
            </li>
        `;
  });
  ul.innerHTML = todoHTMLs.join('');

  // sortable li;
  new Sortable(ul, {
    animation: 50,
    // scroll: true,
    chosenClass: 'chosen',
    ghostClass: 'ghost',
    onEnd: async (e) => {
      const { oldIndex, newIndex } = e;
      const today = new Date();
      const todoListInStore = await store.TodoList.getByDate(today);
      const [oldTodo] = todoListInStore.splice(oldIndex, 1);
      todoListInStore.splice(newIndex, 0, oldTodo);
      const newTodoList = await store.TodoList.putByDate(today, todoListInStore);
      await showTodoListAndTomatoes(newTodoList, tomatoes);
    },
  });

  // eventListeners
  todoList.forEach((todo) => {
    const li = document.querySelector(`#todo-${todo.createdAt}`);

    // hover on li show add-tomato-btn and rm-tomato-btn
    const addTomatoBtn = document.querySelector(`#todo-${todo.createdAt} .add-tomato-btn`);
    const rmTomatoBtn = document.querySelector(`#todo-${todo.createdAt} .rm-tomato-btn`);
    li.addEventListener('mouseover', () => {
      rmTomatoBtn.style.display = 'inline-block';
      addTomatoBtn.style.display = 'inline-block';
      const liTomatoEls = document.querySelectorAll(`#todo-${todo.createdAt} .todo-tomato`);
      liTomatoEls.forEach(tomatoEl => tomatoEl.style.opacity = '.35');
      tomatoes
        .filter(tomato => tomato.todoId === todo.createdAt)
        .forEach((tomato) => {
          const clockTomatoEl = document.querySelector(`#tomato-${tomato.startAt}`);
          clockTomatoEl.style.opacity = '.35';
        });
    });
    li.addEventListener('mouseleave', () => {
      addTomatoBtn.style.display = 'none';
      rmTomatoBtn.style.display = 'none';
      const liTomatoEls = document.querySelectorAll(`#todo-${todo.createdAt} .todo-tomato`);
      liTomatoEls.forEach(tomato => tomato.style.opacity = '1');
      tomatoes
        .filter(tomato => tomato.todoId === todo.createdAt)
        .forEach((tomato) => {
          const clockTomatoEl = document.querySelector(`#tomato-${tomato.startAt}`);
          clockTomatoEl.style.opacity = '1';
        });
    });

    // event listener for add-tomato btn
    addTomatoBtn.addEventListener('click', async () => {
      const lastCurrentStartAt = await store.CurrentStartAt.get();
      const today = new Date();
      const startTime = new Date().getTime();

      if (lastCurrentStartAt && lastCurrentStartAt > startTime - 1000 * 60 * 25) {
        // ask user if he want to abandon last tomato
        const isConfimed = window.confirm('You are doing an tomato now, if you start a new one, the urrent one will be abandoned.');
        if (isConfimed) {
          // abandon the current tomato and start a new one.
          const tomatoes = await store.Tomato.getByDate(today);
          tomatoes[tomatoes.length - 1].isAbandoned = true;
          await store.Tomato.putByDate(today, tomatoes);
          await startNewTomato();
        }
      } else {
        await startNewTomato();
      }

      async function startNewTomato() {
        const tomatoes = await store.Tomato.getByDate(today);

        tomatoes.push({
          startAt: startTime,
          todoId: todo.createdAt,
        });

        await store.CurrentStartAt.put(startTime);
        await store.Tomato.putByDate(today, tomatoes);
        const todoes = await store.TodoList.getByDate(today);
        await showTodoListAndTomatoes(todoes, tomatoes);

        chrome.browserAction.setBadgeText({ text: '25m' });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
        minuteAnimation.show(startTime);
        backgroundPage.startTimmer();
      }
    });

    // rm todo and coresponding tomato
    rmTomatoBtn.addEventListener('click', async () => {
      const today = new Date();
      // const todoList = await store.TodoList.getByDate(today);
      const newTodoList = todoList.filter(todoInList => todoInList.createdAt !== todo.createdAt);
      const newTodoes = await store.TodoList.putByDate(today, newTodoList);
      const tomatoes = await store.Tomato.getByDate(today);
      await showTodoListAndTomatoes(newTodoes, tomatoes);
    });

    // event listener for checkbox
    const checkbox = document.querySelector(`#todo-${todo.createdAt} > input`);
    checkbox.addEventListener('click', async (e) => {
      e.preventDefault();
      const today = new Date();
      const todoListInStore = await store.TodoList.getByDate(today);
      const newList = todoListInStore.map((todoInStore) => {
        if (todo.createdAt === todoInStore.createdAt) {
          todoInStore.isDone = !todoInStore.isDone;
        }
        return todoInStore;
      });
      await store.TodoList.putByDate(today, todoListInStore);

      await showTodoListAndTomatoes(newList, tomatoes);
    });

    // content-div editable updating todo content
    const contentDiv = document.querySelector(`#todo-${todo.createdAt} .content-div`);
    contentDiv.addEventListener('input', async (e) => {
      // hit enter
      if (e.inputType === 'insertParagraph' || (e.inputType === 'insertText' && e.data === null)) {
        const today = new Date();
        const newTodoList = await store.TodoList.getByDate(today);
        await showTodoListAndTomatoes(newTodoList, tomatoes);
      } else {
        const today = new Date();
        const newContent = contentDiv.textContent;
        const todoList = await store.TodoList.getByDate(today);
        const newTodoList = todoList.map((todoInStore) => {
          if (todoInStore.createdAt === todo.createdAt) {
            todoInStore.content = newContent;
          }
          return todoInStore;
        });

        await store.TodoList.putByDate(today, newTodoList);
      }

      // not calling new render because content-div will lose focus
      // await showTodoListAndTomatoes(newTodoList, tomatoes);
    });
  });
}

export default showTodoListAndTomatoes;

import Sortable from 'sortablejs';
import store from '../store';
import minuteAnimation from './minuteAnimation';

// communicate with background page: https://stackoverflow.com/a/11967860/4674834
const backgroundPage = chrome.extension.getBackgroundPage();

async function showTodoListAndTomatoes(todoList, tomatoes) {
  const currentStartAt = await store.CurrentStartAt.get();

  // calculate tomato angle and display them
  const tomatoContainer = document.getElementById('tomato-container');
  const tomatoHTMLs = tomatoes
    .map((tomato) => {
      const now = new Date();
      if (tomato.startAt === currentStartAt
        && (now.getTime() - currentStartAt < 25 * 60 * 1000)) {
        return `<img id="tomato-${tomato.startAt}" src="./assets/onGoingTomato.svg" width="22px"/>`;
      }
      return `<img id="tomato-${tomato.startAt}" src="./assets/tomato.svg" width="22px"/>`;
    });
  tomatoContainer.innerHTML = tomatoHTMLs.join('');
  tomatoes.forEach((tomato) => {
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
        const now = new Date();
        if (tomato.startAt === currentStartAt
          && (now.getTime() - currentStartAt < 25 * 60 * 1000)) {
          return '<img class="todo-tomato" src="./assets/onGoingTomato.svg"/>';
        }
        return '<img class="todo-tomato" src="./assets/tomato.svg"/>';
      });

    return `
      <li id="todo-${todo.createdAt}">
        <input type="checkbox" ${todo.isDone ? 'checked' : ''} class="checkbox"></input>
        <div class="content-div ${todo.isDone ? 'done' : ''}" contenteditable="true">
            ${todo.content}
        </div>
        <div class="todo-tomato-div">
          ${todoTomatoHTMLs.join('')}
        </div>
        <input type="image" class="add-tomato-btn" src="./assets/add.svg"/>
        <input type="image" class="rm-todo-btn" src="./assets/rmTODO.svg"/>
      </li>
    `;
  });
  ul.innerHTML = todoHTMLs.join('');

  // sortable li;
  Sortable.create(ul, {
    animation: 50,
    // scroll: true,
    chosenClass: 'chosen',
    ghostClass: 'ghost',
    onEnd: async (e) => {
      const { oldIndex, newIndex } = e;
      const newTodoList = await store.Todo.move(oldIndex, newIndex);
      await showTodoListAndTomatoes(newTodoList, tomatoes);
    },
  });

  // eventListeners
  todoList.forEach((todo) => {
    const li = document.querySelector(`#todo-${todo.createdAt}`);

    // hover on li show add-tomato-btn and rm-todo-btn
    const addTomatoBtn = document.querySelector(`#todo-${todo.createdAt} .add-tomato-btn`);
    const rmTomatoBtn = document.querySelector(`#todo-${todo.createdAt} .rm-todo-btn`);
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
      const startTime = new Date().getTime();
      async function startNewTomato() {
        await store.Tomato.push({
          startAt: startTime,
          todoId: todo.createdAt,
        });

        await store.CurrentStartAt.put(startTime);
        const todos = await store.Todo.getAll();
        const tomato12H = await store.Tomato.get12h();
        await showTodoListAndTomatoes(todos, tomato12H);

        chrome.browserAction.setBadgeText({ text: '25m' });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
        minuteAnimation.show(startTime);
        backgroundPage.startTimer();
      }
      if (lastCurrentStartAt && lastCurrentStartAt > startTime - 1000 * 60 * 25) {
        // ask user if he want to abandon last tomato
        const isConfimed = window.confirm('You are doing an tomato now, if you start a new one, the current one will be abandoned.');
        if (isConfimed) {
          await store.Tomato.pop();
          await startNewTomato();
        }
      } else {
        await startNewTomato();
      }
    });

    // rm todo
    // Question: rm corresponding tomato?
    rmTomatoBtn.addEventListener('click', async () => {
      const newTodoList = await store.Todo.remove(todo.createdAt);
      const newTomatoList = await store.Tomato.get12h();
      await showTodoListAndTomatoes(newTodoList, newTomatoList);
    });

    // event listener for checkbox
    // mv todo from todoList to doneList
    const checkbox = document.querySelector(`#todo-${todo.createdAt} > input`);
    checkbox.addEventListener('click', async (e) => {
      e.preventDefault();
      const newTodoList = await store.Todo.remove(todo.createdAt);
      await store.Done.push(todo);
      await showTodoListAndTomatoes(newTodoList, tomatoes);
    });

    // content-div editable updating todo content
    const contentDiv = document.querySelector(`#todo-${todo.createdAt} .content-div`);
    contentDiv.addEventListener('input', async (e) => {
      // hit enter
      if (e.inputType === 'insertParagraph' || (e.inputType === 'insertText' && e.data === null)) {
        // rerender the list to make sure user loose mouse focus
        const newTodoList = await store.Todo.getAll();
        await showTodoListAndTomatoes(newTodoList, tomatoes);
      } else {
        const newContent = contentDiv.textContent;
        await store.Todo.update(todo.createdAt, newContent);
      }
    });
  });
}

export default showTodoListAndTomatoes;

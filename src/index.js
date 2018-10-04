import './styles/driver.scss';
import './styles/index.scss';
import './styles/todo.scss';
import './styles/statics.scss';
import './util/generateClockAnimations';
import './util/driver';
import minuteAnimation from './util/minuteAnimation';
import store from './store';
import showTodoListAndTomatoes from './util/showTodoListAndTomatoes';

// show minuteAnimation and set extension badge if there is tomato running
async function showMinuteAnimationAndExtensionBadge() {
  const currentStartAt = await store.CurrentStartAt.get();
  if (currentStartAt && new Date().getTime() - currentStartAt < 1000 * 60 * 30) {
    minuteAnimation.show(currentStartAt);
  } else {
    await store.CurrentStartAt.put(null);
    chrome.browserAction.setBadgeText({ text: '' });
  }
}
showMinuteAnimationAndExtensionBadge();

// show todoList and tomatoes today
async function showTodosAndTomatoes() {
  const today = new Date();
  const tomatoesToday = await store.Tomato.getByDate(today);
  const todoListToday = await store.TodoList.getByDate(today);
  await showTodoListAndTomatoes(todoListToday, tomatoesToday);
}
showTodosAndTomatoes();

// show unfinished todos of last 7days
async function showUnfinishedTodos(n) {
  const today = new Date();
  const todoLists = await store.TodoList.getByDateRange(today, n);
  const unfinishedTodos = todoLists.reduce((acc, curObj) => {
    const arr = curObj[Object.keys(curObj)[0]].filter(todo => !todo.isDone && !todo.isIgnoredFromRecentList);
    return acc.concat(arr);
  }, []);
  console.log(JSON.stringify(unfinishedTodos, null, 2));
  // TODO: add todos to a <ul>

  const todoHTMLs = unfinishedTodos.map(todo => `
    <li id="todo-${todo.createdAt}">
      ${todo.content}
      <input type="image" class="ignore-todo-btn" src="./assets/rmTODO.svg"/>
      <input type="image" class="copy-todo-btn" src="./assets/addTODO.svg"/>
    </li>
  `);
  document.querySelector('#unfinshed-list ul').innerHTML = todoHTMLs.join('');

  unfinishedTodos.forEach((todo) => {
    const li = document.querySelector(`#todo-${todo.createdAt}`);

    // hover on li show btns
    const ignoreTodoBtn = document.querySelector(`#todo-${todo.createdAt} .ignore-todo-btn`);
    const copyTodoBtn = document.querySelector(`#todo-${todo.createdAt} .copy-todo-btn`);
    li.addEventListener('mouseover', () => {
      copyTodoBtn.style.display = 'inline-block';
      ignoreTodoBtn.style.display = 'inline-block';
    });
    li.addEventListener('mouseleave', () => {
      ignoreTodoBtn.style.display = 'none';
      copyTodoBtn.style.display = 'none';
    });

    ignoreTodoBtn.addEventListener('click', async () => {
      todo.isIgnoredFromRecentList = true;
      await store.TodoList.putTODO(todo.createdAt, todo);
      await showUnfinishedTodos(n);
    });

    copyTodoBtn.addEventListener('click', async () => {
      todo.isCopyed = true;
      await store.TodoList.putTODO(todo.createdAt, todo);
      await showUnfinishedTodos(n);

      // TODO: extract a function
      const todoList = await store.TodoList.getByDate(today);
      todoList.push({
        createdAt: new Date().getTime(),
        content: todo.content,
        isDone: false,
      });
      const newList = await store.TodoList.putByDate(today, todoList);
      const tomatoes = await store.Tomato.getByDate(today);
      await showTodoListAndTomatoes(newList, tomatoes);
    });
  });
}
showUnfinishedTodos(7);

const toggleEle = document.querySelector('#toggle-unfinished');
toggleEle.addEventListener('click', () => {
  const unfinshedListDiv = document.querySelector('#unfinshed-list');

  console.log(unfinshedListDiv.classList, 'claaList');
  // FIXME: control beheavior using class instead of
  // manipulating css directly in js will be a better idea
  if (unfinshedListDiv.classList.contains('hide')) {
    unfinshedListDiv.classList.remove('hide');
    toggleEle.classList.add('reverse');
  } else {
    unfinshedListDiv.classList.add('hide');
    toggleEle.classList.remove('reverse');
  }
});


document.querySelector('#input-div').addEventListener('mouseover', () => {
  document.querySelector('#add-todo').style.display = 'inline-block';
});

document.querySelector('#input-div').addEventListener('mouseleave', () => {
  document.querySelector('#add-todo').style.display = 'none';
});


// add todo
async function addTodoFromInput() {
  const content = document.querySelector('#input').value;
  if (!content) {
    alert('Please type in content before adding todo');
    return;
  }
  const today = new Date();
  const todoList = await store.TodoList.getByDate(today);
  todoList.push({
    createdAt: new Date().getTime(),
    content,
    isDone: false,
  });
  const newList = await store.TodoList.putByDate(today, todoList);
  const tomatoes = await store.Tomato.getByDate(today);
  await showTodoListAndTomatoes(newList, tomatoes);

  document.getElementById('input').value = '';
}

document.querySelector('#add-todo').addEventListener('click', async () => {
  await addTodoFromInput();
});

document.querySelector('#input').addEventListener('keyup', async (e) => {
  if (e.keyCode === 13) {
    await addTodoFromInput();
  }
});

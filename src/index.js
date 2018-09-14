import './styles/driver.scss';
import './styles/index.scss';
import './styles/todo.scss';
import './util/generateClockAnimations';
// import './util/driver';
import minuteAnimation from './util/minuteAnimation';
import store from './store';
import showTodoListAndTomatoes from './util/showTodoListAndTomatoes';

(async () => {
  // show minuteAnimation and set extension badge if there is tomato running
  const currentStartAt = await store.CurrentStartAt.get();
  if (currentStartAt && new Date().getTime() - currentStartAt < 1000 * 60 * 30) {
    minuteAnimation.show(currentStartAt);
  } else {
    await store.CurrentStartAt.put(null);
    chrome.browserAction.setBadgeText({ text: '' });
  }

  // show todoList and tomatoes today
  const today = new Date();
  const tomatoesToday = await store.Tomato.getByDate(today);
  const todoListToday = await store.TodoList.getByDate(today);
  await showTodoListAndTomatoes(todoListToday, tomatoesToday);
})();

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

import './styles/index.scss';
import './styles/todo.scss';
import './styles/statics.scss';
import './util/generateClockAnimations';

import minuteAnimation from './util/minuteAnimation';
import generateCalender from './util/generateCalender';
import store from './store';
import showTodoListAndTomatoes from './util/showTodoListAndTomatoes';

// show minuteAnimation and set extension badge if there is tomato running
(async function showMinuteAnimationAndExtensionBadge() {
  const currentStartAt = await store.CurrentStartAt.get();
  if (currentStartAt && new Date().getTime() - currentStartAt < 1000 * 60 * 30) {
    minuteAnimation.show(currentStartAt);
  } else {
    await store.CurrentStartAt.remove();
    chrome.browserAction.setBadgeText({ text: '' });
  }
}());

generateCalender();

// show todoList and tomatoes
(async function showTodosAndTomatoes() {
  const tomatoesLast12H = await store.Tomato.get12h();
  const todoList = await store.Todo.getAll();
  await showTodoListAndTomatoes(todoList, tomatoesLast12H);
}());


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
  const newList = await store.Todo.push({
    createdAt: new Date().getTime(),
    content,
  });
  const tomatoes = await store.Tomato.get12h();
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

// calendar statics
const calenderDiv = document.querySelector('.calendar');
const showStaticImg = document.querySelector('.show-statics');

function renderStaticsAccordingToStore() {
  const isShow = store.ShowInfo.get();
  if (isShow) {
    calenderDiv.classList.remove('invisible');
    showStaticImg.src = './assets/staticsActiveIco.svg';
  } else {
    calenderDiv.classList.add('invisible');
    showStaticImg.src = './assets/staticsIco.svg';
  }
}

renderStaticsAccordingToStore();

showStaticImg.addEventListener('click', () => {
  if (Array.from(calenderDiv.classList).includes('invisible')) {
    store.ShowInfo.set(true);
    renderStaticsAccordingToStore();
  } else {
    store.ShowInfo.set(false);
    renderStaticsAccordingToStore();
  }
});

// show info
const showInfoImg = document.querySelector('.show-info');
const infoDiv = document.querySelector('.info-div');

showInfoImg.addEventListener('click', () => {
  if (Array.from(infoDiv.classList).includes('invisible')) {
    infoDiv.classList.remove('invisible');
  } else {
    store.ShowInfo.set(false);
    infoDiv.classList.add('invisible');
  }
});

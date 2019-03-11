import './styles/index.scss';
import './styles/todo.scss';
import './styles/switch.scss';
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

const calenderDiv = document.querySelector('.calendar');
const textareaDiv = document.querySelector('.textarea-div');
const calToggle = document.querySelector('#cb1');
const texToggle = document.querySelector('#cb2');

function renderCalTexAccordingToStore() {
  const isShowCal = store.ShowStatics.get();
  const isShowTex = store.ShowTextarea.get();

  if (isShowCal) {
    calenderDiv.classList.remove('invisible');
    calToggle.checked = isShowCal;
  } else {
    calenderDiv.classList.add('invisible');
  }

  if (isShowTex) {
    textareaDiv.classList.remove('invisible');
    texToggle.checked = isShowTex;
  } else {
    textareaDiv.classList.add('invisible');
  }
}

renderCalTexAccordingToStore();

calToggle.addEventListener('click', () => {
  store.ShowStatics.set(calToggle.checked);
  renderCalTexAccordingToStore();
});

texToggle.addEventListener('click', () => {
  store.ShowTextarea.set(texToggle.checked);
  renderCalTexAccordingToStore();
});

// show info
const showInfoImg = document.querySelector('.show-info');
const infoDiv = document.querySelector('.info-div');

// hide setting page ref: https://stackoverflow.com/a/153047
document.addEventListener('click', () => {
  infoDiv.classList.add('invisible');
});

showInfoImg.addEventListener('click', (event) => {
  event.stopPropagation();

  if (Array.from(infoDiv.classList).includes('invisible')) {
    infoDiv.classList.remove('invisible');
  } else {
    infoDiv.classList.add('invisible');
  }
});

infoDiv.addEventListener('click', (event) => {
  event.stopPropagation();
});

const textarea = document.querySelector('.textarea');

textarea.value = store.Textarea.get();

textarea.addEventListener('input', () => store.Textarea.set(textarea.value));

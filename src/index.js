import './styles/index.scss';
import './styles/todo.scss';
import './styles/switch.scss';
import './styles/statics.scss';
import './styles/modal.scss';
import './util/generateClockAnimations';

import minuteAnimation from './util/minuteAnimation';
import generateCalender from './util/generateCalender';
import store from './store';
import showTodoListAndTomatoes from './util/showTodoListAndTomatoes';

// decide if show tomato-pie or default page
const isDefaultNewTab = store.DefaultNewTab.get();

if (isDefaultNewTab === null) {
  store.DefaultNewTab.set(true);
}

if (!window.location.hash && isDefaultNewTab === false) {
  chrome.tabs.update({ url: 'chrome-search://local-ntp/local-ntp.html' });
}

// show minuteAnimation and set extension badge if there is tomato running
async function showMinuteAnimationAndExtensionBadge() {
  const currentStartAt = await store.CurrentStartAt.get();
  if (currentStartAt && new Date().getTime() - currentStartAt < 1000 * 60 * 30) {
    minuteAnimation.show(currentStartAt);
  } else {
    await store.CurrentStartAt.remove();
    chrome.browserAction.setBadgeText({ text: '' });
  }
}
showMinuteAnimationAndExtensionBadge();

generateCalender();

// show todoList and tomatoes
async function showTodosAndTomatoes() {
  const tomatoesLast12H = await store.Tomato.get12h();
  const todoList = await store.Todo.getAll();
  await showTodoListAndTomatoes(todoList, tomatoesLast12H);
}
showTodosAndTomatoes();

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

// settings
const calenderDiv = document.querySelector('.calendar');
const textareaDiv = document.querySelector('.textarea-div');
const calToggle = document.querySelector('#cb1');
const texToggle = document.querySelector('#cb2');
const defToggle = document.querySelector('#cb3');

function renderCalTexAccordingToStore() {
  const isShowCal = store.ShowStatics.get();
  const isShowTex = store.ShowTextarea.get();
  const isDefaultTab = store.DefaultNewTab.get();

  if (isShowCal) {
    calenderDiv.classList.remove('invisible');
    calToggle.checked = true;
  } else {
    calenderDiv.classList.add('invisible');
  }

  if (isShowTex) {
    textareaDiv.classList.remove('invisible');
    texToggle.checked = true;
  } else {
    textareaDiv.classList.add('invisible');
  }

  defToggle.checked = isDefaultTab;
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

defToggle.addEventListener('click', () => {
  store.DefaultNewTab.set(defToggle.checked);
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

// check if current tomato is done

let lastCurrentStartAt = store.CurrentStartAt.get();
setInterval(() => {
  const currentStartAt = store.CurrentStartAt.get();
  if (lastCurrentStartAt && !currentStartAt) {
    window.location.reload();
  }
  console.log(lastCurrentStartAt, currentStartAt);
  lastCurrentStartAt = currentStartAt;
}, 2000);

import './styles/index.scss';
import './styles/todo.scss';
import './styles/switch.scss';
import './styles/statics.scss';
import './styles/modal.scss';
import './styles/listsMenu.scss';
import './util/generateClockAnimations';
import './util/showSidebar';

import minuteAnimation from './util/minuteAnimation';
import generateCalender from './util/generateCalender';
import store from './store';
import showTodoListAndTomatoes from './util/showTodoListAndTomatoes';

// decide if show tomato-pie or default page
const isDefaultNewTab = store.DefaultNewTab.get();

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
  await showTodoListAndTomatoes();
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
  await store.Todo.push({
    createdAt: new Date().getTime(),
    content,
    tag: store.SelectedTag.get(),
  });
  await showTodoListAndTomatoes();

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
const focusToggle = document.querySelector('#cb4');

function renderCalTexAccordingToStore() {
  const isShowCal = store.ShowStatics.get();
  const isShowTex = store.ShowTextarea.get();
  const isDefaultTab = store.DefaultNewTab.get();
  const isFocusingMode = store.FocusingMode.get();

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
  focusToggle.checked = isFocusingMode;
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

focusToggle.addEventListener('click', () => {
  store.FocusingMode.set(focusToggle.checked);
  renderCalTexAccordingToStore();
  showTodoListAndTomatoes();
});

// show info
const infoDiv = document.querySelector('.info-div');

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
  lastCurrentStartAt = currentStartAt;
}, 2000);

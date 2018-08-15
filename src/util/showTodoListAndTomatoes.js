import store from '../store';
import minuteAnimation from './minuteAnimation';
// import Sortable from 'sortablejs';

// communicate with background page: https://stackoverflow.com/a/11967860/4674834
const backgroundPage = chrome.extension.getBackgroundPage();

async function showTodoListAndTomatoes(todoList, tomatoes) {
    const currentStartAt = await store.CurrentStartAt.get();

    // TODO: show right svg for different kind of tomatoes
    // calculate tomato angle and display them
    const tomatoContainer = document.getElementById('tomato-container');
    const tomatoHTMLs = tomatoes.map((tomato, i) => {
        if (tomato.startAt === currentStartAt) {
            return `<img id="tomato${i}" src="./assets/onGoingTomato.svg" width="22px"/>`
        } else if (typeof tomato.abandonReason === 'string') {
            return `<img id="tomato${i}" src="./assets/abandonedTomato.svg" width="22px"/>`
        } else {
            return `<img id="tomato${i}" src="./assets/tomato.svg" width="22px"/>`;
        }
    });
    tomatoContainer.innerHTML = tomatoHTMLs.join('');
    tomatoes.forEach((tomato, i) => {
        const { startAt } = tomato;
        const date = new Date(startAt);
        const angle = date.getHours() / 12 * 360 + date.getMinutes() / 60 * 30 + 30 / 4;
        const tomatoEl = document.querySelector(`#tomato${i}`);
        tomatoEl.style.position = 'absolute';
        tomatoEl.style.zIndex = 6;
        tomatoEl.style.margin = '113px 114px';
        tomatoEl.style.transform = `rotate(${angle}deg) translateY(-140px)`;
        tomatoEl.style.display = 'block';
    })

    // show todo list
    const ul = document.getElementById('list');
    const todoHTMLs = todoList.map(todo => {
        const todoTomatoHTMLs = tomatoes
            .filter(tomato => tomato.todoId === todo.createdAt)
            .map(tomato => {
                if (tomato.startAt === currentStartAt) {
                    return `<img class="todo-tomato" src="./assets/onGoingTomato.svg" width="15px"/>`
                } else if (typeof tomato.abandonReason === 'string') {
                    return `<img class="todo-tomato" src="./assets/abandonedTomato.svg" width="15px"/>`
                } else {
                    return `<img class="todo-tomato" src="./assets/tomato.svg" width="15px"/>`;
                }
            });

        return `
            <li draggable="true" id="todo-${todo.createdAt}">
            <input type="checkbox" ${todo.isDone ? 'checked' : ''} class="checkbox"></input>
            <div class="content-div ${todo.isDone ? 'done' : ''}" contenteditable="true">
                ${todo.content}
            </div>
                ${todoTomatoHTMLs.join('')}
                <button type="button" class="add-tomato-btn">
                    +
                </button>
            </li>
        `;
    });
    ul.innerHTML = todoHTMLs.join('');

    // const sortable = Sortable.create(el);



    let currentDraggingLiIndex;
    // eventListeners
    todoList.forEach((todo, i) => {
        const li = document.querySelector(`#todo-${todo.createdAt}`);

        // drag and drop li
        li.addEventListener('drag', (e) => {
            e.preventDefault();
            li.style.visibility = 'hidden';
            currentDraggingLiIndex = i;
            console.log('drag index', i);
        });
        li.addEventListener('dragend', (e) => {
            e.preventDefault();
            li.style.visibility = 'visible';
        });
        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            li.style.backgroundColor = 'white';
            console.log('drag over index', i);
            if (currentDraggingLiIndex > i) {
                li.style.paddingTop = '40px';
            } else if (currentDraggingLiIndex < i) {
                li.style.paddingBottom = '40px';
            }
        });
        // FIXME: js should not know how the element look
        li.addEventListener('dragleave', (e) => {
            e.preventDefault();
            li.style.paddingTop = '0';
            li.style.paddingBottom = '0';
        });
        // TODO: update store and rerender
        li.addEventListener('drop', async (e) => {
            e.preventDefault();
            const today = new Date();
            console.log('drop index', i);
            const dropLiIndex = i;
            const todoListInStore = await store.TodoList.getByDate(today);
            const tmp = todoListInStore[dropLiIndex];
            todoListInStore[dropLiIndex] = todoListInStore[currentDraggingLiIndex];
            todoListInStore[currentDraggingLiIndex] = tmp;
            const newTodoList = await store.TodoList.putByDate(today, todoListInStore);
            await showTodoListAndTomatoes(newTodoList, tomatoes);
        });

        // hover on li show add-tomato btn
        const addTomatoBtn = document.querySelector(`#todo-${todo.createdAt} button`);
        li.addEventListener('mouseover', () => addTomatoBtn.style.display = 'inline-block');
        li.addEventListener('mouseleave', () => addTomatoBtn.style.display = 'none');

        // event listener for add-tomato btn
        addTomatoBtn.addEventListener('click', async () => {
            const lastCurrentStartAt = await store.CurrentStartAt.get();
            const today = new Date();
            const startTime = new Date().getTime();

            if (lastCurrentStartAt && lastCurrentStartAt > startTime - 1000 * 60 * 25) {
                // ask user if he want to abandon last tomato
                const abandonReason = prompt('Why do you want to abandon the current tomato?');
                if (abandonReason !== null) {
                    // abandon the current tomato and start a new one.
                    const tomatoes = await store.Tomato.getByDate(today);
                    tomatoes[tomatoes.length - 1].abandonReason = abandonReason ? abandonReason : '';
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
    
                await showTodoListAndTomatoes(todoList, tomatoes);
    
                chrome.browserAction.setBadgeText({ text: '25m' });
                chrome.browserAction.setBadgeBackgroundColor({ color: 'red'});
                minuteAnimation.show(startTime);
                backgroundPage.startTimmer();
            }
        });

        // event listener for checkbox
        const checkbox = document.querySelector(`#todo-${todo.createdAt} > input`);
        checkbox.addEventListener('click', async (e) => {
            e.preventDefault();
            const today = new Date();
            const todoListInStore = await store.TodoList.getByDate(today);
            const newList = todoListInStore.map(todoInStore => {
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
            console.log(e);
            // hit enter
            if (e.inputType === 'insertParagraph' || (e.inputType === 'insertText' && e.data === null)) {
                const today = new Date();
                const newTodoList = await store.TodoList.getByDate(today);
                await showTodoListAndTomatoes(newTodoList, tomatoes);
            } else {
                const today = new Date();
                const newContent = contentDiv.textContent;
                const todoList = await store.TodoList.getByDate(today);
                const newTodoList = todoList.map(todoInStore => {
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

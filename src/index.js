import './styles/index.scss';
import './styles/todo.scss';
import './util/generateClockAnimations';
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

// add todo
document.querySelector('#input').addEventListener('keyup', async (e) => {
    const content = document.getElementById('input').value;
    if (e.keyCode === 13 && content) {
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
});

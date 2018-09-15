import Driver from 'driver.js';
import store from '../store';
import showTodoListAndTomatoes from './showTodoListAndTomatoes';

const driver = new Driver({
  allowClose: false,
  // closeBtnText: 'Skip',
  doneBtnText: 'Finish',
});

setTimeout(async () => {
  async function getIsDriverNeeded() {
    const today = new Date();
    const isOldUser = await store.IsOldUser.get();
    if (isOldUser) return false;
    const todoList = await store.TodoList.getByDate(today);
    if (todoList.length === 0) {
      await store.TodoList.putByDate(today, [{
        createdAt: today.getTime(),
        content: 'Sample todo',
        isDone: false,
      }]);
      const tomatoesToday = await store.Tomato.getByDate(today);
      const todoListToday = await store.TodoList.getByDate(today);
      await showTodoListAndTomatoes(todoListToday, tomatoesToday);
    }
    return true;
  }
  const isDriverNeeded = await getIsDriverNeeded();
  if (isDriverNeeded) {
    // Define the steps for introduction
    driver.defineSteps([
      {
        element: '#todo-div',
        popover: {
          title: 'Todo list',
          description: 'Plan your today\'s work here',
          position: 'bottom',
        },
      },
      {
        element: 'ul > li',
        popover: {
          title: 'A Sample todo',
          description: `
        - Click the content to edit <br/>
        - Reorder todo by drag and drop it on the right <br/>
        - Start a new tomato of this todo by clicking the <img src="./assets/add.svg" width="20px"/> button<br/>
      `,
          position: 'bottom',
        },
      },
      {
        element: '.clock-wrapper',
        popover: {
          title: 'Tomatos around clock',
          description: `
          There are 3 kinds of tomatoes:<br/>
          &nbsp;&nbsp;<img src="./assets/onGoingTomato.svg" width="16px"/>: on going tomato,<br/>
          &nbsp;&nbsp;<img src="./assets/tomato.svg" width="16px"/>: accomplished tomatoes, and<br/>
          &nbsp;&nbsp;<img src="./assets/abandonedTomato.svg" width="16px"/>: abandoned tomatoes.<br/>
          Position of tomatos indicates the starting times of tomatoes.
        `,
          position: 'left',
        },
      },
      {
        element: '#input-div',
        popover: {
          title: 'New todo',
          description: 'After type in some content, click the <img src="./assets/addTODO.svg" width="16px"/> button or press enter to add a new todo',
          position: 'bottom',
        },
      },
      {
        element: '.show-statics-div',
        popover: {
          title: 'Statics',
          description: 'Statics of your tomatoes',
          position: 'top',
        },
      },
    ]);
    // Start the introduction
    driver.start();
    await store.IsOldUser.put(true);
  }
}, 500);

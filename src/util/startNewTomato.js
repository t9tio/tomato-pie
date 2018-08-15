async function startNewTomato() {
    const today = new Date();
    const startTime = today.getTime();
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
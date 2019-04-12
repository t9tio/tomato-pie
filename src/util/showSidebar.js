import store from '../store';
import showTodoListAndTomatoes from './showTodoListAndTomatoes';

// show sidebar or not
function addSidebar() {
  document.querySelector('.sidebar').classList.add('sidebar-pushed');
  document.querySelector('body').classList.add('body-pushed');
  document.querySelector('.clock-wrapper').classList.add('clock-pushed');
  document.querySelector('.calendar').classList.add('calendar-pushed');
  document.querySelector('.open-sidebar-btn').classList.add('sidebar-opened');
}

function removeSidebar() {
  document.querySelector('.sidebar').classList.remove('sidebar-pushed');
  document.querySelector('body').classList.remove('body-pushed');
  document.querySelector('.clock-wrapper').classList.remove('clock-pushed');
  document.querySelector('.calendar').classList.remove('calendar-pushed');
  document.querySelector('.open-sidebar-btn').classList.remove('sidebar-opened');
}

const initIsShowSidebar = store.ShowSidebar.get();

if (initIsShowSidebar) {
  addSidebar();
}

document.querySelector('.open-sidebar-btn').addEventListener('click', () => {
  const isShowSidebar = store.ShowSidebar.get();

  if (isShowSidebar) {
    store.ShowSidebar.set(false);
    removeSidebar();
  } else {
    store.ShowSidebar.set(true);
    addSidebar();
  }
});

// sidebar functionality
function renderSidebar() {
  const tags = store.Tag.getAll();
  let selectedTag = store.SelectedTag.get();
  console.log(tags, selectedTag, 1);
  if (!tags.includes(selectedTag)) {
    selectedTag = '';
    store.SelectedTag.set(selectedTag);
    // showTodoListAndTomatoes();
    document.querySelector('#todo-title').textContent = 'Todo List';
  }
  if (selectedTag) document.querySelector('#todo-title').textContent = selectedTag;
  const allTodoA = document.querySelector('.all-todo-a');
  if (!selectedTag) {
    allTodoA.classList.add('selected');
  } else {
    allTodoA.classList.remove('selected');
  }

  allTodoA.addEventListener('click', () => {
    store.SelectedTag.set('');
    renderSidebar();
    showTodoListAndTomatoes();
    // document.querySelector('#todo-title').textContent = 'Todo List';
  });

  const tagsHTMLs = tags.map((tag, i) => {
    if (tag === selectedTag) {
      return `<a class="tag-${i} selected">
        ${tag}
        <input type="image" class="edit-tag-btn invisible" src="./assets/edit.svg"/>
        <input type="image" class="remove-tag-btn invisible" src="./assets/rmTODO.svg"/>
      </a>`;
    }
    return `<a class="tag-${i}">
      ${tag}
      <input type="image" class="edit-tag-btn invisible" src="./assets/edit.svg"/>
      <input type="image" class="remove-tag-btn invisible" src="./assets/rmTODO.svg"/>
    </a>`;
  });

  document.querySelector('.lists-list').innerHTML = tagsHTMLs.join('');

  // event listener
  tags.forEach((tag, i) => {
    const tagEl = document.querySelector(`.tag-${i}`);
    const rmTagEl = document.querySelector(`.tag-${i} .remove-tag-btn`);
    const editTagEl = document.querySelector(`.tag-${i} .edit-tag-btn`);

    tagEl.addEventListener('click', () => {
      store.SelectedTag.set(tag);
      renderSidebar();
      showTodoListAndTomatoes();
    });
    tagEl.addEventListener('mouseover', () => {
      rmTagEl.classList.remove('invisible');
      editTagEl.classList.remove('invisible');
    });
    tagEl.addEventListener('mouseleave', () => {
      rmTagEl.classList.add('invisible');
      editTagEl.classList.add('invisible');
    });
    rmTagEl.addEventListener('click', () => {
      const isConfimed = window.confirm('Do you want to remove this category? \nNote: todos with this category will not be removed');
      if (isConfimed) {
        store.Tag.remove(i);
        renderSidebar();
        showTodoListAndTomatoes();
      }
    });
    editTagEl.addEventListener('click', (e) => {
      e.stopPropagation(); // important: prevent the el click event been fired!
      const newName = prompt("What's the new category name?", tag).trim();
      if (!newName) {
        alert('Please specify a category name');
        return;
      }
      if (tags.includes(newName)) {
        alert('Same category already exist, please change the category name');
        return;
      }
      store.SelectedTag.set(newName);
      store.Tag.update(i, newName);

      const allTodos = store.Todo.getAll();
      const newAllTodos = allTodos.map((todo) => {
        if (todo.tag === tag) {
          return {
            createdAt: todo.createdAt,
            content: todo.content,
            tag: newName,
          };
        }
        return todo;
      });
      store.Todo.setAll(newAllTodos);

      renderSidebar();
      showTodoListAndTomatoes();
    });
  });
}

renderSidebar();

const listInput = document.querySelector('.add-tag-input');

listInput.addEventListener('keydown', (e) => {
  const tagValue = listInput.value.trim();
  if (e.keyCode === 13) {
    if (!tagValue) {
      alert('Please specify a category name');
      return;
    }
    try {
      store.Tag.push(listInput.value.trim());
      listInput.classList.add('invisible');
      store.SelectedTag.set(listInput.value);
      renderSidebar();
      showTodoListAndTomatoes();
    } catch (error) {
      alert('Same category already exist, please change the category name');
      console.log(error);
    }
  }
});

listInput.addEventListener('blur', () => {
  listInput.classList.add('invisible');
});

document.querySelector('.add-tag-div').addEventListener('click', () => {
  listInput.classList.remove('invisible');
  listInput.value = 'New List';
  listInput.focus();
  listInput.select();
});

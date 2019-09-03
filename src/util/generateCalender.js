import { SVGGraph } from 'calendar-graph';
import store from '../store';
import colors from '../colors';

/**
 * group object array by certain key
 * @ref https://stackoverflow.com/a/34890276/4674834
 * @param {Array} xs group of objects
 * @param {String} key object key
 * @example
 *  // {3: ["one", "two"], 5: ["three"]}
 *  groupBy(['one', 'two', 'three'], 'length');
 */
function groupBy(xs, key) {
  return xs.reduce((rv, x) => {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
}

function generateCalender() {
  const tomatoes = store.Tomato.getAll();

  const groupedTomatoes = tomatoes
    .map((tomato) => {
      const date = new Date(tomato.startAt);
      const dateStr = `${date.getFullYear()}-${date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate() <= 9 ? `0${date.getDate()}` : date.getDate()}`;
      return {
        date: dateStr,
        tomatoes: [tomato],
      };
    })
    .reduce((pre, cur) => {
      if (pre.length <= 0) return [cur];
      if (pre[pre.length - 1].date === cur.date) {
        pre[pre.length - 1].tomatoes.push(cur.tomatoes[0]);
        return pre;
      }
      return pre.concat(cur);
    }, [])
    .map((tomatoGroup) => {
      tomatoGroup.count = tomatoGroup.tomatoes.length;
      return {
        date: tomatoGroup.date,
        count: tomatoGroup.count,
        tomatoes: tomatoGroup.tomatoes,
      };
    });

  const calender = new SVGGraph('.calendar', groupedTomatoes, {
    // startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365),
    // endDate: new Date(),
    // styleOptions: {
    //   textColor: '#959494',
    //   fontSize: '12px',
    //   fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    // },
    colorFun: (v) => {
      if (v.count > 0 && v.count <= 4) return '#c6e48b';
      if (v.count > 4 && v.count <= 8) return '#7bc96f';
      if (v.count > 8 && v.count <= 12) return '#239a3b';
      if (v.count > 12) return '#196127';
      return '#eee';
    },
    onClick: (v) => {
      console.log(v);
    },
  });

  function tooltipInit() {
    const tip = document.getElementById('tooltip');
    const elems = document.getElementsByClassName('cg-day');
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('myModalContent');

    // show tip
    const mouseOver = (e) => {
      e = e || window.event;
      const elem = e.target || e.srcElement;
      const rect = elem.getBoundingClientRect();
      const count = elem.getAttribute('data-count');
      const date = elem.getAttribute('data-date');
      tip.style.display = 'block';
      tip.textContent = `${count} tomatoes on ${date}`;
      const w = tip.getBoundingClientRect().width;
      tip.style.left = `${rect.left - (w / 2) + 6}px`;
      tip.style.top = `${rect.top - 30}px`;
    };

    // hide tip
    const mouseOut = () => {
      tip.style.display = 'none';
    };

    // show statics
    const mouseClick = (e) => {
      e = e || window.event;
      const elem = e.target || e.srcElement;
      const date = elem.getAttribute('data-date');
      const tomatoGroup = groupedTomatoes.filter(group => group.date === date)[0];

      // only show modal when there are tomatoes in that day?
      if (tomatoGroup) {
        const todosObj = groupBy(tomatoGroup.tomatoes, 'todoId');
        // [{"id":"1552873989450","todo":{"createdAt":1552873989450,"content":"\n \n seeking new idea"},"tomatos":[]}]
        const todosArr = Object.keys(todosObj).map(todoId => ({
          id: todoId,
          todo: store.Todo.get(todoId) || store.Done.get(todoId),
          tomatos: todosObj[todoId],
          isDone: !!store.Done.get(todoId),
        }));
        const todoHTMLs = todosArr.map((todo) => {
          const todoTomatoHTMLs = todo.tomatos
            .map(() => '<img class="modal-tomato" src="./assets/tomato.svg"/>');

          const tagsList = store.Tag.getAll();
          const tagIndex = tagsList.indexOf(todo.todo.tag);
          const todoColor = store.TagColor.getAll()[tagIndex] || colors[tagIndex];
          return `
            <li class="modal-li">
              <input type="checkbox" class="checkbox" disabled style="border-color:${todoColor};" ${todo.isDone ? 'checked' : ''}/>
              <div class="modal-todo">
                ${todo.todo ? todo.todo.content : '<del>Deleted TODO</del>'}
              </div>

              ${todoTomatoHTMLs.join('')}

            </li>
          `;
        });
        modal.style.display = 'block';
        modalContent.innerHTML = `
          <h1 class="modal-heading">${date}</h1>
          <br/>
          ${todoHTMLs.join('')}
          <br/>
          <hr/>
          <footer style="text-align:left; font-size: 11px;">
            I'm planing a bunch of <a href="https://github.com/t9tio/tomato-pie/issues/12">new features</a> for tomato-pie (including some <a href="https://patreon.com/timqian">patron</a> only ones).
            
            But I'm not sure if there are enough people interested in the updates.
            
            If you like tomato-pie and the possible updates, please consider supporting my development by being my <a href="https://patreon.com/timqian">patron</a>. Your patronage makes continued development possible. Thank you.
          </footer>
        `;
      } else {
        modal.style.display = 'block';
        modalContent.innerHTML = '<h1 class="modal-heading">No tomato today</h1>';
      }
    };

    // hide modal
    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    };

    Array.from(elems).forEach((elem) => {
      elem.addEventListener('mouseover', mouseOver);
      elem.addEventListener('mouseout', mouseOut);
      elem.addEventListener('click', mouseClick);
    });
  }

  tooltipInit();
}

export default generateCalender;

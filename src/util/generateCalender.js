import { SVGGraph } from 'calendar-graph';
import store from '../store';

function generateCalender() {
  const tomatoes = store.Tomato.getAll();

  const groupedTomatoes = tomatoes
    .map((tomato) => {
      const date = new Date(tomato.startAt);
      const dateStr = `${date.getFullYear()}-${date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1}-${date.getDate()}`;
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
      // return tomatoGroup;
      return {
        date: tomatoGroup.date,
        count: tomatoGroup.count,
      };
    });

  console.log(groupedTomatoes);

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
    const mouseOver = function (e) {
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
    const mouseOut = function () {
      e = e || window.event;
      tip.style.display = 'none';
    };
    for (let i = 0; i < elems.length; i++) {
      if (document.body.addEventListener) {
        elems[i].addEventListener('mouseover', mouseOver, false);
        elems[i].addEventListener('mouseout', mouseOut, false);
      } else {
        elems[i].attachEvent('onmouseover', mouseOver);
        elems[i].attachEvent('onmouseout', mouseOut);
      }
    }
  }

  tooltipInit();
}

export default generateCalender;

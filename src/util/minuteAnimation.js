/**
 * Show tomato animation
 * @param startTime {Date} when the tomato begin
 */
function show(startTime) {
  if (typeof startTime !== 'number') throw new Error('startTime should be number');
  document.getElementById('minite-animition-div').classList.remove('invisible');
  const startDate = new Date(startTime);
  const currentDate = new Date();

  // - 45 because the edge start from there
  const workHalfDeg = startDate.getMinutes() / 60 * 360 + startDate.getSeconds() / 60 * 6 - 45;
  const invisibleHalfDeg = workHalfDeg + 180;
  const restHalfDeg = workHalfDeg + ((25 / 60) * 360);
  const doneHalfDeg = currentDate.getMinutes() / 60 * 360
   + currentDate.getSeconds() / 60 * 6 + 180 - 45;

  document.querySelector('.work-half').style.transform = `rotate(${workHalfDeg}deg)`;
  document.querySelectorAll('.invisible-half').forEach(el => el.style.transform = `rotate(${invisibleHalfDeg}deg)`);
  document.querySelector('.rest-half').style.transform = `rotate(${restHalfDeg}deg)`;
  document.querySelector('.done-half').style.transform = `rotate(${doneHalfDeg}deg)`;

  document.getElementById('clock-animations-style').innerHTML = `${document.getElementById('clock-animations-style').innerHTML}
    @keyframes rotate-done-minute {
      from {
        transform: rotate(${doneHalfDeg}deg);
      }
      to {
        transform: rotate(${doneHalfDeg + 360}deg);
      }
    };
  `;
}

/**
 * Hide tomato 30 min animation
 */
function hide() {
  document.getElementById('minite-animition-div').classList.add('invisible');
}

export default {
  show,
  hide,
};

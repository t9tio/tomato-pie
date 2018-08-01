// .tomato3 {
//     position: absolute;
//     z-index: 6;
//     margin: 113px 114px; 
//     transform: rotate(75deg) translateY(-140px);
//     width: 1.6rem;
// }

/**
 * pass an array of tomatos, show the tomatos of last 12 hours
 * @param tomatoesMightNeedToShow {Array} array of tomatoes
 * 
 * @example
 * showTomatoes([{startAt: 1533104525753, tag: "", description: ""}])
 */
function showTomatoes(tomatoesMightNeedToShow) {
    const now = new Date().getTime();
    const tomatoesToShow = tomatoesMightNeedToShow.filter(tomato => {
        const { startAt } = tomato;

        // tomato created 12 more hours ago
        if(now - startAt > 1000 * 60 * 60 * 12) {
            return false;
        }

        return true;
    });

    // calculate tomato angle and display them
    tomatoesToShow.forEach((tomato, i) => {
        const { startAt } = tomato;
        const date = new Date(startAt);
        const angle = date.getHours() / 12 * 360 + date.getMinutes() / 60 * 30 + 30 / 4;
        document.querySelector(`#tomato${i}`).style.transform = `rotate(${angle}deg) translateY(-140px)`;
        document.querySelector(`#tomato${i}`).style.display = 'block';
    })
}

export default showTomatoes;
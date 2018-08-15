// generate clock animations by using keyframes and animation
// TODO: move to index.html?
(function () {
    const now = new Date();
    const hourDeg = now.getHours() / 12 * 360 + now.getMinutes() / 60 * 30;
    const minuteDeg = now.getMinutes() / 60 * 360 + now.getSeconds() / 60 * 6;
    const secondDeg = now.getSeconds() / 60 * 360;
    const stylesDeg = [
        "@keyframes rotate-hour{from{transform:rotate(" + hourDeg + "deg);}to{transform:rotate(" + (hourDeg + 360) + "deg);}}",
        "@keyframes rotate-minute{from{transform:rotate(" + minuteDeg + "deg);}to{transform:rotate(" + (minuteDeg + 360) + "deg);}}",
        "@keyframes rotate-second{from{transform:rotate(" + secondDeg + "deg);}to{transform:rotate(" + (secondDeg + 360) + "deg);}}",
    ].join("");

    document.getElementById("clock-animations").innerHTML = stylesDeg;
})();

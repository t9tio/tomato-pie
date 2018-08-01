# Tomato pie
Schedule your time with a clock

## Develop

1. Load extension to chrome
2. `npm start`: watch `index.html`
3. `npm run startBackground`: watch `background.js`
4. Tool to reload extension easier(seem auto reload is implemented by chrome, need verification): https://chrome.google.com/webstore/detail/fimgfedafeadlieiabdeeaodndnlbhid

## Architecture

### Tomato page
- [x] new tab: activate background page
- [x] new tab: get current tomato from storage
- [x] click start tomato: start timmer in background
- [x] click start tomato: start timmer on page
- [x] update icon time
- [x] parcel build ok but not parcel index.html -- use `parcel index.html --no-cache` instead
- [ ] historical tomatos
    - [x] add tomato
    - [ ] get today and yesterday's tomato and rander them
- [ ] 代码优化
    - [x] all src code in src folder & all built code in dist folder
    - [x] watch background updates and better way to export functions from background.js (by assign property to `window`) 
    - [ ] move all the data to store? implement historical tomato first
- [ ] when 25 minutes ends: ask user if the tomato is valid and what has he done as description
- when 30 minutes ends: stop timmer; pop up new page; ask if user want to continue
- How to store tomatos: one key for each day
- get recent 2 days' tomatos and render clock

### Analization page
- 

## Build(TODO)

```bash
npm run build
```

## TODO:
- dat uri to share between devices
- Move repo to: https://github.com/tomato-pie/tomato-pie
- Join netwrok to see other people's tomatos

## Issues
- parcel server without --no-cache failed to run code correctly

## Ref
- clock style ref: https://codepen.io/HughDai/pen/MKKXJp
- style ref: https://codepen.io/collection/moAia/2/
- deploy dist folder: https://gist.github.com/cobyism/4730490
- motivation extension: https://github.com/maccman/motivation 


## Charging
https://developer.chrome.com/webstore/money

## Promotion
- article: 
    - How I built an interface by svg
    - Share data across devices without server
- answer questions on zhihu, recommand the tools to every place people are asking recomandation

## Lession learned
At first I want to write this app in valina js, one hard thing to implement is to add tomatos manually when user want. By React + Mobx, I don't need to consider about this anymore, I can just change the state and give the render job to react.

- make background.js always running [ref](https://stackoverflow.com/questions/17119266/how-do-i-keep-my-app-from-going-inactive):
    1. `manifest.json` 的 `permission` key 中增加 `background`
    2. `manifest.json` 中，`background` key 中不加 `persistence: false`

## competitors
- 76,767 user 342 评分https://chrome.google.com/webstore/detail/marinara-pomodoro%C2%AE-assist/lojgmehidjdhhbmpjfamhpkpodfcodef
- 128,193 user 8981 评分 https://chrome.google.com/webstore/detail/task-timer/aomfjmibjhhfdenfkpaodhnlhkolngif
- https://chrome.google.com/webstore/detail/timer/hepmlgghomccjinhcnkkikjpgkjibglj
- https://chrome.google.com/webstore/detail/timer-25-the-minimalist-t/gmdbcklinofignhfmibchnmgjcocccbh

- https://chrome.google.com/webstore/detail/timecamp-timer/ohbkdjmhoegleofcohdjagmcnkimfdaa
- https://chrome.google.com/webstore/detail/timer-25-the-minimalist-t/gmdbcklinofignhfmibchnmgjcocccbh

成长的表现是会对更小的创新感到激动，因为明白了更大的创新很难？
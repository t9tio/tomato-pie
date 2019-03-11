
<p align="center">
  <img height="230" src="https://raw.githubusercontent.com/timqian/images/master/tomatopie-header.gif">
</p>

# Tomato Pie

A new UI for [Pomodoro Technique](https://en.wikipedia.org/wiki/Pomodoro_Technique)

## Install

From [Chrome Web Store](https://chrome.google.com/webstore/detail/gffgechdocgfajkbpinmjjjlkjfjampi) or [manually](https://github.com/t9tio/tomato-pie/releases)

## Features

- A [mac os reminder](https://support.apple.com/zh-cn/guide/reminders/welcome/mac) like todo list
- Pomodoro Technique
  - show tomatoes of last 12 hours on clock
  - red part: 25 minutes for one tomato
  - green part: 5 minutes for rest
  - get notifications when a tomato is finished
  - view tomato history
- override default page for new tab (You can always turn it off at `chrome://settings/`)
- indicate time on the extension icon

## Screenshots

### Editing Todo list

![](https://raw.githubusercontent.com/timqian/images/master/tomatopie-intro1.gif)

### Doing Pomodoro

![](https://raw.githubusercontent.com/timqian/images/master/tomatopie-intro2.gif)

## Develop

1. `npm start`
1. Navigate to `chrome://extensions/`
1. Click the `load unpacked` button and load `dist` folder

## Architecture

store ==> render function ==> view =update=> store

## Build and publish

```bash
npm run build
# zip dist file and upload to chrome webstore
```

## Refs

- Clock styles: https://codepen.io/collection/moAia/2/

#### Similar tools

- https://chrome.google.com/webstore/detail/marinara-pomodoro%C2%AE-assist/lojgmehidjdhhbmpjfamhpkpodfcodef
- https://chrome.google.com/webstore/detail/task-timer/aomfjmibjhhfdenfkpaodhnlhkolngif
- https://chrome.google.com/webstore/detail/timer/hepmlgghomccjinhcnkkikjpgkjibglj
- https://chrome.google.com/webstore/detail/timer-25-the-minimalist-t/gmdbcklinofignhfmibchnmgjcocccbh
- https://chrome.google.com/webstore/detail/timecamp-timer/ohbkdjmhoegleofcohdjagmcnkimfdaa
- https://chrome.google.com/webstore/detail/timer-25-the-minimalist-t/gmdbcklinofignhfmibchnmgjcocccbh

## Tech notes

- Make background.js always running [ref](https://stackoverflow.com/questions/17119266/how-do-i-keep-my-app-from-going-inactive):
  1. in`manifest.json`, add  `background` in `permission` key
  2. in `manifest.json`, don't add `persistence: false` in `background` key
- clock animation: https://codepen.io/Alca/pen/ZeKjmB

## Updates

- 2019-03-07: add textarea; preventing notification disappearing #4

## Plans

- notify user when extension is updated [ref](https://developer.chrome.com/extensions/runtime#event-onInstalled)

## Thanks

- Layla and [Joshua](https://github.com/joshua7v) for meaningful discussions

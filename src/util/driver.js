const Driver = require('driver.js');

const driver = new Driver({
  allowClose: false,
});

// setTimeout(() => {
//   driver.highlight({
//     element: '#input-div',
//     // popover: {
//     //   title: '<em>An italicized title</em>',
//     //   description: 'Description may also contain <strong>HTML</strong>',
//     // },
//   });
// }, 1000);

// const driver = new Driver();
// Define the steps for introduction
setTimeout(() => {
  driver.defineSteps([
    {
      element: '#todo-div',
      popover: {
        title: 'Title on Popover',
        description: 'Body of the popover',
        position: 'bottom',
      },
    },
    {
      element: 'ul > li',
      popover: {
        title: 'Title on Popover',
        description: 'Body of the popover',
        position: 'bottom',
      },
    },
    {
      element: '#input-div',
      popover: {
        title: 'Title on Popover',
        description: 'Body of the popover',
        position: 'bottom',
      },
    },
    {
      element: '.clock-wrapper',
      popover: {
        title: 'Title on Popover',
        description: 'Body of the popover',
        position: 'left',
      },
    },
  ]);
  // Start the introduction
  driver.start();
}, 200);

# Koa-Router-Meta

Adds validate and auto document for koa-router.

Simple usage:

```javascript
const { regexp } = require('koa-router-meta');
const router = require('koa-router')();

if (__DEV__) {
  // This line add auto document feature on development mode.
  router.registerMetaRoute();
}

router.get({
  path: '/hello',
  comment: '这是一个示例描述',
  validate: {
    query: {
      who: regexp("您的姓名", /^.+$/).required,
    },
  },
  mockResponse: 'This is a mock response.',
  handler: async ctx => {
    ctx.body = "world.";
  },
});
```

So visit `http://YourDevelopmentServer/user/_doc.html` for auto document.
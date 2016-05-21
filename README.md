# radis

[![npm](https://img.shields.io/npm/v/radis.svg?maxAge=2592000)](https://www.npmjs.com/package/radis) [![Travis](https://img.shields.io/travis/jerome-quere/radis.svg?maxAge=2592000)](https://travis-ci.org/jerome-quere/radis)

A Node.js dependency injection base on Angular.js API.

## Quickstart

```js

var radis = require('radis)();
var app   = radis.module('app', []);

class UnicornService {
  do() {
    console.log("Rainbow");
  }
}

app.service('unicorn', UnicornService);
app.run(function (unicorn) {
  unicorn.do();
});


```

## Requirement
Radis use ES6 syntax internally so it require node >= 5.
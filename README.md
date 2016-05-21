<h1>
  <a href="https://github.com/jerome-quere/radis"><img alt="Radis logo" src="http://jerome-quere.github.io/radis/images/logo.png"/></a>
</h1>

[![Travis](https://travis-ci.org/jerome-quere/radis.svg)](https://travis-ci.org/jerome-quere/radis)

[![NPM](https://nodei.co/npm/radis.png)](https://npmjs.org/package/radis)

## Quickstart

```js

var radis = require('radis')();
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

## Documentation
[Go to documentation](http://jerome-quere.github.io/radis/)
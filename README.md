<h1><a href="https://github.com/jerome-quere/radis"><img alt="Radis logo" src="http://jerome-quere.github.io/radis/images/logo.png" /></a></h1>

[![Travis](https://travis-ci.org/jerome-quere/radis.svg)](https://travis-ci.org/jerome-quere/radis)
[![Coverage Status](https://coveralls.io/repos/github/jerome-quere/radis/badge.svg?branch=master)](https://coveralls.io/github/jerome-quere/radis?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/jerome-quere/radis.svg)](https://greenkeeper.io/)

[![NPM](https://nodei.co/npm/radis.png)](https://npmjs.org/package/radis)

## Quickstart

```js

const { radis } = require('radis');


class Unicorn {
  constructor(name) {
      this.name = name;
  }
  
  poop() {
    console.log(`${this.name} poop rainbow`);
  }
}

class UnicornProvider {
    constructor($injector, name) {
        this.name = name;
    }
    setName(name) {
        this.name = name;
    }
    $get() {
        return new Unicorn(this.name);
    }
}

radis
    .module('app', [])
    .provider('alice', UnicornProvider)
    .provider('anonymousUnicorn', UnicornProvider)
    .config((anonymousUnicornProvider) => anonymousUnicornProvider.setName("paul"))
    .run((alice, anonymousUnicorn) => {
        alice.poop(); // alice poop rainbow
        anonymousUnicorn.poop(); // paul poop rainbow
    })
    .bootstrap()
;
```

## Requirement
Radis use ES6 syntax internally so it require node >= 6.

## Documentation
[Go to documentation](http://jerome-quere.github.io/radis/)

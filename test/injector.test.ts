'use strict'

import radis from '../src'

/* tslint:disable:no-empty */

describe('Injector', function() {
  it('the injector should be injected at runtine', () => {
    radis
      .module('module', [])
      .run($injector => {
        expect($injector).toBeInstanceOf(radis.Injector)
      })
      .bootstrap()
  })

  it('the injector should be injected at config time', () => {
    radis
      .module('module', [])
      .config($injector => {
        expect($injector).toBeInstanceOf(radis.Injector)
      })
      .bootstrap()
  })

  it('The injector should parse all kind of function declaration', () => {
    radis
      .module('module', [])
      .factory('s1', () => 's1')
      .factory('s2', () => 's2')
      .run(function(s1) {
        expect(s1).toBe('s1')
      })
      .run(function(/* Comment */ s1 /* Comment */) {
        expect(s1).toBe('s1')
      })
      .run(function(s1, s2) {
        expect(s1).toBe('s1')
        expect(s2).toBe('s2')
      })
      .run(s1 => {
        expect(s1).toBe('s1')
      })
      .run((/* Comment */ s1 /* Comment */) => {
        expect(s1).toBe('s1')
      })
      .run((s1, s2) => {
        expect(s1).toBe('s1')
        expect(s2).toBe('s2')
      })
      .run(s1 => expect(s1).toBe('s1'))
      .bootstrap()
  })

  it('Should throw on invalid function', () => {
    const test: any = function(a) {}
    const _toString = Function.prototype.toString
    Function.prototype.toString = () => 'a =\\> =\\> function (){}'
    expect(() => {
      radis
        .module('module', [])
        .run(test)
        .bootstrap()
    }).toThrow()
    Function.prototype.toString = _toString
  })

  it('Should work with no parentesis arrow function', () => {
    const test: any = function(s1) {}
    const _toString = Function.prototype.toString
    const $injector = radis
      .module('module', [])
      .factory('s1', () => 's1')
      .run(s1 => {})
      .bootstrap()

    Function.prototype.toString = () => 's1 => function (){}'
    expect(() => {
      $injector.invoke(test)
    }).not.toThrow()
    Function.prototype.toString = _toString
  })
  describe('#getService', function() {
    let module: radis.Module

    beforeEach(function() {
      module = radis
        .module('module', [])
        .factory('s1', () => 's1')
        .factory('s2', () => 's2')
    })

    it('Should return the right service', () => {
      module
        .run($injector => {
          expect($injector.getService('s1')).toBe('s1')
          expect($injector.getService('s2')).toBe('s2')
        })
        .bootstrap()
    })

    it('Should throw if service does not exist', () => {
      module
        .run($injector => {
          expect(() => $injector.getService('s3')).toThrow(Error)
        })
        .bootstrap()
    })

    it('Should get provider', () => {
      module
        .run($injector => {
          expect($injector.getService('s1Provider')).toBeTruthy()
        })
        .bootstrap()
    })
    it('Should throw when provider do not exist', () => {
      module
        .run($injector => {
          expect(() => $injector.getService('s3Provider')).toThrow()
        })
        .bootstrap()
    })
  })

  describe('#invoke', () => {
    let $injector: radis.Injector

    class Service3 {
      private a: number
      constructor() {
        this.a = 42
      }
      getValue() {
        return this.a
      }
      addLocale(local1: number) {
        return this.a + local1
      }
      addService(s1: number) {
        return this.a + s1
      }
    }

    beforeEach(() => {
      $injector = radis
        .module('module', [])
        .factory('s1', () => 10)
        .factory('s2', () => 20)
        .service('s3', Service3)
        .bootstrap()
    })

    it('Should inject services', () => {
      const injectable = function(s1: number, s2: number) {
        expect(s1).toBe(10)
        expect(s2).toBe(20)
      }
      $injector.invoke(injectable)
    })

    it('Should inject services with injectable array', () => {
      const injectable = [
        's2',
        's1',
        function(s1: number, s2: number) {
          expect(s1).toBe(20)
          expect(s2).toBe(10)
        }
      ]
      $injector.invoke(injectable)
    })

    it('Should inject self', () => {
      let self = { a: 42 }
      let injectable = function(s1: number, s2: number) {
        expect(s1).toBe(10)
        expect(s2).toBe(20)
        expect(this.a).toBe(42)
      }
      $injector.invoke(injectable, self)
    })

    it('Should inject locale', () => {
      let injectable = function(s1: number, s2: number, local1: number) {
        expect(s1).toBe(10)
        expect(s2).toBe(20)
        expect(local1).toBe(30)
      }
      $injector.invoke(injectable, null, { local1: 30 })
    })

    it('Should invoke service method', () => {
      expect($injector.invoke('s3:getValue')).toBe(42)
      expect($injector.invoke('s3:addLocale', null, { local1: 5 })).toBe(47)
      expect($injector.invoke('s3:addService')).toBe(52)
    })

    it('Should throw on invalid injectable', () => {
      expect(() => $injector.invoke(42 as any)).toThrow(Error)
      expect(() => $injector.invoke(/[0-9]/ as any)).toThrow(Error)
    })

    it('Should throw on invalid string injectable', () => {
      expect(() => $injector.invoke('s3:doNotExist')).toThrow(Error)
    })
  })

  describe('#instantiate', () => {
    it('Should inject services', () => {
      class Service {
        static get $inject() {
          return ['s1']
        }
        constructor(s1: string) {
          expect(s1).toBe('s1')
        }
      }

      radis
        .module('module')
        .factory('s1', () => 's1')
        .bootstrap()
        .instantiate(Service)
    })
  })
  //
  // describe("#lift", function () {
  //     let module;
  //     let $injector;
  //
  //     class Service3 {
  //         constructor() { this.a = 42; }
  //         // noinspection JSUnusedGlobalSymbols
  //         getValue() { return this.a; }
  //         // noinspection JSUnusedGlobalSymbols
  //         addLocale(local1) { return this.a + local1; }
  //         // noinspection JSUnusedGlobalSymbols
  //         addService(s1) { return this.a + s1; }
  //     }
  //
  //     beforeEach(function () {
  //         module = radis.module("module", [])
  //             .factory("s1", () => "s1")
  //             .factory("s2", () => "s2")
  //             .service("s3", Service3)
  //             .run(["$injector", (s) => $injector = s])
  //             .bootstrap();
  //     });
  //
  //     it("Should return a function", function () {
  //         $injector.lift(() => null).should.be.an.instanceof(Function);
  //     });
  //
  //     it("Should inject all the services", function () {
  //         let injectable = (s1, s2) => {
  //             s1.should.be.equal("s1");
  //             s2.should.be.equal("s2");
  //         };
  //         $injector.lift(injectable)();
  //     });
  //
  //     it("Should lift an injectable array", function () {
  //         $injector.lift(["s1", (test) => test.should.be.equal("s1")])();
  //     });
  //
  //     it("Should inject all the services, params and locale", function () {
  //         let injectable = (s1, param1, s2, param2, local1, local2) => {
  //             s1.should.be.equal("s1");
  //             s2.should.be.equal("s2");
  //             param1.should.be.equal("param1");
  //             param2.should.be.equal("param2");
  //             local1.should.be.equal("local1");
  //             local2.should.be.equal("local2");
  //         };
  //         $injector.lift(injectable, ["param1", "param2"], {local1: "local1", local2: "local2"})("param1", "param2");
  //     });
  //
  //     it("Should bind to correct self", function () {
  //         let self = { a: 42 };
  //         let injectable = function (s1, s2) {
  //             s1.should.be.equal("s1");
  //             s2.should.be.equal("s2");
  //             this.a.should.be.equal(42);
  //         };
  //         $injector.lift(injectable, self)();
  //     });
  //
  //     it("Should bind to correct self with params and locals", function () {
  //         let self = { a: 42 };
  //         let injectable = function (s1, param1, s2, param2, local1, local2) {
  //             s1.should.be.equal("s1");
  //             s2.should.be.equal("s2");
  //             param1.should.be.equal("param1");
  //             param2.should.be.equal("param2");
  //             local1.should.be.equal("local1");
  //             local2.should.be.equal("local2");
  //             this.a.should.be.equal(42);
  //         };
  //         $injector.lift(injectable, self, ["param1", "param2"], {local1: "local1", local2: "local2"})("param1", "param2");
  //     });
  //
  //     it("Should invoke service method", function () {
  //         $injector.lift("s3:getValue")().should.be.equal(42);
  //         $injector.lift("s3:addLocale", null, [], {local1: 5})().should.be.equal(47);
  //         $injector.lift("s3:addLocale", null, ["local1"])(10).should.be.equal(52);
  //         $injector.lift("s3:addService")().should.be.equal("42s1");
  //         chai.expect(() => $injector.lift("s1:getValue")()).to.throw(Error);
  //     });
  //
  //     it("Should cache correctly", function () {
  //         let fn = $injector.lift("s3:getValue");
  //         fn().should.be.equal(42);
  //         fn().should.be.equal(42);
  //     });
  // });
})

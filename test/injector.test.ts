'use strict'

import { radis, Injector } from '../src'

/* tslint:disable:no-empty */

describe('Injector', function() {
  it('the injector should be injected at runtine', async () => {
    await radis
      .module('module', [])
      .run($injector => {
        expect($injector).toBeInstanceOf(Injector)
      })
      .bootstrap()
  })

  it('the injector should be injected at config time', async () => {
    await radis
      .module('module', [])
      .config($injector => {
        expect($injector).toBeInstanceOf(Injector)
      })
      .bootstrap()
  })

  it('The injector should parse all kind of function declaration', async () => {
    await radis
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

  it('Should throw on invalid function', async () => {
    const test: any = function(a) {}
    const _toString = Function.prototype.toString
    Function.prototype.toString = () => 'a =\\> =\\> function (){}'
    await expect(
      radis
        .module('module', [])
        .run(test)
        .bootstrap()
    ).rejects.toThrow(Error)
    Function.prototype.toString = _toString
  })

  it('Should work with no parentesis arrow function', async () => {
    const test: any = function(s1) {}
    const _toString = Function.prototype.toString
    const $injector = await radis
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

    it('Should return the right service', async () => {
      await module
        .run($injector => {
          expect($injector.getService('s1')).toBe('s1')
          expect($injector.getService('s2')).toBe('s2')
        })
        .bootstrap()
    })

    it('Should throw if service does not exist', async () => {
      await module
        .run($injector => {
          expect(() => $injector.getService('s3')).toThrow(Error)
        })
        .bootstrap()
    })

    it('Should get provider', async () => {
      await module
        .run($injector => {
          expect($injector.getService('s1Provider')).toBeTruthy()
        })
        .bootstrap()
    })
    it('Should throw when provider do not exist', async () => {
      await module
        .run($injector => {
          expect(() => $injector.getService('s3Provider')).toThrow()
        })
        .bootstrap()
    })
  })

  describe('#invoke', () => {
    let $injector: Injector

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

    beforeEach(async () => {
      $injector = await radis
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
    it('Should inject services', async () => {
      class Service {
        static get $inject() {
          return ['s1']
        }
        constructor(s1: string) {
          expect(s1).toBe('s1')
        }
      }

      const $injector = await radis
        .module('module')
        .factory('s1', () => 's1')
        .bootstrap()

      $injector.instantiate(Service)
    })
  })

  describe('#lift', () => {
    let $injector: Injector

    class Service3 {
      constructor(public a: string = 's3') {}
      getValue() {
        return this.a
      }
      addLocale(local1: string) {
        return this.a + local1
      }
      addService(s1: string) {
        return this.a + s1
      }
    }

    beforeEach(async () => {
      $injector = await radis
        .module('module', [])
        .factory('s1', () => 's1')
        .factory('s2', () => 's2')
        .service('s3', Service3)
        .bootstrap()
    })

    it('Should inject all the services', () => {
      const mock = jest.fn()
      let injectable = (s1, s2) => mock.call(null, s1, s2)
      $injector.lift(injectable)()
      expect(mock.mock.calls[0][0]).toBe('s1')
      expect(mock.mock.calls[0][1]).toBe('s2')
    })

    it('Should return result', () => {
      const mock = jest.fn().mockReturnValue(42)
      let injectable = (s1, s2) => mock.call(null, s1, s2)
      expect($injector.lift(injectable)()).toBe(42)
    })

    it('Should lift an injectable array', () => {
      const mock = jest.fn()
      $injector.lift(['s1', 's2', mock])()
      expect(mock.mock.calls[0][0]).toBe('s1')
      expect(mock.mock.calls[0][1]).toBe('s2')
    })

    it('Should inject all the services, params and locale', () => {
      const mock = jest.fn()
      const params = ['s1', 'param1', 's2', 'param2', 'local1', 'local2']
      let injectable = [...params, mock]
      $injector.lift(injectable, null, ['param1', 'param2'], { local1: 'local1', local2: 'local2' })('param1', 'param2')
      expect(mock.mock.calls[0]).toEqual(expect.arrayContaining(params))
    })

    it('Should bind to $injector by default', function() {
      const injectable = jest.fn().mockReturnThis()
      const lifted = $injector.lift(injectable)
      expect(lifted()).toBe($injector)
    })

    it('Should bind to correct self', function() {
      const self = { a: 42 }
      const injectable = jest.fn().mockReturnThis()
      const lifted = $injector.lift(injectable, self)
      expect(lifted()).toBe(self)
    })

    it('Should bind to correct self with params and locals', function() {
      const self = { a: 42 }
      const mock = jest.fn().mockReturnThis()
      const params = ['s1', 'param1', 's2', 'param2', 'local1', 'local2']
      const injectable = [...params, mock]
      const lifted = $injector.lift(injectable, self, ['param1', 'param2'], { local1: 'local1', local2: 'local2' })
      expect(lifted('param1', 'param2')).toBe(self)
      expect(mock.mock.calls[0]).toEqual(expect.arrayContaining(params))
    })

    it('Should lift service method', () => {
      expect($injector.lift('s3:getValue')()).toBe('s3')
      expect($injector.lift('s3:addLocale', null, [], { local1: 'local1' })()).toBe('s3local1')
      expect($injector.lift('s3:addLocale', null, ['local1'])('local1')).toBe('s3local1')
      expect($injector.lift('s3:addService')()).toBe('s3s1')
    })

    it('Should throw if service method does not exist', () => {
      expect($injector.lift('s1:getValue')).toThrow(Error)
    })

    it('Should cache correctly', () => {
      let fn = $injector.lift('s3:getValue')
      expect(fn()).toBe('s3')
      expect(fn()).toBe('s3')
    })
  })
})

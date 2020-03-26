import radis from '../src'

/* tslint:disable:no-empty */

describe('Module', () => {
  describe('#bootstrap()', () => {
    it('should be called', async () => {
      let module = radis.module('module', [])
      await module.bootstrap()
    })
  })

  //
  describe('#service()', function() {
    it('should be injected', async function() {
      class Service1 {}
      class Service2 {}
      class Service3 {}

      let module = radis
        .module('module', [])
        .service('s1', Service1)
        .service('s2', Service2)
        .service('s3', Service3)
        .run((s1, s2, s3) => {
          expect(s1).toBeInstanceOf(Service1)
          expect(s2).toBeInstanceOf(Service2)
          expect(s3).toBeInstanceOf(Service3)
        })
      await module.bootstrap()
    })
    it('should be injected with $name', async function() {
      class Service1 {
        static get $inject() {
          return ['$name']
        }
        constructor(public $name: string) {}
      }

      await radis
        .module('module', [])
        .service('s1', Service1)
        .run(s1 => {
          expect(s1.$name).toBe('s1')
        })
        .bootstrap()
    })
    it('should check params', function() {
      expect(() => radis.module('module', []).service('s1', function() {} as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).service('s1', undefined as any)).toThrow(Error)
      expect(() => radis.module('module', []).service('s1', null as any)).toThrow(Error)
      expect(() => radis.module('module', []).service('s1', [] as any)).toThrow(Error)
      expect(() => radis.module('module', []).service('s1', '' as any)).toThrow(Error)
      expect(() => radis.module('module', []).service('s1', 42 as any)).toThrow(Error)
      expect(() => radis.module('module', []).service('2$1', function() {} as any)).toThrow(Error)
      expect(() => radis.module('module', []).service('a.s', function() {} as any)).toThrow(Error)
      expect(() => radis.module('module', []).service('a:a', function() {} as any)).toThrow(Error)
    })
  })

  describe('#factory()', function() {
    it('should be injected', async function() {
      let module = radis.module('module', [])

      class Service1 {}
      class Service2 {}
      class Service3 {}

      await module
        .factory('service1', () => new Service1())
        .factory('service2', () => new Service2())
        .factory('service3', () => new Service3())
        .run((service1, service2, service3) => {
          expect(service1).toBeInstanceOf(Service1)
          expect(service2).toBeInstanceOf(Service2)
          expect(service3).toBeInstanceOf(Service3)
        })
        .bootstrap()
    })
    it('should be injected with $name', async function() {
      await radis
        .module('module', [])
        .factory('s1', $name => $name)
        .run(s1 => {
          expect(s1).toBe('s1')
        })
        .bootstrap()
    })
    it('should throw when nothing is return', async () => {
      const module = radis
        .module('module', [])
        .factory('s1', function() {})
        .run(s1 => {})
      await expect(module.bootstrap()).rejects.toThrow(Error)
    })
    it('should check params', function() {
      expect(() => radis.module('module', []).factory('s1', [function() {}] as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).factory('s1', function() {} as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).factory('s1', undefined as any)).toThrow(Error)
      expect(() => radis.module('module', []).factory('s1', null as any)).toThrow(Error)
      expect(() => radis.module('module', []).factory('s1', '' as any)).toThrow(Error)
      expect(() => radis.module('module', []).factory('s1', 42 as any)).toThrow(Error)
      expect(() => radis.module('module', []).factory('2$1', function() {} as any)).toThrow(Error)
      expect(() => radis.module('module', []).factory('a.s', function() {} as any)).toThrow(Error)
      expect(() => radis.module('module', []).factory('a:a', function() {} as any)).toThrow(Error)
    })
  })

  describe('#provider()', function() {
    it('should be injected', async function() {
      let module = radis.module('module', [])

      class Service1Provider {
        $get() {
          return 's1'
        }
      }
      class Service2Provider {
        $get() {
          return 's2'
        }
      }
      class Service3Provider {
        $get() {
          return 's3'
        }
      }

      await module
        .provider('service1', Service1Provider)
        .provider('service2', Service2Provider)
        .provider('service3', Service3Provider)
        .run((service1, service2, service3) => {
          expect(service1).toBe('s1')
          expect(service2).toBe('s2')
          expect(service3).toBe('s3')
        })
        .bootstrap()
    })
    it('should receive the $injector as first constructor parameter', async function() {
      class Service1Provider {
        constructor(public $injector: radis.Injector) {}
        $get() {
          return this.$injector
        }
      }

      await radis
        .module('module', [])
        .provider('s1', Service1Provider)
        .run(($injector: any, s1: any) => expect(s1).toBe($injector))
        .bootstrap()
    })
    it('should receive $name as second constructor parameter', async function() {
      class Service1Provider {
        constructor(public $injector: radis.Injector, public $name: string) {}
        $get() {
          return this.$name
        }
      }

      await radis
        .module('module', [])
        .provider('s1', Service1Provider)
        .run((s1: any) => expect(s1).toBe('s1'))
        .bootstrap()
    })
    it('$get should receive $name as parameter', async function() {
      class Service1Provider {
        $get($name: string) {
          return $name
        }
      }

      await radis
        .module('module', [])
        .provider('s1', Service1Provider)
        .run(s1 => expect(s1).toBe('s1'))
        .bootstrap()
    })
    it('should check params', function() {
      expect(() => radis.module('module', []).provider('s1', function() {} as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).provider('s1', undefined as any)).toThrow(Error)
      expect(() => radis.module('module', []).provider('s1', null as any)).toThrow(Error)
      expect(() => radis.module('module', []).provider('s1', '' as any)).toThrow(Error)
      expect(() => radis.module('module', []).provider('s1', [] as any)).toThrow(Error)
      expect(() => radis.module('module', []).provider('s1', 42 as any)).toThrow(Error)
      expect(() => radis.module('module', []).provider('2$1', function() {} as any)).toThrow(Error)
      expect(() => radis.module('module', []).provider('a.s', function() {} as any)).toThrow(Error)
      expect(() => radis.module('module', []).provider('a:a', function() {} as any)).toThrow(Error)
    })
  })

  describe('#config()', function() {
    it('should call config with the provider', async function() {
      class Service1Provider {
        private string: string
        setString(s: string) {
          this.string = s
        }

        $get() {
          return this.string
        }
      }

      await radis
        .module('module', [])
        .provider('service1', Service1Provider)
        .config(function(service1Provider) {
          service1Provider.setString('value')
        })
        .run(function(service1) {
          expect(service1).toBe('value')
        })
        .bootstrap()
    })

    it('should check params', function() {
      expect(() => radis.module('module', []).config(function() {} as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).config([function() {}] as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).config(undefined as any)).toThrow(Error)
      expect(() => radis.module('module', []).config(null as any)).toThrow(Error)
      expect(() => radis.module('module', []).config([] as any)).toThrow(Error)
      expect(() => radis.module('module', []).config(42 as any)).toThrow(Error)
    })
  })

  describe('#run()', function() {
    it('should check params', function() {
      expect(() => radis.module('module', []).run(function() {} as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).run([function() {}] as any)).not.toThrow(Error)
      expect(() => radis.module('module', []).run(undefined as any)).toThrow(Error)
      expect(() => radis.module('module', []).run(null as any)).toThrow(Error)
      expect(() => radis.module('module', []).run([] as any)).toThrow(Error)
      expect(() => radis.module('module', []).run(42 as any)).toThrow(Error)
    })
  })
})

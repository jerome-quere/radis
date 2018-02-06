import radis from '../src'

describe('ModuleDependencies', () => {
  describe('Simple dependency', () => {
    it('should get the dependency service', () => {
      const m1 = radis.module('m1', []).factory('s1', () => 's1')
      const m2 = radis.module('m2', [m1]).factory('s2', () => 's2')
      const m3 = radis.module('m3', [m2]).factory('s3', () => 's3')

      m2.run((s1, s2) => {
        expect(s1).toBe('s1')
        expect(s2).toBe('s2')
      })

      m3.run((s1, s2, s3) => {
        expect(s1).toBe('s1')
        expect(s2).toBe('s2')
        expect(s3).toBe('s3')
      })

      m3.bootstrap()
    })

    it('should override the child dependency', () => {
      const m1 = radis.module('m1', []).factory('service', () => 's1')
      const m2 = radis.module('m2', [m1]).factory('service', () => 's2')
      const m3 = radis.module('m3', [m2, m1]).factory('service', () => 's3')

      m1.run(service => expect(service).toBe('s1'))
      m2.run(service => expect(service).toBe('s2'))
      m3.run(service => expect(service).toBe('s3'))

      m3.bootstrap()
    })

    it('should get the closest child dependency', () => {
      const m1 = radis.module('m1', []).factory('service', () => 's1')
      const m2 = radis.module('m2', [m1]).factory('service', () => 's2')
      const m3 = radis.module('m3', [m2])

      m3.run(service => expect(service).toBe('s2'))
      m3.bootstrap()
    })

    it('should call dependency first', () => {
      const m1 = radis.module('m1', []).factory('s1', () => 's1')
      const m2 = radis.module('m2', [m1]).factory('s2', () => 's2')

      let count = 0

      m1.config(s1Provider => expect(count++).toBe(0))
      m1.run(s1 => expect(count++).toBe(2))

      m2.config(s2Provider => expect(count++).toBe(1))
      m2.run(s2 => expect(count++).toBe(3))

      m2.bootstrap()
    })

    it('should get a shared instance', () => {
      const m1 = radis.module('m1').factory('s', () => ({ v: 0 }))
      const m2 = radis.module('m2', [m1])
      const m3 = radis.module('m2', [m1])
      const m4 = radis.module('m2', [m2, m3])

      m1.run(s => expect(s.v++).toBe(0))
      m2.run(s => expect(s.v++).toBe(1))
      m3.run(s => expect(s.v++).toBe(2))
      m4.run(s => expect(s.v++).toBe(3))

      m4.bootstrap()
    })

    it('should be call in the right order', () => {
      let count = 0

      const m1 = radis.module('m1').factory('s', () => {
        expect(count++).toBe(4)
        return 42
      })
      const m2 = radis.module('m2', [m1])
      const m3 = radis.module('m2', [m1])
      const m4 = radis.module('m2', [m2, m3])

      m1.config(sProvider => expect(count++).toBe(0))
      m2.config(sProvider => expect(count++).toBe(1))
      m3.config(sProvider => expect(count++).toBe(2))
      m4.config(sProvider => expect(count++).toBe(3))

      m1.run(s => expect(count++).toBe(5))
      m2.run(s => expect(count++).toBe(6))
      m3.run(s => expect(count++).toBe(7))
      m4.run(s => expect(count++).toBe(8))

      m4.bootstrap()
    })
  })
})

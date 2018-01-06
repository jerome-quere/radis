import radis from '../src/'

describe('Core', function() {
  describe('module()', function() {
    it('should return the module', function() {
      let module = radis.module('module', [])
      expect(module).toBeInstanceOf(radis.Module)
      expect(module.getName()).toBe('module')
    })

    it('should test the module name', function() {
      expect(() => radis.module('module', [])).not.toThrow()
      expect(() => radis.module('fs.ds', [])).toThrow()
    })
  })
})

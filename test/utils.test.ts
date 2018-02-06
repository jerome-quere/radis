import * as utils from '../src/utils'

/* tslint:disable:no-empty */

describe('Utils', () => {
  describe('#isArray()', () => {
    it('should test if value is an array', () => {
      expect(utils.isArray([])).toBe(true)
      expect(utils.isArray([1])).toBe(true)
      expect(utils.isArray(new Array(1))).toBe(true)
      expect(utils.isArray('')).toBe(false)
      expect(utils.isArray(42)).toBe(false)
      expect(utils.isArray(/test/)).toBe(false)
      expect(utils.isArray(true)).toBe(false)
      expect(utils.isArray(function() {})).toBe(false)
      expect(utils.isArray({})).toBe(false)
    })
  })

  describe('#isFunction', function() {
    it('should test if value is a function', () => {
      expect(utils.isFunction([])).toBe(false)
      expect(utils.isFunction([1])).toBe(false)
      expect(utils.isFunction(new Array(1))).toBe(false)
      expect(utils.isFunction('')).toBe(false)
      expect(utils.isFunction(42)).toBe(false)
      expect(utils.isFunction(true)).toBe(false)
      expect(utils.isFunction(function() {})).toBe(true)
      expect(utils.isFunction({})).toBe(false)
    })
  })

  describe('#isString', () => {
    it('should test if value is a string', () => {
      expect(utils.isString([])).toBe(false)
      expect(utils.isString([1])).toBe(false)
      expect(utils.isString(new Array(1))).toBe(false)
      expect(utils.isString('')).toBe(true)
      expect(utils.isString(42)).toBe(false)
      expect(utils.isString(true)).toBe(false)
      expect(utils.isString(function() {})).toBe(false)
      expect(utils.isString({})).toBe(false)
    })
  })

  describe('#isInjectable', () => {
    it('should test if value is an Injectable', () => {
      expect(utils.isInjectable(function() {})).toBe(true)
      expect(utils.isInjectable(['s1', function() {}])).toBe(true)
      expect(utils.isInjectable([function() {}])).toBe(true)
      expect(utils.isInjectable([])).toBe(false)
      expect(utils.isInjectable([1])).toBe(false)
      expect(utils.isInjectable('')).toBe(false)
      expect(utils.isInjectable(42)).toBe(false)
      expect(utils.isInjectable(true)).toBe(false)
      expect(utils.isInjectable({})).toBe(false)
    })
  })

  describe('#isModuleName', () => {
    it('should test if value is a valid module name', () => {
      expect(utils.isModuleName('ds')).toBe(true)
      expect(utils.isModuleName('1ds')).toBe(false)
      expect(utils.isModuleName('d_s')).toBe(false)
      expect(utils.isModuleName('d:s')).toBe(false)
      expect(utils.isModuleName('d-s')).toBe(false)
    })
  })

  describe('#isServiceName', () => {
    it('should test if value is a valid service name', () => {
      expect(utils.isServiceName('ds')).toBe(true)
      expect(utils.isServiceName('1ds')).toBe(false)
      expect(utils.isServiceName('d_s')).toBe(false)
      expect(utils.isServiceName('d:s')).toBe(false)
      expect(utils.isServiceName('d-s')).toBe(false)
    })
  })
})

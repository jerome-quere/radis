'use strict'

/**
 * The module name RegExp
 */
export const moduleNameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/

/**
 * The service name RegExp
 */
export const serviceNameRegex = /^[a-zA-Z][a-zA-Z0-9]*$/

/**
 * The service method name RegExp
 */
export const serviceMethodNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*:[^:]+$/

/**
 * Test if value is an array
 * @param value the value you want to test
 * @return True is value is an array
 */
export function isArray(value: any): boolean {
  return Array.isArray(value)
}

/**
 * Test if value is a string
 * @param  value the value you want to test
 * @return true is value is a string
 */
export function isString(value: any): boolean {
  return typeof value === 'string'
}

/**
 * Test if value is a function
 * @param  value the value you want to test
 * @return true is value is a function
 */
export function isFunction(value: any): boolean {
  return !!(value && value.constructor && value.call && value.apply)
}

/**
 * Test if value is an Injectable
 * @param  value the value you want to test
 * @return true is value is an injectable
 */
export function isInjectable(value: any): boolean {
  return isFunction(value) || (isArray(value) && isFunction(value[value.length - 1])) || (isString(value) && serviceMethodNameRegex.test(value))
}

/**
 * Test if value is a valid module name
 * @param name the value you want to test
 * @return true is value is a valid module name
 */
export function isModuleName(name: string): boolean {
  return moduleNameRegex.test(name)
}

/**
 * Test if value is a valid service name
 * @param  name the value you want to test
 * @return true is value is a valid service name
 */
export function isServiceName(name: string): boolean {
  return serviceNameRegex.test(name)
}

export type InjectableArray = (string | Function)[]
export type InjectableFunction = (...args: any[]) => any
export type Injectable = InjectableFunction | InjectableArray | String
export type InjectableClass = {
  $inject?: string[]
  new (...args: any[]): any
}
export interface Service {}
export interface ServiceClass {
  $inject?: string[]
  new (...args: any[]): Service
}

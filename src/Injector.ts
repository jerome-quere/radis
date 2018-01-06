'use strict'

import functionArguments from 'function-arguments'
import { Injectable, InjectableArray, InjectableClass, InjectableFunction, isArray, isFunction, isInjectable, Service, isString } from './utils'

export interface Provider {
  $get(...args: any[]): any
}

export interface ProviderClass {
  new ($injector: Injector, serviceName: string): Provider
}

interface ServiceBag {
  providerClass: ProviderClass
  provider?: Provider
  service?: Service
}

class ResolvedInjectable {
  constructor(public func: InjectableFunction, public self: any, public services: string[]) {}
  invoke(injector: Injector, locals: any): any {
    let services = this.services.map(serviceName => injector.getService(serviceName, locals))
    return this.func.apply(this.self, services)
  }
}

/**
 *
 */
export class Injector {
  private services: { [name: string]: ServiceBag }

  /**
   *
   */
  constructor() {
    this.services = {}
  }

  /**
   * This method invoke the given injectable applying right parameters based on their name
   * @param injectable A function to be invoked
   * @param self An object to which the injectable function will be bind to
   * @param locals Additional one-time services that will be injected into the injectable
   * @return The return value of injectable
   */
  invoke(injectable: Injectable, self: any = null, locals: any = {}) {
    return this._resolveInjectable(injectable, self).invoke(this, locals)
  }

  /**
   * Call new operator on the given injectableClass proving the controller with the right parameters.
   * @info injectableClass.$inject MUST be an array
   * @param injectableClass A injectable class
   * @param locals Additional variables that will be injected
   * @returns A new instance of injectableClass
   */
  instantiate(injectableClass: InjectableClass, locals: any = {}): any {
    let serviceNames = injectableClass['$inject'] || []
    let services = serviceNames.map(serviceName => this.getService(serviceName, locals))
    return new injectableClass(...services)
  }

  /**
   * This method lift a classic function to an injectable function.
   * @example
   * let middleware = (service1, req, res, nex) => console.log(service1, req, res, next)
   * let liftedMiddleware = $injector.lift(middleware, ["req", "res", "next"]);
   * app.use(liftedMiddleware) OR  liftedMiddleware(req, res, next(
   * @param injectable The function you want to lift
   * @param self An object to which the injectable function will be bind to
   * @param paramNames the name of the parameter lift will received so they can be injected.
   * @param locals Additional variables that will be injected
   * @return {Function} The lifted function
   */
  // lift(injectable: Injectable, self: any = null, paramNames: string[] = [], locals = {}) {
  //   // Re-arrange parameters if no self is provided
  //   if (isArray(self)) {
  //     locals = paramNames
  //     paramNames = self
  //     self = null
  //   }
  //
  //   let cache = null
  //   let that = this
  //   return function() {
  //     // Merge locals and positional params
  //     let _locals = Object.assign({}, locals)
  //     let args = arguments
  //     paramNames.forEach((name, index) => {
  //       _locals[name] = args[index]
  //     })
  //
  //     // If injection was already resolve use cached version.
  //     if (cache) {
  //       return cache(_locals)
  //     }
  //
  //     // Handle serviceMethod injectable
  //     if (isString(injectable) && utils.serviceMethodNameRegex.test(injectable)) {
  //       let _tmp = injectable.split(':')
  //       if (self === null || self === undefined) self = that._getService(_tmp[0], _locals)
  //
  //       if (!utils.isFunction(self[_tmp[1]]))
  //         throw new Error(`Invalid serviceMethod injectable ${injectable}. No method ${_tmp[1]} found in service ${_tmp[0]}`)
  //       injectable = self[_tmp[1]]
  //     }
  //
  //     if (self === undefined || self === null) self = this
  //
  //     if (utils.isFunction(injectable)) injectable = Injector._buildInjectArray(injectable)
  //
  //     let func = injectable.pop()
  //
  //     cache = locals => {
  //       let services = injectable.map(serviceName => that._getService(serviceName, locals))
  //       return func.apply(self, services)
  //     }
  //
  //     return cache(_locals)
  //   }
  // }

  /**
   * @param serviceName The name of the service
   * @param locals Additional variables that will be injected
   * @returns The service instance
   * @throws The service must exist
   * @private
   */
  getService(serviceName: string, locals: any = {}): Service {
    if (locals[serviceName] !== undefined) {
      return locals[serviceName]
    }

    if (serviceName === '$injector') {
      return this
    }

    if (serviceName.endsWith('Provider')) {
      return this._getProvider(serviceName.substr(0, serviceName.length - 'Provider'.length))
    }

    const serviceBag = this.services[serviceName]
    if (!serviceBag) {
      throw new Error(`Can't load service with name ${serviceName}`)
    }

    const provider = this._getProvider(serviceName)
    if (serviceBag.service === undefined) {
      serviceBag.service = this.invoke(provider.$get, provider, { $name: serviceName })
      if (serviceBag.service === undefined) {
        throw new Error(`Method $get of ${serviceName} provider must return a valid service got ${serviceBag.service}`)
      }
    }

    return serviceBag.service
  }

  /**
   * Add a child injector
   * @param $injector The child injector
   * @return {Injector} this
   */
  addChild($injector: Injector): Injector {
    this.services = {
      ...$injector.services,
      ...this.services
    }
    return this
  }

  addProvider(serviceName: string, providerClass: ProviderClass): Injector {
    this.services[serviceName] = { providerClass }
    return this
  }

  /**
   * @param serviceName The service name
   * @returns the provider
   * @private
   */
  private _getProvider(serviceName: string): Provider {
    const serviceBag = this.services[serviceName]
    if (!serviceBag) {
      throw new Error(`Can't load service with name ${serviceName}`)
    }

    if (serviceBag.provider === undefined) {
      serviceBag.provider = new serviceBag.providerClass(this, serviceName)
    }

    return serviceBag.provider
  }

  private _resolveFunctionInjectable(injectable: InjectableFunction, self: any): ResolvedInjectable {
    let services = functionArguments(injectable)

    /*
       * Handle single param arrow function without params with one line return
       * eg: v => true
       * https://github.com/charlike/function-arguments/issues/2
       */
    if (services.length === 1 && services[0] === '') {
      let funcStr = injectable.toString()
      let params = funcStr.replace(/\s/gm, '').split('=>')
      if (params.length < 2) throw new Error("Can't parse params for function ${params}")
      services = [params[0]]
    }
    return new ResolvedInjectable(injectable, self || this, services)
  }

  private _resolveArrayInjectable(injectable: InjectableArray, self: any): ResolvedInjectable {
    return new ResolvedInjectable(injectable[injectable.length - 1] as any, self || this, injectable.slice(0, -1) as any)
  }

  private _resolveStringInjectable(injectable: string, self: any): ResolvedInjectable {
    const tmp = injectable.split(':')
    self = this.getService(tmp[0], {})

    if (!isFunction(self[tmp[1]])) {
      throw new Error(`Invalid serviceMethod injectable ${injectable}. No method ${tmp[1]} found in service ${tmp[0]}`)
    }

    return this._resolveFunctionInjectable(self[tmp[1]], self)
  }

  /**
   *
   */
  private _resolveInjectable(injectable: Injectable, self: any): ResolvedInjectable {
    if (!isInjectable(injectable)) {
      throw new Error(`${injectable} is not a valid injectable`)
    } else if (isArray(injectable)) {
      return this._resolveArrayInjectable(injectable as any, self)
    } else if (isFunction(injectable)) {
      return this._resolveFunctionInjectable(injectable as any, self)
    } else {
      return this._resolveStringInjectable(injectable as any, self)
    }
  }
}

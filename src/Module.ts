import { Injector, ProviderClass } from './Injector'
import { Injectable, isInjectable, isFunction, isServiceName, ServiceClass, serviceNameRegex } from './utils'

export class Module {
  private name: string
  private dependencies: Module[]
  private services: { [name: string]: ProviderClass }
  private configHooks: Injectable[]
  private runHooks: Injectable[]

  /**
   * @param name The name of ne module
   * @param dependencies An array of dependencies modules
   */
  constructor(name: string, dependencies: Module[]) {
    this.name = name
    this.dependencies = dependencies

    this.services = {}
    this.configHooks = []
    this.runHooks = []
  }

  /**
   * @returns The module name
   */
  getName(): string {
    return this.name
  }

  /**
   * @param injectable A config hook function
   * @returns The current module
   */
  config(injectable: Injectable): Module {
    if (!isInjectable(injectable)) {
      throw new Error(`Can't register config injectable ${injectable} in ${this.getName()}`)
    }

    this.configHooks.push(injectable)
    return this
  }

  /**
   * @param {Injectable} injectable A run hook function
   * @returns {Module} The current module
   */
  run(injectable: Injectable): Module {
    if (!isInjectable(injectable)) {
      throw new Error(`Can't register run injectable ${injectable} in ${this.getName()}`)
    }

    this.runHooks.push(injectable)
    return this
  }

  /**
   * Register a new service in the module
   * @param serviceName the service name
   * @param serviceClass The service class
   * @returns this
   */
  service(serviceName: string, serviceClass: ServiceClass): Module {
    if (!isServiceName(serviceName)) {
      throw new Error(`Can't register service in ${this.getName()} with name ${serviceName}. serviceName must match ${serviceNameRegex}`)
    }

    if (!isFunction(serviceClass)) {
      throw new Error(`Can't register service in ${this.getName()} with name ${serviceName}. Invalid serviceClass ${serviceClass}`)
    }

    this.services[serviceName] = class {
      $get($injector: Injector) {
        return $injector.instantiate(serviceClass, { $name: serviceName })
      }
    }

    return this
  }

  /**
   * Register a new service in the module by providing a factory
   * @param serviceName the name of the service
   * @param injectable The function responsible of creating the service instance.
   * @returns this
   */
  factory(serviceName: string, injectable: Injectable): Module {
    if (!isServiceName(serviceName)) {
      throw new Error(`Can't register factory in ${this.getName()} with name ${serviceName}. serviceName must match ${serviceNameRegex}`)
    }

    if (!isInjectable(injectable)) {
      throw new Error(`Can't register factory in ${this.getName()} with name ${serviceName}. Invalid injectable ${injectable}`)
    }

    this.services[serviceName] = class {
      $get($injector: Injector) {
        return $injector.invoke(injectable, $injector, { $name: serviceName })
      }
    }
    return this
  }

  /**
   * Register a new service in the module by providing a provider class
   * @param serviceName The service name
   * @param providerClass A provider constructor
   * @returns this
   */
  provider(serviceName: string, providerClass: ProviderClass): Module {
    if (!isServiceName(serviceName)) {
      throw new Error(`Can't register provider in ${this.getName()} with name ${serviceName}. serviceName must match ${serviceNameRegex}`)
    }

    if (!isFunction(providerClass)) {
      throw new Error(`Can't register provider in ${this.getName()} with name ${serviceName}. Invalid providerClass ${providerClass}`)
    }

    this.services[serviceName] = providerClass
    return this
  }

  /**
   * Bootstrap the module
   * @return The module injector
   */
  bootstrap(): Injector {
    const modules: Module[] = []
    const $injectors: Injector[] = []

    const $injector = this._bootstrap(modules, $injectors)

    modules.push(this)
    $injectors.push($injector)

    // TODO maybe throw if a service instance try to be injected in the config hook
    modules.forEach((module, i) => {
      module.configHooks.forEach(hook => $injectors[i].invoke(hook))
    })

    modules.forEach((module, i) => {
      module.runHooks.forEach(hook => $injectors[i].invoke(hook))
    })

    return $injector
  }

  /**
   * Bootstrap the module.
   * @param modules An array of module
   * @param $injectors An array of corresponding injector
   * @returns the newly created injector
   */
  private _bootstrap(modules: Module[], $injectors: Injector[]): Injector {
    const $injector = new Injector()

    Object.keys(this.services).forEach(serviceName => $injector.addProvider(serviceName, this.services[serviceName]))

    this.dependencies.forEach(dependency => {
      let moduleIndex = modules.indexOf(dependency)
      if (moduleIndex === -1) {
        $injectors.push(dependency._bootstrap(modules, $injectors))
        modules.push(dependency)
        moduleIndex = modules.length - 1
      }

      $injector.addChild($injectors[moduleIndex])
    })

    return $injector
  }
}

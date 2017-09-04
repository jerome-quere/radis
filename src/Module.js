"use strict";

const
    Injector = require("./Injector"),
    utils = require("./utils")
;


/**
 * @typedef {Object} Service
 * @typedef {{$get: function():Object}} IProvider
 * @typedef {function(new:IProvider, Injector, string)} IProviderClass
 * @typedef {{providerClass: !IProviderClass, provider: ?IProvider, service: ?Service}} ServiceStore
 */

/**
 * @class Module
 * @typedef {String|String[]|function} Injectable
 * @property {string} name
 * @property {Module[]} dependencies
 * @property {Map<string, IProviderClass>} services
 * @property {Injectable[]} configHooks
 * @property {Injectable[]} runHooks
 */
class Module {

    /**
     * @param {string} name The name of ne module
     * @param {Module[]} dependencies An array of dependencies modules
     */
    constructor(name, dependencies) {
        this.name = name;
        this.dependencies = dependencies;

        this.services = new Map();
        this.configHooks = [];
        this.runHooks = [];
    }

    /**
     * @returns {string} The module name
     */
    getName() {
        return this.name;
    }

    /**
     * @param {Injectable} injectable A config hook function
     * @returns {Module} The current module
     */
    config(injectable) {
        if ( !utils.isInjectable(injectable) )
            throw new Error(`Can't register config injectable in ${this.getName()} ${serviceClass}`);

        this.configHooks.push(injectable);
        return this;
    }

    /**
     * @param {Injectable} injectable A run hook function
     * @returns {Module} The current module
     */
    run(injectable) {
        if ( !utils.isInjectable(injectable) )
            throw new Error(`Can't register run injectable in ${this.getName()} ${serviceClass}`);

        this.runHooks.push(injectable);
        return this;
    }

    /**
     * Register a new service in the module
     * @param {string} serviceName the service name
     * @param {function(new:Service)} serviceClass The service class
     * @returns {Module} this
     */
    service(serviceName, serviceClass) {
        if ( !utils.isServiceName(serviceName) )
            throw new Error(`Can't register service in ${this.getName()} with name ${serviceName}. serviceName must match ${utils.serviceNameRegex.toString()}`);

        if ( !utils.isFunction(serviceClass) )
            throw new Error(`Can't register service in ${this.getName()} with name ${serviceName}. Invalid serviceClass ${serviceClass}`);

        this.services.set(serviceName, function () {
            this.$get = ($injector) => {
                return $injector.instantiate(serviceClass, { $name: serviceName });
            };
        });
        return this;
    }

    /**
     * Register a new service in the module by providing a factory
     * @param {string} serviceName the name of the service
     * @param {Injectable} injectable The function responsible of
     * creating the service instance.
     * @returns {Module} this
     */
    factory(serviceName, injectable) {
        if ( !utils.isServiceName(serviceName) )
            throw new Error(`Can't register factory in ${this.getName()} with name ${serviceName}. serviceName must match ${utils.serviceNameRegex.toString()}`);

        if ( !utils.isInjectable(injectable) )
            throw new Error(`Can't register factory in ${this.getName()} with name ${serviceName}. Invalid injectable ${injectable}`);

        this.services.set(serviceName, function () {
            this.$get = injectable;
        });
        return this;
    }

    /**
     * Register a new service in the module by providing a provider class
     * @param {string} serviceName The service name
     * @param {IProviderClass} providerClass A provider constructor
     * @returns {Module} this
     */
    provider(serviceName, providerClass) {
        if ( !utils.isServiceName(serviceName) )
            throw new Error(`Can't register provider in ${this.getName()} with name ${serviceName}. serviceName must match ${utils.serviceNameRegex.toString()}`);

        if ( !utils.isFunction(providerClass) )
            throw new Error(`Can't register provider in ${this.getName()} with name ${serviceName}. Invalid providerClass ${providerClass}`);

        this.services.set(serviceName, providerClass);
        return this;
    }

    /**
     * Bootstrap the module
     * @return {Injector} The module injector
     */
    bootstrap() {
        let modules = [];
        let $injectors = [];

        let $injector = this._bootstrap(modules, $injectors);

        modules.push(this);
        $injectors.push($injector);

        //TODO maybe throw if a service instance try to be injected in the config hook
        modules.forEach((module, i) => {
            module.configHooks.forEach((hook) => $injectors[i].invoke(hook));
        });

        modules.forEach((module, i) => {
            module.runHooks.forEach((hook) => $injectors[i].invoke(hook));
        });

        return $injector;
    }

    /**
     * Bootstrap the module.
     * @param {Module[]} modules An array of module
     * @param {Injector[]} $injectors An array of corresponding injector
     * @returns {Injector} the newly created injector
     */
    _bootstrap(modules, $injectors) {
        let $injector = new Injector();

        this.dependencies.forEach((dependency) => {

            let moduleIndex = modules.indexOf(dependency);
            if (moduleIndex === -1) {
                $injectors.push(dependency._bootstrap(modules, $injectors));
                modules.push(dependency);
                moduleIndex = modules.length - 1;
            }

            $injectors[moduleIndex].services.forEach((serviceStore, serviceName) => {
                $injector._addServiceStore(serviceName, serviceStore);
            });
        });

        this.services.forEach((providerClass, serviceName) => {
            $injector._addServiceStore(serviceName, {
                providerClass: providerClass,
                provider: null,
                service: null
            });
        });

        return $injector;
    }
}

module.exports = Module;

"use strict";

let Injector = require("./Injector");

/**
 * @class Module
 * @property {string} name
 * @property {Module[]} dependencies
 * @property {Injector} $injector
 * @property {Map} services
 * @property {function[]} configHooks
 * @property {function[]} runHooks
 */
class Module {

    /**
     * @param {string} name The name of ne module
     * @param {Module[]} dependencies An array of dependencies modules
     */
    constructor(name, dependencies) {
        this._bootstraped = false;

        this.name = name;
        this.dependencies = dependencies;
        this.$injector = new Injector(dependencies);

        this.services = new Map();
        this.configHooks = [];
        this.runHooks = [];

        this.$injector.addModule(this);
    }

    /**
     * @returns {string} The module name
     */
    getName() {
        return this.name;
    }

    /**
     * @param {array | function} injectArray A config hook function
     * @returns {Module} The current module
     */
    config(injectArray) {
        this.configHooks.push(injectArray);
        return this;
    }

    /**
     * @param {array | function } injectArray A run hook function
     * @returns {Module} The current module
     */
    run(injectArray) {
        this.runHooks.push(injectArray);
        return this;
    }

    /**
     * Register a new service in the module
     * @param {string} name the service name
     * @param {function} constructor The service constructor
     * @returns {Module} The current module
     */
    service(name, constructor) {
        let that = this;

        this.services.set(name, {
            provider: function () {
                this.$get = () => {
                    return that.$injector.instantiate(constructor);
                };
            },
            instance: null,
            service: null
        });
        return this;
    }

    /**
     * Register a new service in the module by providing a factory
     * @param {string} name the name of the service
     * @param {array | function} injectArray The function responsible of
     * creating the service instance. This function will be call once
     * when the service instance is required.
     * @returns {Module} The current module
     */
    factory(name, injectArray) {
        this.services.set(name, {
            provider: function () {
                this.$get = injectArray;
            },
            instance: null,
            service: null
        });
        return this;
    }

    /**
     * Register a new service in the module by providing a provider class
     * @param {string} name The service name
     * @param {function} provider A provider constructor
     * @returns {Module} the current module
     */
    provider(name, provider) {
        this.services.set(name, {
            provider: provider,
            instance: null,
            service: null
        });
        return this;
    }

    /**
     * Bootstrap the module.
     * @warning This method must be called once.
     * @returns {Module} the current module
     */
    bootstrap() {
        if (this._bootstraped !== false) {
            throw new Error("A module should be bootstraped only once");
        }
        this._bootstraped = true;
        this._runConfigHooks();
        this._runRunHooks();
        return this;
    }

    /**
     * @returns {Injector} the module injector
     */
    getInjector() {
        return this.$injector;
    }

    /**
     * @param {string} name the service name
     * @returns {*} the service
     */
    _getService(name) {

        if (name.endsWith("Provider")) {
            name = name.substr(0, name.length - "Provider".length);
            return this._getProvider(name);
        }

        let provider = this._getProvider(name);
        if (provider === null) {
            return null;
        }

        let serviceConfig = this.services.get(name);

        if (serviceConfig.service === null) {
            let service = this.$injector.invoke(provider.$get, provider);
            if (service === null || service === undefined) {
                throw new Error("A service cannot be null or undefined");
            }
            serviceConfig.service = service;
        }

        return serviceConfig.service;
    }

    /**
     * @param {string} name the service name
     * @returns {*} The provider of the service
     * @private
     */
    _getProvider(name) {

        if (!this.services.has(name)) {
            return null;
        }

        let serviceConfig = this.services.get(name);

        if (!serviceConfig.instance) {
            serviceConfig.instance = new serviceConfig.provider();
        }

        return serviceConfig.instance;
    }

    /**
     * @return {void}
     * @private
     */
    _runConfigHooks() {
        this.dependencies.forEach((module) => {
            module._runConfigHooks();
        });

        for (let hook of this.configHooks) {
            this.$injector.invoke(hook);
        }
    }

    /**
     * @return {void}
     * @private
     */
    _runRunHooks() {
        this.dependencies.forEach((module) => {
            module._runRunHooks();
        });

        for (let hook of this.runHooks) {
            this.$injector.invoke(hook);
        }
    }

}

module.exports = Module;

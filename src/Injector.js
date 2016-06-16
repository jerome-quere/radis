"use strict";

let _ = require("lodash");

/**
 * @class Injector
 * @property {Map<string, ServiceStore>} services
 */
class Injector {

    /**
     *
     */
    constructor() {
        this.services = new Map();
    }

    /**
     * @param {Injectable} injectable A function to be invoked
     * @param {?object} [self] An object to which the injectable function will be bind to
     * @param {?object} [locales] Additional variables that will be injected into the injectable
     * @return {*} The return value of injectable
     */
    invoke(injectable, self, locales) {
        if (self === undefined || self === null)
            self = this;

        if (locales === undefined || locales === null)
            locales = {};

        if (typeof injectable === "function")
            injectable = Injector._buildInjectArray(injectable);

        let func = injectable.pop();

        let services = _.map(injectable, (serviceName) => this._getService(serviceName, locales));
        return func.apply(self, services);
    }

    /**
     * @param {function(new:Object, ...services)} injectableClass A  injectable class
     * @param {?object} [locales] Additional variables that will be injected
     * @returns {*} A new instance of injectableClass
     */
    instantiate(injectableClass, locales) {

        if (locales === undefined || locales === null)
            locales = {};

        let serviceNames = injectableClass["$inject"] !== undefined ? injectableClass["$inject"] : [];

        let services = _.map(serviceNames, (serviceName) => this._getService(serviceName, locales));

        return new injectableClass(...services);
    }

    /**
     * @param {string} serviceName The name of the service
     * @param {?object} [locales] Additional variables that will be injected
     * @returns {*} The service instance
     * @throws {Error} The service must exist
     * @private
     */
    _getService(serviceName, locales) {

        if (_.has(locales, serviceName))
            return locales[serviceName];

        if (serviceName === "$injector")
            return this;

        if (serviceName.endsWith("Provider"))
            return this._getProvider(serviceName.substr(0, serviceName.length - "Provider".length));

        if (!this.services.has(serviceName))
            throw new Error(`Can't load service with name ${serviceName}`);

        let serviceStore = this.services.get(serviceName);
        let provider = this._getProvider(serviceName);

        if (serviceStore.service === null)
            serviceStore.service = this.invoke(provider.$get, provider);

        if (serviceStore.service === null)
            throw new Error(`The service "${serviceName} cannot be null`);

        return serviceStore.service;
    }

    /**
     * @param {string} serviceName The service name
     * @returns {IProvider} the provider
     * @private
     */
    _getProvider(serviceName) {
        if (!this.services.has(serviceName))
            throw new Error(`Can't load service with name ${name}`);

        let serviceStore = this.services.get(serviceName);
        if (serviceStore.provider === null)
            serviceStore.provider = new serviceStore.providerClass();

        return serviceStore.provider;
    }

    /**
     * Add a service store in the provider
     * @param {string} serviceName The service name
     * @param {ServiceStore} serviceStore The service store
     * @return {Injector} this
     */
    _addServiceStore(serviceName, serviceStore) {
        this.services.set(serviceName, serviceStore);
        return this;
    }

    /**
     * @param {function} func A function
     * @returns {String[]} The list of func parameters name
     * @static
     * @private
     */
    static _buildInjectArray(func) {
        let funcStr = func.toString();
        let match;
        let deps = [];

        if (!(match = funcStr.match(/^\s*[^\(]*\(\s*([^\)]*)\)/m))) {
            throw new Error(`Can't build inject array with ${funcStr}`);
        }

        if (match[1].replace(/ /g, "")) {
            deps = match[1].replace(/ /g, "").split(",");
        }

        deps.push(func);
        return deps;
    }
}

module.exports = Injector;

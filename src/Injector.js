"use strict";

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
     * This method invoke the given injectable applying right parameters based on their name
     * @param {Injectable} injectable A function to be invoked
     * @param {?object} [self] An object to which the injectable function will be bind to
     * @param {?object} [locals] Additional variables that will be injected into the injectable
     * @return {*} The return value of injectable
     */
    invoke(injectable, self, locals) {
        if (self === undefined || self === null)
            self = this;

        if (locals === undefined || locals === null)
            locals = {};

        if (typeof injectable === "function")
            injectable = Injector._buildInjectArray(injectable);

        let func = injectable.pop();

        let services = injectable.map((serviceName) => this._getService(serviceName, locals));
        return func.apply(self, services);
    }

    /**
     * Call new operator on the given injectableClass proving the controller with the right parameters.
     * @info injectableClass.$inject MUST be an array
     * @param {function(new:Object, ...services)} injectableClass A  injectable class
     * @param {?object} [locals] Additional variables that will be injected
     * @returns {*} A new instance of injectableClass
     */
    instantiate(injectableClass, locals) {

        if (locals === undefined || locals === null)
            locals = {};

        let serviceNames = injectableClass["$inject"] !== undefined ? injectableClass["$inject"] : [];

        let services = serviceNames.map((serviceName) => this._getService(serviceName, locals));

        return new injectableClass(...services);
    }

    /**
     * Get a service by name
     * @param {string} serviceName The name of the service you want to get
     * @return {*} the service
     */
    getService(serviceName) {
        return this._getService(serviceName, {});
    }

    /**
     * This method lift a classic function to an injetable function.
     * @exemple
     * let middleware = (service1, req, res, nex) => console.log(service1, req, res, next)
     * let liftedMiddleware = $injector.lift(middleware, ["req", "res", "next"]);
     * app.use(liftedMiddleware) OR  liftedMiddleware(req, res, next(
     * @param {Function} injectable The function you want to lift
     * @param {string[]} localNames the name of the parameter lift will received so they can be injected.
     * @return {Function} The lifted function
     */
    lift(injectable, localNames) {

        if (localNames === undefined || localNames === null)
            localNames = [];

        if (typeof injectable === "function")
            injectable = Injector._buildInjectArray(injectable);

        let func = injectable.pop();

        let that = this;
        return function () {
            let locals = {};
            let args = arguments;
            localNames.forEach((name, index) => {
                locals[name] = args[index];
            });

            let services = injectable.map((serviceName) => that._getService(serviceName, locals));
            return func.apply(this, services);
        };
    }

    /**
     * @param {string} serviceName The name of the service
     * @param {?object} [locals] Additional variables that will be injected
     * @returns {*} The service instance
     * @throws {Error} The service must exist
     * @private
     */
    _getService(serviceName, locals) {

        if (locals[serviceName] !== undefined)
            return locals[serviceName];

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
            throw new Error(`Can't load service with name ${serviceName}`);

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

        if (match[1].replace(/\s/mg, "")) {
            deps = match[1].replace(/\s/mg, "").split(",");
        }

        deps.push(func);
        return deps;
    }
}

module.exports = Injector;

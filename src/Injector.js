"use strict";

let _ = require("lodash");

/**
 * @class Injector
 * @property {Module[]} modules
 */
class Injector {

    /**
     * @param {Module[]} modules An array of modules
     */
    constructor(modules) {
        this.modules = modules.slice();
    }

    /**
     * @param {Module} module The module you want to add
     * @return {Injector} The current injector
     */
    addModule(module) {
        this.modules.unshift(module);
        return this;
    }

    /**
     * @param {array | function} injectArray A function to be invoked
     * @param {object} [self] An object to wich the injectArray function will be bind to
     * @param {object} [locales] Additional variable the will be injected to injectArray
     * @return {*} The return value of injectArray
     */
    invoke(injectArray, self, locales) {
        if (self === undefined) {
            self = this;
        }

        if (locales === undefined) {
            locales = {};
        }

        if (typeof injectArray === "function") {
            injectArray = Injector._buildInjectArray(injectArray);
        }

        let func = injectArray.pop();

        let services = _.map(injectArray, (serviceName) => {
            return this._getService(serviceName, locales);
        });

        return func.apply(self, services);
    }

    /**
     * @param {function} Constructor A valid constructor
     * @param {object} [locales] Aditional varaible that will be injected
     * @returns {*} A new instance of Constructor
     */
    instantiate(Constructor, locales) {

        if (locales === undefined) {
            locales = {};
        }

        let injectArray = [];

        if (Constructor["$inject"] !== undefined) {
            injectArray = Constructor["$inject"];
        }

        let service = _.map(injectArray, (serviceName) => {
            return this._getService(serviceName, locales);
        });

        return new Constructor(...service);
    }

    /**
     * @param {string} name The name of the service
     * @param {object} locales additional variables that can be injected
     * @returns {*} The service to be injected
     * @private
     */
    _getService(name, locales) {
        if (_.has(locales, name)) {
            return locales[name];
        }

        if (name === "$injector") {
            return this;
        }

        for (let module of this.modules) {
            let service = module._getService(name);
            if (service) {
                return service;
            }
        }

        throw new Error(`Can't load service with name ${name}`);
    }

    /**
     * @param {function} func A function
     * @returns {String[]} The list of func parameters name
     * @static
     * @private
     */
    static _buildInjectArray(func) {
        let functionString = func.toString();
        let match;
        let deps = [];

        if (!(match = functionString.match(/^\s*[^\(]*\(\s*([^\)]*)\)/m))) {
            throw new Error(`Can't build inject array with ${functionString}`);
        }

        if (match[1].replace(/ /g, "")) {
            deps = match[1].replace(/ /g, "").split(",");
        }

        deps.push(func);
        return deps;
    }
}

module.exports = Injector;

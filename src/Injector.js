"use strict";

let _ = require('lodash');

class Injector {

    constructor(modules) {
        this.modules = modules.slice();
    }

    addModule(module) {
        this.modules.unshift(module);
    }

    invoke(injectArray, self, locales) {
        if (_.isUndefined(self)) {
            self = this;
        }

        if (_.isUndefined(locales)) {
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

    instantiate(Constructor, locales) {
        let injectArray = [];

        if (_.has(Constructor, '$inject')) {
            injectArray = Constructor.$inject;
        }

        let service = _.map(injectArray, (serviceName) => {
            return this._getService(serviceName, locales);
        });

        return new Constructor(...service);
    }

    _getService(name, locales) {
        if (_.has(locales, name)) {
            return locales[name];
        }

        if (name === '$injector') {
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

    static _buildInjectArray(func) {
        let functionString = func.toString();
        let match;
        let deps = [];

        if (!(match = functionString.match(/^\s*[^\(]*\(\s*([^\)]*)\)/m))) {
            throw new Error(`Can't build inject array with ${functionString}`);
        }

        if (match[1].replace(/ /g, '')) {
            deps = match[1].replace(/ /g, '').split(',');
        }

        deps.push(func);
        return deps;
    }
}

module.exports = Injector;
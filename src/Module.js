"use strict";

let Injector = require('./Injector');

class Module {

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

    getName() {
        return this.name;
    }

    config(injectArray) {
        this.configHooks.push(injectArray);
        return this;
    }

    run(injectArray) {
        this.runHooks.push(injectArray);
        return this;
    }

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
    }

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

    provider(name, provider) {
        this.services.set(name, {
            provider: provider,
            instance: null,
            service: null
        });
    }

    bootstrap() {
        if (this._bootstraped !== false) {
            throw new Error("A module should be bootstraped only once");
        }
        this._bootstraped = true;
        this._runConfigHooks();
        this._runRunHooks();
    }

    getInjector() {
        return this.$injector;
    }

    _getService(name) {

        if (name.endsWith("Provider")) {
            name = name.substr(0, name.length - ("Provider".length));
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
                throw  new Error("a service cannot be null or undefined");
            }
            serviceConfig.service = service;
        }

        return serviceConfig.service;
    }

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

    _runConfigHooks() {
        this.dependencies.forEach((module) => {
            module._runConfigHooks();
        });

        for (let hook of this.configHooks) {
            this.$injector.invoke(hook);
        }
    }

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
"use strict";

let _ = require("lodash");

let Module = require("./Module");

class Core {

    static module(moduleName, dependencies) {
        if (!_.isArray(dependencies)) {
            throw new Error("dependencies sould be an array");
        }
        return new Module(moduleName, dependencies);
    }
}

module.exports = Core;

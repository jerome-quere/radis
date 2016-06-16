"use strict";

let Module = require("./Module");

class Core {

    static module(moduleName, dependencies) {
        if (dependencies === undefined || dependencies === null)
            dependencies = [];

        return new Module(moduleName, dependencies);
    }
}

module.exports = Core;


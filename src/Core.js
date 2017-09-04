"use strict";

const
    Module = require("./Module"),
    utils = require("./utils")
;

class Core {

    static module(moduleName, dependencies) {
        if ( !utils.isModuleName(moduleName) )
            throw new Error(`Invalid module name ${moduleName}. Module must match ${utils.moduleNameRegex.toString()}`);

        if (dependencies === undefined || dependencies === null)
            dependencies = [];

        return new Module(moduleName, dependencies);
    }
}

module.exports = Core;


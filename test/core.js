"use strict";

const
    chai = require("chai"),
    radis = require("../index.js"),
    Module = require("../src/Module.js")
;

describe("Core", function () {
    describe("#module()", function () {

        it("should return the module", function () {
            let module = radis.module("module", []);
            module.should.be.an.instanceof(Module);
            module.getName().should.be.equal("module");
        });

        it("should test the module name", function () {
            chai.expect(() => radis.module("module", [])).to.not.throw();
            chai.expect(() => radis.module("mODu90le1", [])).to.not.throw();
            chai.expect(() => radis.module("_mODu90le1", [])).to.not.throw();
            chai.expect(() => radis.module("fs.ds", [])).to.throw();
            chai.expect(() => radis.module("1ds", [])).to.throw();
            chai.expect(() => radis.module("d:s", [])).to.throw();
        });
    });
});

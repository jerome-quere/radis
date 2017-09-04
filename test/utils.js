"use strict";

let chai = require("chai"),
    expect = chai.expect,
    utils = require("../src/utils")
;

describe("Utils", function () {
    describe("#isArray()", function () {

        it("should test if value is an array", function () {
            expect(utils.isArray([])).to.be.equal(true);
            expect(utils.isArray([1])).to.be.equal(true);
            expect(utils.isArray(new Array(1))).to.be.equal(true);
            expect(utils.isArray("")).to.be.equal(false);
            expect(utils.isArray(42)).to.be.equal(false);
            expect(utils.isArray(/test/)).to.be.equal(false);
            expect(utils.isArray(true)).to.be.equal(false);
            expect(utils.isArray(function (){})).to.be.equal(false);
            expect(utils.isArray({})).to.be.equal(false);
            expect(utils.isArray(new function (){})).to.be.equal(false);
        });
    });

    describe("#isFunction", function () {
        it("should test if value is a function", function () {
            expect(utils.isFunction([])).to.be.equal(false);
            expect(utils.isFunction([1])).to.be.equal(false);
            expect(utils.isFunction(new Array(1))).to.be.equal(false);
            expect(utils.isFunction("")).to.be.equal(false);
            expect(utils.isFunction(42)).to.be.equal(false);
            expect(utils.isFunction(true)).to.be.equal(false);
            expect(utils.isFunction(function (){})).to.be.equal(true);
            expect(utils.isFunction({})).to.be.equal(false);
            expect(utils.isFunction(new function (){})).to.be.equal(false);
        });
    });

    describe("#isString", function () {
        it("should test if value is a string", function () {
            expect(utils.isString([])).to.be.equal(false);
            expect(utils.isString([1])).to.be.equal(false);
            expect(utils.isString(new Array(1))).to.be.equal(false);
            expect(utils.isString("")).to.be.equal(true);
            expect(utils.isString(42)).to.be.equal(false);
            expect(utils.isString(true)).to.be.equal(false);
            expect(utils.isString(function (){})).to.be.equal(false);
            expect(utils.isString({})).to.be.equal(false);
            expect(utils.isString(new function (){})).to.be.equal(false);
        });
    });

    describe("#isInjectable", function () {
        it("should test if value is an Injectable", function () {
            expect(utils.isInjectable(function (){})).to.be.equal(true);
            expect(utils.isInjectable(["s1", function (){}])).to.be.equal(true);
            expect(utils.isInjectable([function (){}])).to.be.equal(true);
            expect(utils.isInjectable([])).to.be.equal(false);
            expect(utils.isInjectable([1])).to.be.equal(false);
            expect(utils.isInjectable("")).to.be.equal(false);
            expect(utils.isInjectable(42)).to.be.equal(false);
            expect(utils.isInjectable(true)).to.be.equal(false);
            expect(utils.isInjectable({})).to.be.equal(false);
            expect(utils.isInjectable(new function (){})).to.be.equal(false);
        });
    });
});

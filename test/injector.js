"use strict";

let chai = require("chai"),
    radis = require("../index.js"),
    Injector = require("../src/Injector.js")
;

describe("Injector", function () {

    it("the injector should be injected at runtine", function () {
        radis.module("module", [])
            .run(($injector) => {
                $injector.should.be.an.instanceof(Injector);
            })
            .bootstrap();

    });

    it("the injector should be injected at config time", function () {
        radis.module("module", [])
            .config(($injector) => {
                $injector.should.be.an.instanceof(Injector);
            })
            .bootstrap();

    });


    it("The injector should work with multiline declaration function", function () {
        radis.module("module", [])
            .factory("s1", () => "s1")
            .factory("s2", () => "s2")
            .factory("s3", () => "s3")
            .run((s1,
                  s2,
                  s3) => {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                s3.should.be.equal("s3");
            })
            .bootstrap();
    });

    describe("getService", function () {

        let module;

        beforeEach(function () {
            module = radis.module("module", [])
                .factory("s1", () => "s1")
                .factory("s2", () => "s2");
        });

        it("Should return the right service", function () {
            module.run(($injector) => {
                $injector.getService("s1").should.be.equal("s1");
                $injector.getService("s2").should.be.equal("s2");
            })
                .bootstrap();
        });

        it("Should throw if service does not exist", function () {
            module.run(($injector) => {
                chai.expect(() => $injector.getService("s3")).to.throw(Error);
            })
                .bootstrap();
        });
    });

    describe("lift", function () {
        let module;
        let $injector;

        beforeEach(function () {
            module = radis.module("module", [])
                .factory("s1", () => "s1")
                .factory("s2", () => "s2")
                .run(["$injector", (s) => $injector = s])
                .bootstrap();
        });

        it("Should return a function", function () {
            $injector.lift(() => null).should.be.an.instanceof(Function);
        });

        it("Should inject all the services", function () {
            let injectable = (s1, s2) => {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
            };
            $injector.lift(injectable)();
        });


        it("Should return a function", function () {
            $injector.lift(() => null, ["local1", "local2"]).should.be.an.instanceof(Function);
        });

        it("Should inject all the services and locals", function () {
            let injectable = (s1, local1, s2, local2) => {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                local1.should.be.equal("local1");
                local2.should.be.equal("local2");
            };
            $injector.lift(injectable, ["local1", "local2"])("local1", "local2");
        });

    });
});

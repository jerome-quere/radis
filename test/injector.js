"use strict";

let chai = require("chai"),
    radis = require("../index.js"),
    Injector = require("../src/Injector.js")
;
chai.should();

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


    it("The injector should parse all kind of function declaration", function () {
        radis.module("module", [])
            .factory("s1", () => "s1")
            .factory("s2", () => "s2")
            .run(function (s1) { s1.should.be.equal("s1"); })
            .run(function (/* Comment */s1/* Comment */) { s1.should.be.equal("s1"); })
            .run(function (
                s1,
                s2
            ) {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
            })
            .run((s1) => { s1.should.be.equal("s1"); })
            .run((/* Comment */s1/* Comment */) => { s1.should.be.equal("s1"); })
            .run((
                s1,
                s2
            ) => {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
            })
            .run(s1 => s1.should.be.equal("s1"))
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

    describe("#invoke", function () {
        let module;
        let $injector;

        class Service3 {
            constructor() { this.a = 42; }
            // noinspection JSUnusedGlobalSymbols
            getValue() { return this.a; }
            // noinspection JSUnusedGlobalSymbols
            addLocale(local1) { return this.a + local1; }
            // noinspection JSUnusedGlobalSymbols
            addService(s1) { return this.a + s1; }
        }

        beforeEach(function () {
            module = radis.module("module", [])
                .factory("s1", () => "s1")
                .factory("s2", () => "s2")
                .service("s3", Service3)
                .run(["$injector", (s) => $injector = s])
                .bootstrap();
        });

        it("Should inject services", function () {
            let injectable = function (s1, s2) {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
            };
            $injector.invoke(injectable);
        });

        it("Should inject self", function () {
            let self = { a: 42 };
            let injectable = function (s1, s2) {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                this.a.should.be.equal(42);
            };
            $injector.invoke(injectable, self);
        });

        it("Should inject locale", function () {
            let injectable = function (s1, s2, local1) {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                local1.should.be.equal("local1");
            };
            $injector.invoke(injectable, null, {local1: "local1"});
        });

        it("Should invoke service method", function () {
            $injector.invoke("s3:getValue").should.be.equal(42);
            $injector.invoke("s3:addLocale", null, {local1: 5}).should.be.equal(47);
            $injector.invoke("s3:addService").should.be.equal("42s1");
        });
    });

    describe("#lift", function () {
        let module;
        let $injector;

        class Service3 {
            constructor() { this.a = 42; }
            // noinspection JSUnusedGlobalSymbols
            getValue() { return this.a; }
            // noinspection JSUnusedGlobalSymbols
            addLocale(local1) { return this.a + local1; }
            // noinspection JSUnusedGlobalSymbols
            addService(s1) { return this.a + s1; }
        }

        beforeEach(function () {
            module = radis.module("module", [])
                .factory("s1", () => "s1")
                .factory("s2", () => "s2")
                .service("s3", Service3)
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

        it("Should lift an injectable array", function () {
            $injector.lift(["s1", (test) => test.should.be.equal("s1")])();
        });

        it("Should inject all the services, params and locale", function () {
            let injectable = (s1, param1, s2, param2, local1, local2) => {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                param1.should.be.equal("param1");
                param2.should.be.equal("param2");
                local1.should.be.equal("local1");
                local2.should.be.equal("local2");
            };
            $injector.lift(injectable, ["param1", "param2"], {local1: "local1", local2: "local2"})("param1", "param2");
        });

        it("Should bind to correct self", function () {
            let self = { a: 42 };
            let injectable = function (s1, s2) {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                this.a.should.be.equal(42);
            };
            $injector.lift(injectable, self)();
        });

        it("Should bind to correct self with params and locals", function () {
            let self = { a: 42 };
            let injectable = function (s1, param1, s2, param2, local1, local2) {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                param1.should.be.equal("param1");
                param2.should.be.equal("param2");
                local1.should.be.equal("local1");
                local2.should.be.equal("local2");
                this.a.should.be.equal(42);
            };
            $injector.lift(injectable, self, ["param1", "param2"], {local1: "local1", local2: "local2"})("param1", "param2");
        });

        it("Should invoke service method", function () {
            $injector.lift("s3:getValue")().should.be.equal(42);
            $injector.lift("s3:addLocale", null, [], {local1: 5})().should.be.equal(47);
            $injector.lift("s3:addLocale", null, ["local1"])(10).should.be.equal(52);
            $injector.lift("s3:addService")().should.be.equal("42s1");
            chai.expect(() => $injector.lift("s1:getValue")()).to.throw(Error);
        });

        it("Should cache correctly", function () {
            let fn = $injector.lift("s3:getValue");
            fn().should.be.equal(42);
            fn().should.be.equal(42);
        });
    });
});

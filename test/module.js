"use strict";

let chai = require("chai"),
    radis = require("../index.js"),
    Module = require("../src/Module.js")
;


describe("Module", function () {
    describe("#bootstrap()", function () {
        this.timeout(1000);
        it("should be called", function () {
            let module = radis.module("module", []);
            module.bootstrap();
        });
    });


    describe("#service()", function () {
        this.timeout(1000);
        it("should be injected", function () {

            class Service1 {
            }
            class Service2 {
            }
            class Service3 {
            }

            let module = radis.module("module", [])
                .service("s1", Service1)
                .service("s2", Service2)
                .service("s3", Service3)
                .run(function (s1, s2, s3) {
                    s1.should.be.an.instanceof(Service1);
                    s2.should.be.an.instanceof(Service2);
                    s3.should.be.an.instanceof(Service3);
                });
            module.bootstrap();
        });
        it("should be injected with $name", function () {

            class Service1 {
                static get $inject() { return ["$name"]; }
                constructor($name) {
                    this.$name = $name;
                }
            }

            radis.module("module", [])
                .service("s1", Service1)
                .run(function (s1) {
                    s1.$name.should.be.equal("s1");
                })
                .bootstrap()
            ;
        });
        it("should check params", function () {
            chai.expect(() => radis.module("module", []).service("s1", function () {})).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).service("s1", undefined)).to.throw(Error);
            chai.expect(() => radis.module("module", []).service("s1", null)).to.throw(Error);
            chai.expect(() => radis.module("module", []).service("s1", [])).to.throw(Error);
            chai.expect(() => radis.module("module", []).service("s1", "")).to.throw(Error);
            chai.expect(() => radis.module("module", []).service("s1", 42)).to.throw(Error);
            chai.expect(() => radis.module("module", []).service("2$1", function () {})).to.throw(Error);
            chai.expect(() => radis.module("module", []).service("a.s", function () {})).to.throw(Error);
            chai.expect(() => radis.module("module", []).service("a:a", function () {})).to.throw(Error);
        });
    });

    describe("#factory()", function () {
        this.timeout(1000);
        it("should be injected", function () {
            let module = radis.module("module", []);

            class Service1 {
            }
            class Service2 {
            }
            class Service3 {
            }

            module.factory("service1", () => new Service1());
            module.factory("service2", () => new Service2());
            module.factory("service3", () => new Service3());
            module.run(function (service1, service2, service3) {
                service1.should.be.an.instanceof(Service1);
                service2.should.be.an.instanceof(Service2);
                service3.should.be.an.instanceof(Service3);
            });
            module.bootstrap();
        });
        it("should be injected with $name", function () {

            radis.module("module", [])
                .factory("s1", ($name) => $name)
                .run(function (s1) {
                    s1.should.be.equal("s1");
                })
                .bootstrap()
            ;
        });
        it("should check params", function () {
            chai.expect(() => radis.module("module", []).factory("s1", [function () {}])).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).factory("s1", function () {})).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).factory("s1", undefined)).to.throw(Error);
            chai.expect(() => radis.module("module", []).factory("s1", null)).to.throw(Error);
            chai.expect(() => radis.module("module", []).factory("s1", "")).to.throw(Error);
            chai.expect(() => radis.module("module", []).factory("s1", 42)).to.throw(Error);
            chai.expect(() => radis.module("module", []).factory("2$1", function () {})).to.throw(Error);
            chai.expect(() => radis.module("module", []).factory("a.s", function () {})).to.throw(Error);
            chai.expect(() => radis.module("module", []).factory("a:a", function () {})).to.throw(Error);

        });
    });

    describe("#provider()", function () {
        this.timeout(1000);
        it("should be injected", function () {
            let module = radis.module("module", []);

            function Service1Provider() {
                this.$get = () => "s1";
            }

            function Service2Provider() {
                this.$get = () => "s2";
            }

            function Service3Provider() {
                this.$get = () => "s3";
            }

            module.provider("service1", Service1Provider);
            module.provider("service2", Service2Provider);
            module.provider("service3", Service3Provider);
            module.run(function (service1, service2, service3) {
                service1.should.be.equal("s1");
                service2.should.be.equal("s2");
                service3.should.be.equal("s3");
            });
            module.bootstrap();
        });
        it("should receive the $injector as first constructor parameter", function () {
            let m1 = radis.module("m1", []);
            let m2 = radis.module("m2", []);
            let m3 = radis.module("m3", [m1, m2]);

            function Service1Provider($injector) {
                this.$get = () => $injector;
            }

            function Service2Provider($injector) {
                this.$get = () => $injector;
            }

            m1.provider("s1", Service1Provider);
            m2.provider("s2", Service2Provider);
            m1.run(($injector, s1) => s1.should.be.equal($injector));
            m2.run(($injector, s2) => s2.should.be.equal($injector));
            m3.bootstrap();
        });
        it("should receive $name as second constructor parameter", function () {
            let m1 = radis.module("m1", []);
            let m2 = radis.module("m2", []);
            let m3 = radis.module("m3", [m1, m2]);

            // noinspection JSUnusedLocalSymbols
            function Service1Provider($injector, $name) {
                this.$get = () => $name;
            }

            // noinspection JSUnusedLocalSymbols
            function Service2Provider($injector, $name) {
                this.$get = () => $name;
            }

            m1.provider("s1", Service1Provider);
            m2.provider("s2", Service2Provider);
            m1.run((s1) => s1.should.be.equal("s1"));
            m2.run((s2) => s2.should.be.equal("s2"));
            m3.bootstrap();
        });
        it("$get should receive $name as parameter", function () {
            let module = radis.module("m1", []);

            function Service1Provider() {
                this.$get = ($name) => $name;
            }

            module.provider("s1", Service1Provider);
            module.run((s1) => s1.should.be.equal("s1"));
            module.bootstrap();
        });
        it("should check params", function () {
            chai.expect(() => radis.module("module", []).provider("s1", function () {})).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).provider("s1", undefined)).to.throw(Error);
            chai.expect(() => radis.module("module", []).provider("s1", null)).to.throw(Error);
            chai.expect(() => radis.module("module", []).provider("s1", "")).to.throw(Error);
            chai.expect(() => radis.module("module", []).provider("s1", [])).to.throw(Error);
            chai.expect(() => radis.module("module", []).provider("s1", 42)).to.throw(Error);
            chai.expect(() => radis.module("module", []).provider("2$1", function () {})).to.throw(Error);
            chai.expect(() => radis.module("module", []).provider("a.s", function () {})).to.throw(Error);
            chai.expect(() => radis.module("module", []).provider("a:a", function () {})).to.throw(Error);
        });
    });

    describe("#config()", function () {

        it("should call config with the provider", function () {
            let module = radis.module("module", []);

            class Service1Provider {
                setString(string) {
                    this.string = string;
                }

                $get() {
                    return this.string;
                }
            }

            module.provider("service1", Service1Provider);

            module.config(function (service1Provider) {
                service1Provider.setString("value");
            });

            module.run(function (service1) {
                service1.should.be.equal("value");
            });

            module.bootstrap();
        });

        it("should check params", function () {
            chai.expect(() => radis.module("module", []).config(function () {})).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).config([function () {}])).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).config(undefined)).to.throw(Error);
            chai.expect(() => radis.module("module", []).config(null)).to.throw(Error);
            chai.expect(() => radis.module("module", []).config()).to.throw(Error);
            chai.expect(() => radis.module("module", []).config([])).to.throw(Error);
            chai.expect(() => radis.module("module", []).config(42)).to.throw(Error);
        });
    });

    describe("#run()", function () {
        it("should check params", function () {
            chai.expect(() => radis.module("module", []).run(function () {})).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).run([function () {}])).to.not.throw(Error);
            chai.expect(() => radis.module("module", []).run(undefined)).to.throw(Error);
            chai.expect(() => radis.module("module", []).run(null)).to.throw(Error);
            chai.expect(() => radis.module("module", []).run()).to.throw(Error);
            chai.expect(() => radis.module("module", []).run([])).to.throw(Error);
            chai.expect(() => radis.module("module", []).run(42)).to.throw(Error);
        });
    });
});

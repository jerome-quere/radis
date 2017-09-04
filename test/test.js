"use strict";

let chai = require("chai"),
    expect = chai.expect,
    radis = require("../index.js"),
    Module = require("../src/Module.js"),
    Injector = require("../src/Injector.js");

chai.should();

describe("Core", function () {
    describe("#module()", function () {

        it("should return the module", function () {
            let module = radis.module("module", []);
            module.should.be.an.instanceof(Module);
            module.getName().should.be.equal("module");
        });
    });
});

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
    });
});

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
                expect(() => $injector.getService("s3")).to.throw(Error);
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
                .run(['$injector', (s) => $injector = s])
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

describe("ModuleDependencies", function () {
    describe("Simple dependency", function () {
        it("should get the dependency service", function () {
            let m1 = radis.module("m1", []).factory("s1", () => "s1");
            let m2 = radis.module("m2", [m1]).factory("s2", () => "s2");
            let m3 = radis.module("m3", [m2]).factory("s3", () => "s3");

            m2.run((s1, s2) => {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
            });

            m3.run((s1, s2, s3) => {
                s1.should.be.equal("s1");
                s2.should.be.equal("s2");
                s3.should.be.equal("s3");
            });

            m3.bootstrap();
        });

        it("should override the child dependency", function () {
            let m1 = radis.module("m1", []).factory("service", () => "s1");
            let m2 = radis.module("m2", [m1]).factory("service", () => "s2");
            let m3 = radis.module("m3", [m2, m1]).factory("service", () => "s3");

            m1.run((service) => service.should.be.equal("s1"));
            m2.run((service) => service.should.be.equal("s2"));
            m3.run((service) => service.should.be.equal("s3"));

            m3.bootstrap();
        });

        it("should get the closest child dependency", function () {
            let m1 = radis.module("m1", []).factory("service", () => "s1");
            let m2 = radis.module("m2", [m1]).factory("service", () => "s2");
            let m3 = radis.module("m3", [m2]);

            m3.run((service) => service.should.be.equal("s2"));
            m3.bootstrap();
        });

        it("should call dependency first", function () {
            let m1 = radis.module("m1", []).factory("s1", () => "s1");
            let m2 = radis.module("m2", [m1]).factory("s2", () => "s2");

            let count = 0;

            m1.config((s1Provider) => expect(count++).to.be.equal(0));
            m1.run((s1) => expect(count++).to.be.equal(2));

            m2.config((s2Provider) => expect(count++).to.be.equal(1));
            m2.run((s2) => expect(count++).to.be.equal(3));

            m2.bootstrap();
        });


        it("should get a shared instance", function () {
            let m1 = radis.module("m1").factory("s", () => ({v: 0}));
            let m2 = radis.module("m2", [m1]);
            let m3 = radis.module("m2", [m1]);
            let m4 = radis.module("m2", [m2, m3]);

            m1.run((s) => expect(s.v++).to.be.equal(0));
            m2.run((s) => expect(s.v++).to.be.equal(1));
            m3.run((s) => expect(s.v++).to.be.equal(2));
            m4.run((s) => expect(s.v++).to.be.equal(3));

            m4.bootstrap();
        });

        it("should be call in the right order", function () {
            let count = 0;

            let m1 = radis.module("m1").factory("s", () => {
                expect(count++).to.be.equal(4);
            });
            let m2 = radis.module("m2", [m1]);
            let m3 = radis.module("m2", [m1]);
            let m4 = radis.module("m2", [m2, m3]);

            m1.config((sProvider) => expect(count++).to.be.equal(0));
            m2.config((sProvider) => expect(count++).to.be.equal(1));
            m3.config((sProvider) => expect(count++).to.be.equal(2));
            m4.config((sProvider) => expect(count++).to.be.equal(3));

            m1.run((s) => expect(count++).to.be.equal(5));
            m2.run((s) => expect(count++).to.be.equal(6));
            m3.run((s) => expect(count++).to.be.equal(7));
            m4.run((s) => expect(count++).to.be.equal(8));

            m4.bootstrap();
        });
    });
});


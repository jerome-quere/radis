"use strict";

let chai = require("chai"),
    radis = require("../index.js")
;

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

            m1.config((s1Provider) => chai.expect(count++).to.be.equal(0));
            m1.run((s1) => chai.expect(count++).to.be.equal(2));

            m2.config((s2Provider) => chai.expect(count++).to.be.equal(1));
            m2.run((s2) => chai.expect(count++).to.be.equal(3));

            m2.bootstrap();
        });


        it("should get a shared instance", function () {
            let m1 = radis.module("m1").factory("s", () => ({v: 0}));
            let m2 = radis.module("m2", [m1]);
            let m3 = radis.module("m2", [m1]);
            let m4 = radis.module("m2", [m2, m3]);

            m1.run((s) => chai.expect(s.v++).to.be.equal(0));
            m2.run((s) => chai.expect(s.v++).to.be.equal(1));
            m3.run((s) => chai.expect(s.v++).to.be.equal(2));
            m4.run((s) => chai.expect(s.v++).to.be.equal(3));

            m4.bootstrap();
        });

        it("should be call in the right order", function () {
            let count = 0;

            let m1 = radis.module("m1").factory("s", () => {
                chai.expect(count++).to.be.equal(4);
            });
            let m2 = radis.module("m2", [m1]);
            let m3 = radis.module("m2", [m1]);
            let m4 = radis.module("m2", [m2, m3]);

            m1.config((sProvider) => chai.expect(count++).to.be.equal(0));
            m2.config((sProvider) => chai.expect(count++).to.be.equal(1));
            m3.config((sProvider) => chai.expect(count++).to.be.equal(2));
            m4.config((sProvider) => chai.expect(count++).to.be.equal(3));

            m1.run((s) => chai.expect(count++).to.be.equal(5));
            m2.run((s) => chai.expect(count++).to.be.equal(6));
            m3.run((s) => chai.expect(count++).to.be.equal(7));
            m4.run((s) => chai.expect(count++).to.be.equal(8));

            m4.bootstrap();
        });
    });
});

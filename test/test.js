"use strict";

let chai = require('chai'),
    expect = chai.expect,
    radis = require('../index.js'),
    Module = require('../src/Module.js'),
    Injector = require('../src/Injector.js');

chai.should();

describe('Core', function () {
    describe('#module()', function () {

        it('should return the module', function () {
            let module = radis.module('module', []);
            module.should.be.an.instanceof(Module);
            module.getName().should.be.equal("module");
        });

        it('should throw', function () {
            expect(() => radis.module('inexistant')).to.throw();
        });
    });
});

describe('Module', function () {
    describe('#bootstrap()', function () {
        this.timeout(1000);
        it('should be called', function () {
            let module = radis.module('module', []);
            module.bootstrap();
        });

        it('should be called once', function () {
            let module = radis.module('module', []);
            module.bootstrap();
            expect(() => module.bootstrap()).to.throw();
        });
    });


    describe('#service()', function () {
        this.timeout(1000);
        it('should be injected', function () {
            let module = radis.module('module', []);

            class Service1 {
            }
            class Service2 {
            }
            class Service3 {
            }

            module.service('service1', Service1);
            module.service('service2', Service2);
            module.service('service3', Service3);
            module.run(function (service1, service2, service3) {
                service1.should.be.an.instanceof(Service1);
                service2.should.be.an.instanceof(Service2);
                service3.should.be.an.instanceof(Service3);
            });
            module.bootstrap();
        });
    });

    describe('#factory()', function () {
        this.timeout(1000);
        it('should be injected', function () {
            let module = radis.module('module', []);

            class Service1 {
            }
            class Service2 {
            }
            class Service3 {
            }

            module.factory('service1', () => new Service1());
            module.factory('service2', () => new Service2());
            module.factory('service3', () => new Service3());
            module.run(function (service1, service2, service3) {
                service1.should.be.an.instanceof(Service1);
                service2.should.be.an.instanceof(Service2);
                service3.should.be.an.instanceof(Service3);
            });
            module.bootstrap();
        });
    });

    describe('#provider()', function () {
        this.timeout(1000);
        it('should be injected', function () {
            let module = radis.module('module', []);

            class Service1 {
            }
            class Service2 {
            }
            class Service3 {
            }

            class Service1Provider {
                $get() {
                    return new Service1();
                }
            }

            class Service2Provider {
                $get() {
                    return new Service2();
                }
            }

            class Service3Provider {
                $get() {
                    return new Service3();
                }
            }

            module.provider('service1', Service1Provider);
            module.provider('service2', Service2Provider);
            module.provider('service3', Service3Provider);
            module.run(function (service1, service2, service3) {
                service1.should.be.an.instanceof(Service1);
                service2.should.be.an.instanceof(Service2);
                service3.should.be.an.instanceof(Service3);
            });
            module.bootstrap();
        });
    });

    describe('#config()', function () {
        let module = radis.module('module', []);

        class Service1Provider {
            setString(string) {
                this.string = string;
            }

            $get() {
                return this.string;
            }
        }

        module.provider('service1', Service1Provider);

        module.config(function (service1Provider) {
            service1Provider.setString('value');
        });

        module.run(function (service1) {
            service1.should.be.equal('value');
        });

        module.bootstrap();
    });

    describe("#getInjector()", function () {
        it("shoul return the injector", function () {
            let module = radis.module('module', []);
            module.getInjector().should.be.an.instanceof(Injector);
        });
    });
});


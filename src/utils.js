"use strict";

/**
 * The module name RegExp
 * @type {RegExp}
 */
const moduleNameRegex = /^[a-zA-Z_][a-zA-Z0-9_-]*$/;

/**
 * The service name RegExp
 * @type {RegExp}
 */
const serviceNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * The service method name RegExp
 * @type {RegExp}
 */
const serviceMethodNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*:[^:]+$/;

/**
 * Test if value is an array
 * @param  {*} value the value you want to test
 * @return {boolean} True is value is an array
 */
function isArray( value ) {
    return Array.isArray(value);
}

/**
 * Test if value is a string
 * @param  {*} value the value you want to test
 * @return {boolean} True is value is a string
 */
function isString( value ) {
    return typeof value === "string";
}

/**
 * Test if value is a function
 * @param  {*} value the value you want to test
 * @return {boolean} True is value is a function
 */
function isFunction( value ) {
    return !!(value && value.constructor && value.call && value.apply);
}


/**
 * Test if value is an Injectable
 * @param  {*} value the value you want to test
 * @return {boolean} True is value is an injectable
 */
function isInjectable( value ) {
    return isFunction(value) || isArray(value) && isFunction(value[value.length - 1]);
}

/**
 * Test if value is a valid module name
 * @param  {*} name the value you want to test
 * @return {boolean} True is value is a valid module name
 */
function isModuleName( name ) {
    return moduleNameRegex.test(name);
}

/**
 * Test if value is a valid service name
 * @param  {*} name the value you want to test
 * @return {boolean} True is value is a valid service name
 */
function isServiceName( name ) {
    return serviceNameRegex.test(name);
}


module.exports = {
    isArray: isArray,
    isFunction: isFunction,
    isString: isString,
    isInjectable: isInjectable,
    isModuleName: isModuleName,
    isServiceName: isServiceName,
    moduleNameRegex: moduleNameRegex,
    serviceNameRegex: serviceNameRegex,
    serviceMethodNameRegex: serviceMethodNameRegex
};

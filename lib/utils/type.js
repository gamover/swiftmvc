/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 20.03.13
 * Time: 11:18
 */

var $util = require('util');

exports.isObject = function (obj) { return (Object.prototype.toString.call(obj) === '[object Object]'); };
exports.isArray = function (arr) { return $util.isArray(arr) };
exports.isRegExp = function (arr) { return $util.isRegExp(arr) };
exports.isDate = function (arr) { return $util.isDate(arr) };
exports.isError = function (arr) { return $util.isError(arr) };
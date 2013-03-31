/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 20.03.13
 * Time: 11:18
 */

var $util = require('util');

exports.isObject = function isObject (obj) { return (Object.prototype.toString.call(obj) === '[object Object]'); };
exports.isArray  = function isArray (obj) { return $util.isArray(obj) };
exports.isRegExp = function isRegExp (obj) { return $util.isRegExp(obj) };
exports.isDate   = function isDate (obj) { return $util.isDate(obj) };
exports.isError  = function isError (obj) { return $util.isError(obj) };
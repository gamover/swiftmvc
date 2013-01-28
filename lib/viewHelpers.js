/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 12:17
 */

var _fs = require('fs'),

    UrlHelper = require('./helpers/url').UrlHelper;

var __viewHelpers = module.exports = exports;

__viewHelpers.ViewHelpers = function (config)
{
    var self = this,

        routes = JSON.parse(_fs.readFileSync(config.path.config + '/routes.json', 'UTF-8'));

    this.url = new UrlHelper(routes).resolve;
};
/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 12:17
 *
 * Набор помощников видов Swift.
 */

var __viewHelpers = module.exports = exports,

    _fs = require('fs'),

    UrlHelper = require('./helpers/url').UrlHelper;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

__viewHelpers.ViewHelpers = function ()
{
    var self = this,

        urlHelper = new UrlHelper();


    self.url = urlHelper.resolve;

    self.setRoutes = urlHelper.setRoutes;
};
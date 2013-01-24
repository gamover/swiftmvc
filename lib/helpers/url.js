/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 25.12.12
 * Time: 17:17
 */

var _config = require('../config'),
    routePath = '';

exports.init = function (rPath)
{
    routePath = rPath;
};

exports.url = function (routeAlias, params, isRegexp)
{
    var routes = require(routePath);

    if (!routes[routeAlias])
    {
        return null;
    }

    params = params || {};
    isRegexp = !!isRegexp;

    var path = routes[routeAlias].path;

    path = path.replace('?', '');

    for (var key in params)
    {
        var val = params[key];

        path = path.replace(':' + key, val);
    }

    return path;
};
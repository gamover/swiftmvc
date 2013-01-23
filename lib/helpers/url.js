/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 25.12.12
 * Time: 17:17
 */

var _config = require('../config'),
    _routes = require(_config.path.config + '/routes');

exports.url = function (routeAlias, params)
{
    if (!_routes[routeAlias])
    {
        return null;
    }

    var path = _routes[routeAlias].path,
        params = params || {};

    for (var key in params)
    {
        var val = params[key];

        path = path.replace('?', '').replace(':' + key, val);
    }

    return path;
};
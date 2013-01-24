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

/**
 * Восстановление url по псевдониму
 *
 * @param alias псевдоним маршрута
 * @param params параметры для подстановки
 *
 * @return {*}
 */
exports.url = function (alias, params)
{
    var routes = require(routePath),
        isRegexp = typeof routes[alias].path === 'object';

    if (!routes[alias])
    {
        return '';
    }

    params = params || {};

    var path, regexp;
    if (isRegexp)
    {
        regexp = routes[alias].path;
        path = routes[alias]._path;
    }
    else
    {
        path = routes[alias].path;
    }console.log(typeof routes[alias].path);

    path = path.replace('?', '');

    for (var key in params)
    {
        var val = params[key];

        path = path.replace(':' + key, val);
    }

    if (isRegexp && !path.match(regexp))
    {
        return '';
    }

    return path;
};
/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 25.12.12
 * Time: 17:17
 */

var config = {};

var __url = module.exports = exports = function (conf)
{
    config = conf;
};

/**
 * Восстановление url по псевдониму
 *
 * @param alias псевдоним маршрута
 * @param params параметры для подстановки
 *
 * @return {*}
 */
__url.url = function (alias, params)
{
    var routes = require(config.path.config + '/routes'),
        isRegexp = routes[alias]._path !== undefined;

    if (!routes[alias])
    {
        return '';
    }

    params = params || {};

    var path, regexp;
    if (isRegexp)
    {
        regexp = new RegExp(routes[alias].path);
        path = routes[alias]._path;
    }
    else
    {
        path = routes[alias].path;
    }

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
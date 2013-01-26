/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 25.12.12
 * Time: 17:17
 */

var _fs = require('fs'),

    config = {},
    routes = {};

var __url = module.exports = exports = function (config_)
{
    config = config_;
    routes = JSON.parse(_fs.readFileSync(config.path.config + '/routes.json', 'UTF-8'));
};

/**
 * Восстановление url по псевдониму
 *
 * @param alias псевдоним маршрута
 * @param params параметры для подстановки
 * @return {*} объект маршрутов
 *
 * @param routes_
 */
__url.resolve = function (alias, params, routes_)
{
    routes_ = routes_ || routes;

    var route = routes_[alias];
    if (route === undefined)
    {
        return '';
    }

    if (route.isRegexp === undefined)
    {
        route.isRegexp = route._path !== undefined;
    }

    route._path = route._path || route.path;

    params = params || {};

    var path = route._path.replace('?', '');

    for (var key in params)
    {
        var val = params[key];

        path = path.replace(':' + key, val);
    }

    if (route.isRegexp && !path.match(new RegExp(route.path)))
    {
        return '';
    }

    return path;
};
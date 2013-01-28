/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 25.12.12
 * Time: 17:17
 */

var _fs = require('fs');

var __urlHelper = module.exports = exports;

__urlHelper.UrlHelper = function (routes)
{
    var self = this;

    /**
     * Задание объетка маршрутов
     *
     * @param routes_
     */
    self.setRoutes = function (routes_)
    {
        routes = routes_;
    };

    /**
     * Получение объекта маршрутов
     *
     * @returns {*}
     */
    self.getRoutes = function ()
    {
        return routes;
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
    self.resolve = function (alias, params, routes_)
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
};
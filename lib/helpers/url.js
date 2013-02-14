/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 25.12.12
 * Time: 17:17
 *
 * Помощник ссылок.
 *
 * Структура маршрутов (routes):
 *  {
 *      'routeAlias1': {
 *          'path': '',
 *          '_path': '',
 *          'module': 'moduleName',
 *          'controller': 'controllerName',
 *          'action': 'actionName'
 *      },
 *      ...
 *      'routeAliasN': {
 *          ...
 *      }
 *  }
 */

var _fs = require('fs'),

    routesGlobal = {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.UrlHelper = function (routes)
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
     * @returns {Object}
     */
    self.getRoutes = function ()
    {
        return routes;
    };

    /**
     * Восстановление url по псевдониму
     *
     * @param {String} alias псевдоним маршрута
     * @param {Object} params параметры для подстановки
     * @param {Object} routes_ маршруты
     *
     * @return {String} объект маршрутов
     */
    self.resolve = function (alias, params, routes_)
    {
        routes_ = routes_ || routes || routesGlobal;

        var route = routes_[alias];

        if (route === undefined) return '';

        route.isRegexp = route.isRegexp || (route._path !== undefined);
        route._path = route._path || route.path;

        params = params || {};

        var path = route._path.replace('?', '');

        for (var key in params) path = path.replace(':' + key, params[key]);

        if (route.isRegexp && !path.match(new RegExp(route.path))) return '';

        return path;
    };
};

/**
 * Задание маршрутов
 *
 * @param {Object} routes
 *
 * @returns {Object}
 */
exports.setRoutes = function (routes)
{
    routesGlobal = routes;

    return exports;
};
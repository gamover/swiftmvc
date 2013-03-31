/**
 * Author: G@mOBEP
 * Date: 03.02.13
 * Time: 15:12
 *
 * Маршрутизатор Swift.
 */

var $fs = require('fs'),
    $path = require('path'),

    fsUtil = require('../utils/fs'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = Router;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Router ()
{
    /**
     * Путь к директории подключаемых маршрутов
     *
     * @type {String}
     * @private
     */
    this._pathToRequireRoutesDir = null;

    /**
     * Объект запроса
     *
     * @type {Object}
     * @private
     */
    this._req = null;

    /**
     * Объект ответа
     *
     * @type {Object}
     * @private
     */
    this._res = null;

    /**
     * Функция продолжения обработки запроса
     *
     * @type {Function}
     * @private
     */
    this._next = null;

    /**
     * Прослойки
     *
     * @type {Array}
     * @private
     */
    this._uses = [];

    /**
     * Маршруты (объект вида:
     *    {
     *        'routeAlias1': {
     *            'path': '',
     *            '_path': '',
     *            'module': 'moduleName',
     *            'controller': 'controllerName',
     *            'action': 'actionName'
     *        },
     *        ...
     *        'routeAliasN': {
     *            ...
     *        }
     *    }
     * )
     *
     * @type {Object}
     * @private
     */
    this._routes = {};
}

/**
 * Задание пути к директории подключаемых маршрутов
 *
 * @param {String} pathToRequireRoutesDir
 *
 * @returns {Router}
 */
Router.prototype.setPathToRequireRoutesDir = function setPathToRequireRoutesDir (pathToRequireRoutesDir)
{
    this._pathToRequireRoutesDir = $path.normalize(pathToRequireRoutesDir);

    return this;
};

/**
 * Получение пути к директории подключаемых маршрутов
 *
 * @returns {String}
 */
Router.prototype.getPathToRequireRoutesDir = function getPathToRequireRoutesDir ()
{
    return this._pathToRequireRoutesDir;
};

/**
 * Получение объекта запроса
 *
 * @returns {Object}
 */
Router.prototype.getRequest = function getRequest ()
{
    return this._req;
};

/**
 * Получение объекта ответа
 *
 * @returns {Object}
 */
Router.prototype.getResponse = function getResponse ()
{
    return this._res;
};

/**
 * Получение функции продолжения обработки запроса
 *
 * @returns {Function}
 */
Router.prototype.getNext = function getNext ()
{
    return this._next;
};

/**
 * Добавление middleware
 *
 * @param {Function} middle
 *
 * @returns {Router}
 */
Router.prototype.use = function use (middle)
{
    if (typeof middle === 'function') this._uses.push(middle);

    return this;
};

/**
 * Задание маршрутов
 *
 * @param {Object} routes
 *
 * @returns {Router}
 */
Router.prototype.setRoutes = function setRoutes (routes)
{
    this._routes = routes;

    return this;
};

/**
 * Добавление маршрута
 *
 * @param {String} alias псевдоним маршрута
 * @param {Object} route параметры маршрута
 *
 * @returns {Router}
 */
Router.prototype.addRoute = function addRoute (alias, route)
{
    if (this._routes[alias]) return this;

    this._routes[alias] = {};
    this._routes[alias].path = route.path;
    if (route._path) this._routes[alias]._path = route._path;
    this._routes[alias].module = route.module || 'index';
    this._routes[alias].controller = route.controller || 'index';
    this._routes[alias].action = route.action || 'index';

    return this;
};

/**
 * Компиляция маршрутов
 *
 * @param {Object} routes маршруты
 *
 * @returns {Router}
 */
Router.prototype.compile = function compile (routes)
{
    var self = this;

    (function compile (routes, pathToRequireRoutesDir)
    {
        for (var key in routes)
        {
            if (!routes.hasOwnProperty(key)) continue;

            if (key !== '$require') self.addRoute(key, routes[key]);
            else if (pathToRequireRoutesDir)
            {
                var requirePath = routes[key];

                if (!requirePath instanceof Array) requirePath = [requirePath];

                requirePath.forEach(function (requirePath)
                {
                    var extname = $path.extname(requirePath),
                        ext = extname,
                        pathToRequireRoutesFile,
                        requireRoutes;

                    if (!extname) ext = extname = '.json';
                    else extname = '';

                    pathToRequireRoutesFile = $path.normalize(pathToRequireRoutesDir + '/' + requirePath + extname);
                    if (!fsUtil.existsSync(pathToRequireRoutesFile)) return;

                    if (ext === '.json') requireRoutes = JSON.parse($fs.readFileSync(pathToRequireRoutesFile, 'UTF-8'));
                    else requireRoutes = require(pathToRequireRoutesFile);

                    compile(requireRoutes, $path.dirname(pathToRequireRoutesFile));
                });
            }
        }
    })(routes, this._pathToRequireRoutesDir);

    return this;
};

/**
 * Получение маршрутов
 *
 * @returns {Object}
 */
Router.prototype.getRoutes = function getRoutes ()
{
    return this._routes;
};

/**
 * Маршрутизация
 *
 * @param {Object} req объекь запроса
 * @param {Object} res объект ответа
 * @param {Function} next функция продолжения обработки запроса
 *
 * @returns {Router}
 */
Router.prototype.route = function route (req, res, next)
{
    this._req = req;
    this._res = res;
    this._next = next;

    if (!this._uses.length)
    {
        next();
        return this;
    }

    this._uses.forEach(function (middle) { middle(req, res, nxt); });

    function nxt ()
    {
        next();
    }

    return this;
};

/**
 * Добавление слеша в конец маршрута и редирект
 *
 * @param {Object} req объект запроса
 * @param {Object} res объект ответа
 * @param {Function} next функция продолжения обработки запроса
 */
Router.prototype.endslash = function endslash (req, res, next)
{
    if (req.method !== 'GET' || !!~req.url.indexOf('?') || !req.path.match(/[^\/]$/))
    {
        next();
        return this;
    }

    res.redirect(req.path + '/');

    return this;
};
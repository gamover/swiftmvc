/**
 * Author: G@mOBEP
 * Date: 03.02.13
 * Time: 15:12
 *
 * Маршрутизатор Swift.
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
    _path = require('path'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = Router;

function Router ()
{
    var self = this,

        pathToRequireRoutesDir,

        req,
        res,
        next,

        uses = [],
        routes = {};

    /**
     * Задание пути к директории подключаемых маршрутов
     *
     * @param {String} path
     *
     * @returns {Router}
     */
    self.setPathToRequireRoutesDir = function (path)
    {
        pathToRequireRoutesDir = _path.normalize(path);

        return self;
    };

    /**
     * Получение пути к директории подключаемых маршрутов
     *
     * @returns {String}
     */
    self.getPathToRequireRoutesDir = function ()
    {
        return pathToRequireRoutesDir;
    };

    /**
     * Получение объекта запроса
     *
     * @returns {Object}
     */
    self.getRequest = function ()
    {
        return req;
    };

    /**
     * Получение объекта ответа
     *
     * @returns {Object}
     */
    self.getResponse = function ()
    {
        return res;
    };

    /**
     * Получение функции продолжения обработки запроса
     *
     * @returns {Function}
     */
    self.getNext = function()
    {
        return next;
    };

    /**
     * Добавление middleware
     *
     * @param {Function} middle
     *
     * @returns {Router}
     */
    self.use = function (middle)
    {
        if (typeof middle === 'function')
        {
            uses.push(middle);
        }

        return self;
    };

    /**
     * Задание маршрутов
     *
     * @param {Object} routes_
     *
     * @returns {Router}
     */
    self.setRoutes = function (routes_)
    {
        routes = routes_;

        return self;
    };

    /**
     * Добавление маршрута
     *
     * @param {String} alias псевдоним маршрута
     * @param {Object} route параметры маршрута
     *
     * @returns {Router}
     */
    self.addRoute = function (alias, route)
    {
        if (routes[alias]) return self;

        routes[alias] = {};
        routes[alias].path = route.path;
        if (route._path) routes[alias]._path = route._path;
        routes[alias].module = route.module || 'index';
        routes[alias].controller = route.controller || 'index';
        routes[alias].action = route.action || 'index';

        return self;
    };

    /**
     * Компиляция маршрутов
     *
     * @param {Object} routes маршруты
     *
     * @returns {Router}
     */
    self.compile = function (routes)
    {
        (function compile (routes, pathToRequireRoutesDir)
        {
            for (var key in routes)
            {
                if (key !== '$require')
                {
                    self.addRoute(key, routes[key]);
                }
                else if (pathToRequireRoutesDir)
                {
                    var requirePath = routes[key];

                    if (!requirePath instanceof Array)
                    {
                        requirePath = [requirePath];
                    }

                    requirePath.forEach(function (requirePath)
                    {
                        var extname = _path.extname(requirePath),
                            ext = extname,
                            pathToRequireRoutesFile,
                            requireRoutes;

                        if (!extname) ext = extname = '.json';
                        else extname = '';

                        pathToRequireRoutesFile = _path.normalize(pathToRequireRoutesDir + '/' + requirePath + extname);
                        if (!_path.existsSync(pathToRequireRoutesFile)) return;

                        if (ext === '.json') requireRoutes = JSON.parse(_fs.readFileSync(pathToRequireRoutesFile, 'UTF-8'));
                        else requireRoutes = require(pathToRequireRoutesFile);

                        compile(requireRoutes, _path.dirname(pathToRequireRoutesFile));
                    });
                }
            }
        })(routes, pathToRequireRoutesDir);

        return self;
    };

    /**
     * Получение маршрутов
     *
     * @returns {Object}
     */
    self.getRoutes = function ()
    {
        return routes;
    };

    /**
     * Маршрутизация
     *
     * @param {Object} req_ объекь запроса
     * @param {Object} res_ объект ответа
     * @param {Function} next_ функция продолжения обработки запроса
     *
     * @returns {Router}
     */
    self.route = function (req_, res_, next_)
    {
        req = req_;
        res = res_;
        next = next_;

        if (!uses.length)
        {
            next();
            return self;
        }

        uses.forEach(function (middle) { middle(req_, res_, nxt); });

        function nxt ()
        {
            next();
        }

        return self;
    };

    /**
     * Добавление слеша в конец маршрута и редирект
     *
     * @param {Object} req объект запроса
     * @param {Object} res объект ответа
     * @param {Function} next функция продолжения обработки запроса
     */
    self.endslash = function (req, res, next)
    {
        if (!~req.url.indexOf('?') && req.path.match(/[^\/]$/))
        {
            res.redirect(req.path + '/');

            return;
        }

        next();

        return self;
    };
}
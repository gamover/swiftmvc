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

    _endvars_;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.Router = function ()
{
    var self = this,

        req,
        res,
        next,

        uses = [],
        routes = {};

    /**
     * Получение объекта запроса
     *
     * @returns {Request}
     */
    self.getRequest = function ()
    {
        return req;
    };

    /**
     * Получение объекта ответа
     *
     * @returns {Response}
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
     * @returns {*}
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
     * @param {Object} route псевдоним маршрута
     *
     * @returns {Router}
     */
    self.addRoute = function (alias, route)
    {
        if (!routes[alias])
        {
            routes[alias] = {};
            routes[alias]['path'] = route.path;
            if (route._path) routes[alias]['_path'] = route._path;
            routes[alias]['module'] = route.module || 'index';
            routes[alias]['controller'] = route.controller || 'index';
            routes[alias]['action'] = route.action || 'index';
        }

        return self;
    };

    /**
     * Компиляция файла маршрутов
     *
     * @param {String} pathToFile путь к файлу
     *
     * @returns {Router}
     */
    self.compileRoutesFile = function (pathToFile)
    {
        pathToFile = _path.normalize(pathToFile);

        if (!_path.existsSync(pathToFile) || !_fs.statSync(pathToFile).isFile() || !_path.extname(pathToFile) === '.json')
        {
            return self;
        }

        var routesSrc = JSON.parse(_fs.readFileSync(pathToFile, 'UTF-8'));

        (function compileRoutes (routes, pathToFileDir)
        {
            for (var key in routes)
            {
                if (key !== '$require')
                {
                    self.addRoute(key, routes[key]);
                }
                else
                {
                    var $require = routes[key];

                    if (!$require instanceof Array)
                    {
                        $require = [$require];
                    }

                    $require.forEach(function ($require)
                    {
                        var pathToRequireFile = _path.normalize(pathToFileDir + '/' + $require + (_path.extname($require) === '.json' ? '' : '.json')),
                            requireRoutes = JSON.parse(_fs.readFileSync(pathToRequireFile, 'UTF-8'));

                        compileRoutes(requireRoutes, _path.dirname(pathToRequireFile));
                    });
                }
            }
        })(routesSrc, _path.dirname(pathToFile));

        return self;
    };

    /**
     * Получение маршрутов
     *
     * @param {Boolean|undefined} modulesFormat получить в формате модулей
     *
     * @returns {Object}
     */
    self.getRoutes = function (modulesFormat)
    {
        if (modulesFormat)
        {
            var modulesRoutes = {};
            for (var alias in routes)
            {
                var route = routes[alias],
                    modulName = route.module,
                    controllerName = route.controller,
                    actionName = route.action,
                    path = route.path;

                modulesRoutes[modulName] = modulesRoutes[modulName] || {};
                modulesRoutes[modulName][controllerName] = modulesRoutes[modulName][controllerName] || {};
                modulesRoutes[modulName][controllerName][actionName] = path;
            }

            return modulesRoutes;
        }

        return routes;
    };

    /**
     * Маршрутизация
     *
     * @param {Request} req_ объекь запроса
     * @param {Response} res_ объект ответа
     * @param {Function} next_ функция продолжения обработки запроса
     *
     * @returns {Router}
     */
    self.route = function (req_, res_, next_)
    {
        setTimeout(function ()
        {
            req = req_;
            res = res_;
            next = next_;

            uses.forEach(function (middle) { middle(req_, res_, nxt); });

            function nxt ()
            {
                next();
            }
        }, 0);

        return self;
    };

    /**
     * Добавление слеша в конец маршрута и редирект
     *
     * @param {Request} req объекь запроса
     * @param {Response} res объект ответа
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
};
/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 10:49
 *
 * Модуль Swift.
 *
 * Структура маршрутов (routes):
 *     {
 *         'controllerName1': {
 *             'actionName1': 'path1',
 *             'actionName2': 'path2',
 *              ...
 *             'actionNameN': 'pathN'
 *         },
 *         ...
 *         'controllerNameN': {
 *             ...
 *         }
 *     }
 */

var _path = require('path'),

    _package = require('./utils/package'),

    countModules = 0,

    _endvars_;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = Module;

function Module ()
{
    countModules++;

    var self = this,

        status = 'init',

        moduleName = 'swiftModule' + countModules,
        pathToModule,
        pathToModels,
        pathToViews,
        pathToControllers,

        requestListener,
        routes = {};

    /**
     * Задание названия модуля
     *
     * @param {String} name
     *
     * @returns {Module}
     */
    self.setName = function (name)
    {
        if (status === 'run') return self;

        moduleName = name;

        return self;
    };

    /**
     * Получение названия модуля
     *
     * @returns {String}
     */
    self.getName = function ()
    {
        return moduleName;
    };

    /**
     * Задание пути к директории модуля
     *
     * @param {String} path
     *
     * @returns {Module}
     */
    self.setPathToModule = function (path)
    {
        if (status === 'run') return self;

        pathToModule = _path.normalize(path);
        pathToModels = pathToModels || pathToModule + '/model';
        pathToViews = pathToViews || pathToModule + '/view';
        pathToControllers = pathToControllers || pathToModule + '/controller';

        return self;
    };

    /**
     * Получение пути к директории модуля
     *
     * @return {String}
     */
    self.getPathToModule = function ()
    {
        return pathToModule;
    };

    /**
     * Задание пути к директории моделей
     *
     * @param {String} path
     *
     * @returns {Module}
     */
    self.setPathToModels = function (path)
    {
        if (status === 'run') return self;

        pathToModels = path;

        return self;
    };

    /**
     * Получение пути к директории моделей
     *
     * @return {String}
     */
    self.getPathToModels = function ()
    {
        return pathToModels;
    };

    /**
     * Задание пути к директории видов
     *
     * @param {String} path
     *
     * @returns {Module}
     */
    self.setPathToViews = function(path)
    {
        if (status === 'run') return self;

        pathToViews = path;

        return self;
    };

    /**
     * Получение пути к директории видов
     *
     * @return {String}
     */
    self.getPathToViews = function ()
    {
        return pathToViews;
    };

    /**
     * Задание пути к директории контроллеров
     *
     * @param {String} path
     *
     * @returns {Module}
     */
    self.setPathToControllers = function (path)
    {
        if (status === 'run') return self;

        pathToControllers = path;

        return self;
    };

    /**
     * Получение пути к директории контроллеров
     *
     * @return {String}
     */
    self.getPathToControllers = function ()
    {
        return pathToControllers;
    };

    /**
     * Задание слушателя запросов
     *
     * @param {Object} listener слушатель запросов
     *
     * @returns {Modules}
     */
    self.setRequestListener = function (listener)
    {
        requestListener = listener;

        return self;
    };

    /**
     * Получение слушателя запросов
     *
     * @returns {Modules}
     */
    self.getRequestListener = function ()
    {
        return requestListener;
    };

    /**
     * Задание маршруштов
     *
     * @param {Object} routes_
     *
     * @returns {Module}
     */
    self.setRoutes = function (routes_)
    {
        if (status === 'run') return self;

        routes = routes_;

        return self;
    };

    /**
     * Добавление маршрута
     *
     * @param {String} controllerName название контроллера
     * @param {String} actionName название экшена
     * @param {String|RegExp} path маршрут
     *
     * @returns {Module}
     */
    self.addRoute = function (controllerName, actionName, path)
    {
        if (status === 'run') return self;

        if (!controllerName || !actionName || !path)
        {
            return self;
        }

        routes[controllerName] = routes[controllerName] || {};
        routes[controllerName][actionName] = path;

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
     * Запуск модуля (async)
     *
     * @param {Function} cb
     *
     * @returns {Module}
     */
    self.run = function (cb)
    {
        cb = cb || function () {};

        if (status === 'run')
        {
            cb(['модуль уже запущен']);
            return self;
        }

        status = 'run';

        var loading = 0,
            errors = [];

        for (var controllerName in routes)
        {
            loading++;

            (function (controllerName, routes)
            {
                process.nextTick(function ()
                {
                    var pathToController = pathToControllers + '/' + controllerName + '.js';

                    _path.exists(pathToController, function (exists)
                    {
                        if (!exists)
                        {
                            loading--;
                            errors = errors.concat(['контроллер "' + controllerName + '" не найден']);
                            return;
                        }

                        var controller = require(pathToController),
                            route = routes[controllerName];

                        for (var actionName in route)
                        {
                            loading++;

                            (function (actionName, route)
                            {
                                process.nextTick(function ()
                                {
                                    var action = controller[actionName + 'Action'];

                                    if (typeof action !== 'function')
                                    {
                                        errors = errors.concat(['в контроллере "' + controllerName + '" не определен экшен "' + actionName + '"']);
                                        loading--;
                                        return;
                                    }

                                    var path = route[actionName],
                                        resRender;

                                    /**
                                     * Переопределение метода Express res.render
                                     *
                                     * @param {Function} middle функция-прослойка
                                     * @param {Object} req объект запроса
                                     * @param {Object} res объект ответа
                                     * @param {Function} next функция перехода к следующей прослойке
                                     */
                                    function middleWrapper (middle, req, res, next)
                                    {
                                        resRender = resRender || res.render;

                                        /**
                                         * Отрисовка шаблона
                                         *
                                         * @param {String|Object} viewName название шаблона
                                         * @param {Object|Boolean} params параметры для передачи в шаблон
                                         * @param {Boolean} def ключ указывающий использовать базовый путь к шаблону
                                         *
                                         * @returns {*}
                                         */
                                        res.render = function (viewName, params, def)
                                        {
                                            if (typeof params === 'boolean')
                                            {
                                                def = params;
                                                params = {};
                                            }
                                            if (typeof viewName === 'object')
                                            {
                                                params = viewName;
                                                viewName = actionName;
                                            }

                                            viewName = viewName || actionName;
                                            params = params || {};
                                            def = def || false;

                                            var  pathToView = !def ? pathToViews + '/' + viewName : viewName;

                                            return resRender.call(res, pathToView, params);
                                        };

                                        middle.call(middle, req, res, next);
                                    }

                                    /**
                                     * Прослойка определения текущего модуля, контроллера и экшена
                                     *
                                     * @param {Object} req
                                     * @param {Object} res
                                     * @param {Function} next
                                     */
                                    function defineCurrent (req, res, next)
                                    {
                                        res.locals.swift = res.locals.swift || {};
                                        res.locals.swift.current = {
                                            'module': moduleName,
                                            'controller': controllerName,
                                            'action': actionName
                                        };
                                        next();
                                    }

                                    /**
                                     * Обработчик post-запроса
                                     *
                                     * @returns {*}
                                     */
                                    action.post = function ()
                                    {
                                        var args_ = Array.prototype.slice.call(arguments),
                                            args = [path];

                                        args.push(defineCurrent);

                                        args_.forEach(function (middle)
                                        {
                                            args.push(function (req, res, next) { middleWrapper (middle, req, res, next); });
                                        });

                                        return requestListener.post.apply(requestListener, args);
                                    };

                                    /**
                                     * Обработчик get-запроса
                                     *
                                     * @returns {*}
                                     */
                                    action.get = function ()
                                    {
                                        var args_ = Array.prototype.slice.call(arguments),
                                            args = [path];

                                        args.push(defineCurrent);

                                        args_.forEach(function (middle)
                                        {
                                            args.push(function (req, res, next) { middleWrapper (middle, req, res, next); });
                                        });

                                        return requestListener.get.apply(requestListener, args);
                                    };

                                    /**
                                     * Обработчик put-запроса
                                     *
                                     * @returns {*}
                                     */
                                    action.put = function ()
                                    {
                                        var args_ = Array.prototype.slice.call(arguments),
                                            args = [path];

                                        args.push(defineCurrent);

                                        args_.forEach(function (middle)
                                        {
                                            args.push(function (req, res, next) { middleWrapper (middle, req, res, next); });
                                        });

                                        return requestListener.put.apply(requestListener, args);
                                    };

                                    /**
                                     * Обработчик delete-запроса
                                     *
                                     * @returns {*}
                                     */
                                    action.delete = function ()
                                    {
                                        var args_ = Array.prototype.slice.call(arguments),
                                            args = [path];

                                        args.push(defineCurrent);

                                        args_.forEach(function (middle)
                                        {
                                            args.push(function (req, res, next) { middleWrapper (middle, req, res, next); });
                                        });

                                        return requestListener.delete.apply(requestListener, args);
                                    };

                                    action.call(action, self);

                                    loading--;
                                });
                            })(actionName, route);
                        }

                        loading--;
                    });
                });
            })(controllerName, routes);
        }

        //
        // ожидание окончания запуска модулей
        //

        (function awaiting ()
        {
            process.nextTick(function ()
            {
                if (loading)
                {
                    awaiting();
                    return;
                }

                cb(errors.length ? errors : null);
            });
        })();

        return self;
    };

    /**
     * Подключение ресурса из директории модуля
     *
     * @param {String} path путь к ресурсу
     * @param {Object|Function|undefined} params параметры
     * @param {Function|undefined} cb
     *
     * @return {Module|*}
     */
    self.require = function (path, params, cb)
    {
        if (typeof params === 'function')
        {
            cb = params;
        }

        //
        // парсинг токенов
        //

        if (path.indexOf(':model') === 0)
        {
            path = path.replace(':model', pathToModels);
        }
        else
        {
            path = pathToModule + '/' + path;
        }

        //
        // подключение ресурса
        //

        if (typeof cb === 'function')
        {
            _package.require(path, params, cb);
            return self;
        }
        else
        {
            return _package.requireSync(path, params);
        }
    };

    /**
     * Подключение модели
     *
     * @param {String} path путь к ресурсу
     * @param {Object|Function|undefined} params параметры
     * @param {Function|undefined} cb
     *
     * @returns {Module|*}
     */
    self.requireModel = function (path, params, cb)
    {
        return self.require(':model/' + path, params, cb);
    };
}

/**
 * Получение кол-ва созданных модулей
 *
 * @returns {Number}
 */
exports.getCountModules = function ()
{
    return countModules;
};
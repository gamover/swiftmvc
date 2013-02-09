/**
 * Author: G@mOBEP
 * Date: 07.02.13
 * Time: 21:08
 *
 * Пакет описывающий контроллер фреймворка Swift.
 *
 * У контроллера могут быть следующие состояния (status):
 *  - awaiting - ожидание инициализации
 *  - init - выполняется инициализация
 *  - error - во время инициализации контроллера возникли ошибки и он не может быть использован
 *  - success - контроллер успешно прошел инициализацию и может быть использован
 *
 * Структура маршрутов (routes):
 *  {
 *      'actionName1': 'path1',
 *      'actionName2': 'path2',
 *      ...
 *      'actionNameN': 'pathN'
 *  }
 */

var __controller = module.exports = exports,

    _fs = require('fs'),
    _path = require('path'),

    countControllers = 0;

__controller.Controller = function ()
{
    countControllers++;

    var self = this,

        status = 'awaiting',
        controllerName = 'SwiftController' + countControllers,
        pathToController,
        pathToViews,

        app,
        router,
        modul,
        routes = {},

        pack,
        actions = {};

    /**
     * Получение состояния контроллера
     *
     * @returns {string}
     */
    self.getStatus = function ()
    {
        return status;
    };

    /**
     * Задание названия контроллера
     *
     * @param name
     *
     * @returns {*}
     */
    self.setName = function (name)
    {
        controllerName = name;

        return self;
    };

    /**
     * Получение названия контроллера
     *
     * @returns {string}
     */
    self.getName = function ()
    {
        return controllerName;
    };

    /**
     * Задание пути к контроллеру
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToController = function (path)
    {
        pathToController = _path.normalize(path);

        return self;
    };

    /**
     * Получение пути к контроллеру
     *
     * @returns {*}
     */
    self.getPathToController = function ()
    {
        return pathToController;
    };

    /**
     * Задание пути к директории с видами
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToViews = function (path)
    {
        pathToViews = path;

        return self;
    };

    /**
     * Получение пути к директории с видами
     *
     * @returns {*}
     */
    self.getPathToViews = function ()
    {
        return pathToViews;
    };

    /**
     * Задание приложения
     *
     * @param app_
     *
     * @returns {*}
     */
    self.setApp = function (app_)
    {
        app = app_;

        return self;
    };

    /**
     * Получение приложения
     *
     * @returns {*}
     */
    self.getApp = function ()
    {
        return app;
    };

    /**
     * Задание роутера
     *
     * @param router_
     *
     * @returns {*}
     */
    self.setRouter = function (router_)
    {
        router = router_;

        return self;
    };

    /**
     * Получение роутера
     *
     * @returns {*}
     */
    self.getRouter = function ()
    {
        return router;
    };

    /**
     * Задание модуля
     *
     * @param modul_
     *
     * @returns {*}
     */
    self.setModule = function (modul_)
    {
        modul = modul_;
        pathToViews = pathToViews || modul.getPathToViews();

        return self;
    };

    /**
     * Получение модуля (async)
     *
     * @param callback
     *
     * @returns {*}
     */
    self.getModule = function (callback)
    {
        if (!modul)
        {
            callback(['модуль не задан']);
            return;
        }

        (function awaiting ()
        {
            setTimeout(function ()
            {
                var moduleStatus = modul.getStatus();

                if (moduleStatus === 'awaiting')
                {
                    callback(['модуль не был проинициализирован']);
                    return;
                }

                if (moduleStatus === 'error')
                {
                    callback(['модуль был проинициализирован с ошибками']);
                    return;
                }

                if (moduleStatus !== 'success')
                {
                    awaiting();
                    return;
                }

                callback(null, modul);
            }, 0);
        })();

        return modul;
    };

    /**
     * Задание маршруштов
     *
     * @param routes_
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
     * @param actionName название экшена
     * @param path маршрут
     *
     * @returns {*}
     */
    self.addRoute = function (actionName, path)
    {
        routes[actionName] = path;

        return self;
    };

    /**
     * Получение маршрутов
     *
     * @returns {*}
     */
    self.getRoutes = function ()
    {
        return routes;
    };

    /**
     * Инициализация контроллера (async)
     *
     * @param callback
     *
     * @returns {*}
     */
    self.init = function (callback)
    {callback = callback || function () {};

        status = 'init';

        //
        // проверка задан ли путь к пакету контроллера
        //

        if (!pathToController)
        {
            status = 'error';
            callback(['не задан путь к пакету контроллера']);
            return self;
        }

        //
        // проверка существования пакета контроллера по указанному пути
        //

        _path.exists(pathToController, function (exists)
        {
            if (!exists)
            {
                status = 'error';
                callback(['пакет контроллера не найден по указанному пути']);
                return;
            }

            checkFile();
        });

        //
        // проверка, является ли пакет файлом
        //

        function checkFile ()
        {
            _fs.stat(pathToController, function (err, stats) {
                if (err)
                {
                    status = 'error';
                    callback(['системная ошибка']);
                    return;
                }

                if (!stats.isFile())
                {
                    status = 'error';
                    callback(['не удалось подключить пакет контроллера']);
                    return;
                }

                checkExtname();
            });
        }

        //
        // проверка расширения пакета контроллера
        //

        function checkExtname ()
        {
            if (_path.extname(pathToController) !== '.js')
            {
                status = 'error';
                callback(['пакет контроллера имеет недопустимый формат']);
                return;
            }

            loadController();
        }

        //
        // загрузка пакета контроллера
        //

        function loadController ()
        {
            pack = require(pathToController).call(self, self);
            status = 'success';
            callback(null, self);
        }

        //
        ////
        //

        return self;
    };

    /**
     * Получение пакета контроллера
     *
     * @returns {*}
     */
    self.getPackage = function ()
    {
        return pack;
    };

    /**
     * Добавление экшена
     *
     * @param actionName название экшена
     * @param action функция-экшен
     *
     * @returns {*}
     */
    self.addAction = function (actionName, action)
    {
        actions[actionName] = action;

        return self;
    };

    /**
     * Получение всех экшенов
     *
     * @returns {{}}
     */
    self.getActions = function ()
    {
        return actions;
    };

    /**
     * Получение экшена
     *
     * @param actionName название экшена
     *
     * @returns {*}
     */
    self.getAction = function (actionName)
    {
        return actions[actionName];
    };

    /**
     * Запуск контроллера
     *
     * @param callback
     *
     * @returns {*}
     */
    self.run = function (callback)
    {callback = callback || function () {};
        //
        // ожидание инициализации контроллера
        //

        (function awaiting ()
        {
            setTimeout(function ()
            {
                if (status === 'awaiting')
                {
                    callback(['контроллер "' + controllerName + '" не был проинициализирован']);
                    return;
                }

                if (status === 'error')
                {
                    callback(['контроллер "' + controllerName + '" был проинициализирован c ошибками']);
                    return;
                }

                if (status !== 'success')
                {
                    awaiting();
                    return;
                }

                runController();
            }, 0);
        })();

        //
        // запуск контроллера
        //

        function runController ()
        {
            for (var actionName in routes)
            {
                var action = actions[actionName];

                if (!action) return;

                var path = routes[actionName];

                action.post = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(path);

                    return app.post.apply(app, args);
                };

                action.get = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(path);

                    return app.get.apply(app, args);
                };

                action.put = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(path);

                    return app.put.apply(app, args);
                };

                action.delete = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(path);

                    return app.delete.apply(app, args);
                };

                action.render = function (viewName, params)
                {
                    if (viewName && typeof viewName === 'object')
                    {
                        params = viewName;
                        viewName = 'index';
                    }
                    else
                    {
                        viewName = viewName || 'index';
                        params = params || {};
                    }

                    return router.getResponse().render(pathToViews + '/' + viewName, params);
                };

                action.call(action, action);
            }

            callback(null, self);
        }

        return self;
    };
};

/**
 * Получение кол-ва созданных контроллеров
 *
 * @returns {number}
 */
__controller.getCountControllers = function ()
{
    return countControllers;
};
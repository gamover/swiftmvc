/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 *
 * Набор модулей Swift.
 *
 * Структура маршрутов (routes):
 *     {
 *         ModuleName1: {
 *             'controllerName1': {
 *                 'actionName1': 'path1',
 *                 'actionName2': 'path2',
 *                 ...
 *                 'actionNameN': 'pathN'
 *             },
 *             ...
 *             'controllerNameN': {
 *                 ...
 *             }
 *         },
 *         ...
 *         ModuleNameN :{
 *             ...
 *         }
 *     }
 */

var Module = require('./module'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = Modules;

function Modules ()
{
    var self = this,

        status = 'init',

        pathToModules,

        server,
        requestListener,
        routes = {},

        modules = {},

        __endvars__;

    /**
     * Задание пути к директории модулей
     *
     * @param {String} path
     *
     * @returns {Modules}
     */
    self.setPathToModules = function (path)
    {
        if (status === 'run') return self;

        pathToModules = path;

        return self;
    };

    /**
     * Получение пути к директории модулей
     *
     * @returns {String}
     */
    self.getPathToModules = function ()
    {
        return pathToModules;
    };

    /**
     * Задание сервера
     *
     * @param {Server} $server
     *
     * @returns {Modules}
     */
    self.setServer = function ($server)
    {
        server = $server;

        return self;
    };

    /**
     * Получение сервера
     *
     * @returns {Server}
     */
    self.getServer = function ()
    {
        return server;
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
     * Задание маршрутов
     *
     * @param {Object} routes_
     *
     * @returns {Modules}
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
     * @param {String} moduleName название модуля
     * @param {String} controllerName название контроллера
     * @param {String} actionName название экшена
     * @param {String|RegExp} path путь
     *
     * @returns {Modules}
     */
    self.addRoute = function (moduleName, controllerName, actionName, path)
    {
        if (status === 'run') return self;

        if (!moduleName || !controllerName || !actionName || !path)
        {
            return self;
        }

        routes[moduleName] = routes[moduleName] || {};
        routes[moduleName][controllerName] = routes[moduleName][controllerName] || {};
        routes[moduleName][controllerName][actionName] = path;

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
     * Добавление модуля
     *
     * @param {Module} modul
     *
     * @returns {Modules}
     */
    self.addModule = function (modul)
    {
        if (status === 'run')
        {
            return self;
        }

        //
        // проверка модуля
        //

        if (!modul)
        {
            return self;
        }

        if (!modul instanceof Module)
        {
            return self;
        }

        //
        // добавление модуля
        //

        modules[modul.getName()] = modul;

        //
        ////
        //

        return self;
    };

    /**
     * Загрузка модуля
     *
     * @param {String} moduleName название модуля
     *
     * @returns {Modules}
     */
    self.load = function (moduleName)
    {
        if (status === 'run')
        {
            return self;
        }

        var pathToModule = pathToModules + '/' + moduleName.split('.').join('/modules/'),
            modul = new Module();

        //
        // задание параметров модуля
        //

        modul
            .setName(moduleName)
            .setPathToModule(pathToModule)
            .setRequestListener(requestListener)
            .setRoutes(routes[moduleName] || {})
        ;

        //
        // добавление модуля
        //

        self.addModule(modul);

        return self;
    };

    /**
     * Получение модуля
     *
     * @param {String|undefined} moduleName название модуля
     *
     * @return {Modules}
     */
    self.get = function (moduleName)
    {
        return (moduleName ? modules[moduleName] : modules);
    };

    /**
     * Запуск модулей
     *
     * @param {Function|undefined} cb
     *
     * @returns {Modules}
     */
    self.run = function (cb)
    {
        cb = cb || function () {};

        if (status === 'run')
        {
            cb(['модули уже запущены']);
            return self;
        }

        status = 'run';

        var loading = 0,
            errors = [];

        for (var moduleName in routes)
        {
            loading++;

            var modul = modules[moduleName];

            if (!modul)
            {
                loading--;
                errors = errors.concat(['модуль "' + moduleName + '" не загружен']);
                continue;
            }

            (function (moduleName)
            {
                modul.run(function (err)
                {
                    loading--;

                    if (err)
                    {
                        errors = errors.concat(['во время загрузки модуля "' + moduleName + '" возникли ошибки', err]);
                        return;
                    }
                });
            })(moduleName);
        }

        //
        // ожидание окончания запуска модулей
        //

        (function awaitingModules ()
        {
            process.nextTick(function ()
            {
                if (loading)
                {
                    awaitingModules();
                    return;
                }

                if (server)
                {
                    server.run(function (err)
                    {
                        if (err) errors = errors.concat(['во время запуска сервера возникли ошибки', err]);
                        cb(errors.length ? errors : null, modules.length);
                    });

                    return;
                }

                cb(errors.length ? errors : null, modules.length);
            });
        })();

        //
        ////
        //

        return self;
    };
}
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

var _http = require('http'),

    Module = require('./module');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = Modules;

function Modules ()
{
    var self = this,

        status = 'init',

        ip = '127.0.0.1',
        pathToModules,

        app,
        routes,

        modules = {};

    /**
     * Задание ip сервера
     *
     * @param {string} ip_
     *
     * @returns {Modules}
     */
    self.setIp = function (ip_)
    {
        if (status === 'run') return self;

        ip = ip_;

        return self;
    };

    /**
     * Получение ip сервера
     *
     * @returns {string}
     */
    self.getIp = function ()
    {
        return ip;
    };

    /**
     * Задание пути к директории модулей
     *
     * @param {string} path
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
     * @returns {string}
     */
    self.getPathToModules = function ()
    {
        return pathToModules;
    };

    /**
     * Задание объекта приложения
     *
     * @param {Application} app_
     *
     * @returns {Modules}
     */
    self.setApp = function (app_)
    {
        if (status === 'run') return self;

        app = app_;

        return self;
    };

    /**
     * Получение объекта приложения
     *
     * @returns {Application}
     */
    self.getApp = function ()
    {
        return app;
    };

    /**
     * Задание маршрутов
     *
     * @param {object} routes_
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
     * @param {string} moduleName название модуля
     * @param {string} controllerName название контроллера
     * @param {string} actionName название экшена
     * @param {string|RegExp} path путь
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
     * @returns {object}
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
            .setApp(app)
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
                        errors = errors.concat(['во время загрузки модуля "' + moduleName + '" возникли ошибки', err])
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

                runServer();
            });
        })();

        //
        // запуск сервера
        //

        function runServer()
        {
            _http.createServer(app).listen(app.set('port'), ip, function() {
                var text = '= Swift server listening on ' + ip + ':' + app.set('port') + ' =',
                    line = Array.prototype.map.call(text, function() { return '='; }).join('');

                console.log(line);
                console.log(text);
                console.log(line);
                console.log('');

                cb(errors.length ? errors : null, modules.length);
            });
        }

        //
        ////
        //

        return self;
    };
}
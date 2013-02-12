/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 *
 * Набор модулей Swift.
 *
 * Структура маршрутов (routes):
 *  {
 *      ModuleName1: {
 *          'controllerName1': {
 *              'actionName1': 'path1',
 *              'actionName2': 'path2',
 *              ...
 *              'actionNameN': 'pathN'
 *          },
 *          ...
 *          'controllerNameN': {
 *              ...
 *          }
 *      },
 *      ...
 *      ModuleNameN :{
 *          ...
 *      }
 *  }
 */

var __modules = module.exports = exports,

    _http = require('http'),

    Module = require('./module/module').Module;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

__modules.Modules = function ()
{
    var self = this,

        status = 'init',   // состояние
        initProcesses = 0, // кол-во запущенных процессов инициализации

        ip = '127.0.0.1',
        pathToModules,

        app,
        renderer,
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
     * Задание отрисовщика видов
     *
     * @param {Renderer} renderer_
     *
     * @returns {Modules}
     */
    self.setRenderer = function (renderer_)
    {
        if (status === 'run') return self;

        renderer = renderer_;

        return self;
    };

    /**
     * Получение отрисовщика видов
     *
     * @returns {Renderer}
     */
    self.getRenderer = function ()
    {
        return renderer;
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
     * Добавление модуля (async)
     *
     * @param {Module} modul
     * @param {function|undefined} callback
     *
     * @returns {Modules}
     */
    self.addModule = function (modul, callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модули уже запущены']);
            return self;
        }

        initProcesses++;

        setTimeout(function ()
        {
            //
            // проверка модуля
            //

            if (!modul)
            {
                initProcesses--;
                callback(['не задан модуль']);
                return;
            }

            if (!modul instanceof Module)
            {
                initProcesses--;
                callback(['недопустимый тип модуля']);
                return;
            }

            //
            // добавление модуля
            //

            modules[modul.getName()] = modul;
            initProcesses--;
            callback(null, modul);
        }, 0);

        return self;
    };

    /**
     * Загрузка модуля (async)
     *
     * @param {string} moduleName название модуля
     * @param {function} callback
     *
     * @returns {Modules}
     */
    self.load = function (moduleName, callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модули уже запущены']);
            return self;
        }

        initProcesses++;

        setTimeout(function()
        {
            var pathToModule = pathToModules + '/' + moduleName.split('.').join('/modules/'),
                modul = new Module();

            //
            // задание параметров модуля
            //

            modul
                .setName(moduleName)
                .setPathToModule(pathToModule)
                .setApp(app)
                .setRenderer(renderer)
                .setRoutes(routes[moduleName] || {})
                .init(function (err)
                {
                    if (err)
                    {
                        initProcesses--;
                        callback(['не удалось загрузить модуль "' + moduleName + '"', err]);
                        return;
                    }

                    //
                    // добавление модуля
                    //

                    self.addModule(modul, function(err, modul)
                    {
                        if (err)
                        {
                            initProcesses--;
                            callback(['не удалось загрузить модуль "' + moduleName + '"', err]);
                            return;
                        }

                        initProcesses--;
                        callback(null, modul);
                    });
                })
            ;
        }, 0);

        return self;
    };

    /**
     * Получение модуля (async)
     *
     * @param {String|Function|undefined} moduleName название модуля
     * @param {Function} callback
     *
     * @return {Modules}
     */
    self.get = function (moduleName, callback)
    {
        setTimeout(function ()
        {
            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (initProcesses)
                    {
                        awaiting();
                        return;
                    }

                    if (typeof moduleName === 'function')
                    {
                        callback = moduleName;
                        moduleName = undefined;
                    }

                    callback(null, (moduleName ? modules[moduleName] : modules));
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Запуск модулей
     *
     * @returns {Modules}
     */
    self.run = function (callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модули уже запущены']);
            return self;
        }

        setTimeout(function ()
        {
            //
            // ожидание завершения инициализации
            //

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (initProcesses)
                    {
                        awaiting();
                        return;
                    }

                    status = 'run';

                    run();
                }, 0);
            })();

            //
            // запуск
            //

            function run ()
            {
                var loading = 0,
                    errors = [];

                //
                // запуск модулей
                //

                for (var moduleName in modules)
                {
                    loading++;

                    modules[moduleName].run(function (err)
                    {
                        if (err)
                        {
                            errors = errors.concat(['возникли ошибки при запуске модуля "' + moduleName + '"', err]);
                        }

                        loading--;
                    });
                }

                //
                // ожидание окончания запуска модулей
                //

                (function awaitingModules ()
                {
                    setTimeout(function ()
                    {
                        if (loading)
                        {
                            awaitingModules();
                            return;
                        }

                        if (errors.length)
                        {
                            callback(errors);
                            return;
                        }

                        runServer();
                    }, 0);
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

                        callback(null, modules.length);
                    });
                }
            }
        }, 0);

        return self;
    };
};
/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 10:49
 *
 * Пакет описывающий модуль фреймворка Swift.
 *
 * У модуля могут быть следующие состояния (status):
 *  - awaiting - ожидание инициализации
 *  - init - выполняется инициализация
 *  - error - во время инициализации модуля возникли ошибки и он не может быть использован
 *  - success - модуль успешно прошел инициализацию и может быть использован
 *
 * Структура маршрутов (routes):
 *  {
 *      'controllerName1': {
 *          'actionName1': 'path1',
 *          'actionName2': 'path2',
 *           ...
 *          'actionNameN': 'pathN'
 *      },
 *      'controllerName2': {
 *          'actionName1': 'path1',
 *          'actionName2': 'path2',
 *           ...
 *          'actionNameN': 'pathN'
 *      },
 *      ...
 *      'controllerNameN': {
 *          'actionName1': 'path1',
 *          'actionName2': 'path2',
 *           ...
 *          'actionNameN': 'pathN'
 *      }
 *  }
 */

var __module = module.exports = exports,

    _fs = require('fs'),
    _path = require('path'),
    _package = require('./../utils/package'),

    Model = require('./model').Model,
    Controller = require('./controller').Controller/*,
    Widgets = require('./../widgets').Widgets*/,

    countModules = 0;

__module.Module = function ()
{
    countModules++;

    var self = this,

        status = 'awaiting',
        moduleName = 'swiftModule' + countModules,
        pathToModule,
        pathToModels,
        pathToViews,
        pathToControllers,
        pathToWidgets,

        app,
        router,
        routes = {},

        controllers = {},
        models = {},
        widgets = {};

    /**
     * Получение состояния модуля
     *
     * @returns {string}
     */
    self.getStatus = function ()
    {
        return status;
    };

    /**
     * Задание названия модуля
     *
     * @param name
     *
     * @returns {*}
     */
    self.setName = function (name)
    {
        moduleName = name;

        return self;
    };

    /**
     * Получение названия модуля
     *
     * @returns {*}
     */
    self.getName = function ()
    {
        return moduleName;
    };

    /**
     * Задание пути к модулю
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToModule = function (path)
    {
        pathToModule = _path.normalize(path);
        pathToModels = pathToModels || pathToModule + '/model';
        pathToViews = pathToViews || pathToModule + '/view';
        pathToControllers = pathToControllers || pathToModule + '/controller';
        pathToWidgets = pathToWidgets || pathToModule + '/widgets';

        return self;
    };

    /**
     * Получение пути к директории модуля
     *
     * @return {*}
     */
    self.getPathToModule = function ()
    {
        return pathToModule;
    };

    /**
     * Задание пути к моделям
     *
     * @param path
     * @returns {*}
     */
    self.setPathToModels = function (path)
    {
        pathToModels = path;

        return self;
    };

    /**
     * Получение пути к директории моделей
     *
     * @return {*}
     */
    self.getPathToModels = function ()
    {
        return pathToModels;
    };

    /**
     * Задание пути к видам
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToViews = function(path)
    {
        pathToViews = path;

        return self;
    };

    /**
     * Получение пути к директории видов
     *
     * @return {*}
     */
    self.getPathToViews = function ()
    {
        return pathToViews;
    };

    /**
     * Задание пути к контроллерам
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToControllers = function (path)
    {
        pathToControllers = path;

        return self;
    };

    /**
     * Получение пути к директории контроллеров
     *
     * @return {*}
     */
    self.getPathToControllers = function ()
    {
        return pathToControllers;
    };

    /**
     * Задание пути к виджетам
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToWidgets = function (path)
    {
        pathToWidgets = path;

        return self;
    };

    /**
     * Получение пути к директории видждетов
     *
     * @returns {*}
     */
    self.getPathToWidgets = function ()
    {
        return pathToWidgets;
    };

    /**
     * Задание объекта приложения
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
     * Получение объекта приложения
     *
     * @returns {*}
     */
    self.getApp = function ()
    {
        return app;
    };

    /**
     * Задание рутера
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
     * @param controllerName название контроллера
     * @param actionName название экшена
     * @param path маршрут
     *
     * @returns {*}
     */
    self.addRoute = function (controllerName, actionName, path)
    {
        routes[controllerName] = {};
        routes[controllerName][actionName] = path;

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
     * Инициализация модуля
     *
     * @param callback
     *
     * @returns {*}
     */
    self.init = function (callback)
    {callback = callback || function () {};

        status = 'init';

        if (!_path.existsSync(pathToModule) || !_fs.statSync(pathToModule).isDirectory())
        {
            callback(['указанный путь "' + pathToModule + '" не существует']);
            return self;
        }

        var errors = [],
            loading = 0;

        //
        // загрузка моделей
        //

        if (_path.existsSync(pathToModels))
        {
            (function bypass (pathToDir, path)
            {
                loading++;

                path = path ? path + '/' : '';

                _fs.readdir(pathToDir, function(err, files)
                {
                    if (err)
                    {
                        errors = errors.concat([
                            'модели не загружены',
                            'произошла системная ошибка',
                            err
                        ]);
                        loading--;
                        return;
                    }

                    files.forEach(function (filename)
                    {
                        if (_fs.statSync(pathToDir + '/' + filename).isDirectory())
                        {
                            bypass(pathToDir + '/' + filename, path + filename);
                        }
                        else
                        {
                            if (_path.extname(filename) !== '.js')
                            {
                                return;
                            }

                            loading++;

                            var name = _path.basename(filename, '.js'),
                                model = new Model();

                            model
                                .setName(name)
                                .setPathToModel(pathToDir + '/' + filename)
                                .init(function (err, model)
                                {
                                    if (err)
                                    {
                                        errors = errors.concat(['модель "' + name + '" не загружена'].concat(err));
                                        loading--;
                                        return;
                                    }

                                    models[name] = model;
                                    loading--;
                                })
                            ;
                        }
                    });

                    loading--;
                });
            })(pathToModels);
        }

        //
        // загрузка контроллеров
        //

        if (_path.existsSync(pathToControllers))
        {
            (function bypass (pathToDir, path)
            {
                loading++;

                path = path ? path + '/' : '';

                _fs.readdir(pathToDir, function(err, files)
                {
                    if (err)
                    {
                        errors = errors.concat([
                            'контроллеры не загружены',
                            'произошла системная ошибка',
                            err
                        ]);
                        loading--;
                        return;
                    }

                    files.forEach(function (filename)
                    {
                        if (_fs.statSync(pathToDir + '/' + filename).isDirectory())
                        {
                            bypass(pathToDir + '/' + filename, path + filename);
                        }
                        else
                        {
                            if (_path.extname(filename) !== '.js')
                            {
                                return;
                            }

                            loading++;

                            var name = _path.basename(filename, '.js'),
                                controller = new Controller();

                            controller
                                .setName(name)
                                .setPathToController(pathToDir + '/' + filename)
                                .setPathToViews(pathToViews)
                                .setApp(app)
                                .setRouter(router)
                                .setModule(self)
                                .setRoutes(routes[name] || {})
                                .init(function (err, controller)
                                {
                                    if (err)
                                    {
                                        errors = errors.concat(['контроллер "' + name + '" не загружена'].concat(err));
                                        loading--;
                                        return;
                                    }

                                    controllers[name] = controller;
                                    loading--;
                                })
                            ;
                        }
                    });

                    loading--;
                });
            })(pathToControllers);
        }

        //
        // загрузка виджетов
        //

        /*loadingWidgets++;

        widgets = new Widgets();
        widgets
            .setApp(app)
            .setPathToWidgets(pathToWidgets)
            .load(function (err, widgets) { loadingWidgets--; })
        ;*/

        //
        // ожидание загрузки компонентов
        //

        (function awaiting ()
        {
            setTimeout(function ()
            {
                if (loading)
                {
                    awaiting();
                    return;
                }

                status = 'success';

                callback((errors.length ? errors : null), self);
            }, 0);
        })();

        //
        ////
        //

        return self;
    };

    /**
     * Получене всех моделей (async)
     *
     * @param pkg получать пакет модели
     * @param callback
     *
     * @return {*}
     */
    self.getModels = function (pkg, callback)
    {
        if (typeof pkg === 'function')
        {
            callback = pkg;
            pkg = true;
        }

        var mdls = {},
            errors = [],
            loading = 0;

        for (var modelAlias in models)
        {
            loading++;

            self.getModel(modelAlias, pkg, function (err, model)
            {
                if (err)
                {
                    errors = errors.concat(['не удалось получить модель "' + modelAlias + '"'].concat(err));
                    loading--;
                    return;
                }

                mdls[modelAlias] = model;
                loading--;
            });
        }

        //
        // ожидание получения моделей
        //

        (function awaiting ()
        {
            setTimeout(function ()
            {
                if (loading)
                {
                    awaiting();
                    return;
                }

                callback((errors.length ? errors : null), mdls);
            }, 0);
        })();

        return self;
    };

    /**
     * Получение модели (async)
     *
     * @param alias псевдоним модели
     * @param pkg получать пакет модели
     * @param callback
     *
     * @return {*}
     */
    self.getModel = function (alias, pkg, callback)
    {
        if (typeof pkg === 'function')
        {
            callback = pkg;
            pkg = true;
        }

        var model = models[alias];

        if (!model)
        {
            callback();
            return;
        }

        (function awaiting ()
        {
            setTimeout(function ()
            {
                var modelStatus = model.getStatus();

                if (modelStatus === 'awaiting')
                {
                    callback(['модель не была проинициализирована']);
                    return;
                }

                if (modelStatus === 'error')
                {
                    callback(['модель была проинициализирована с ошибками']);
                    return;
                }

                if (modelStatus !== 'success')
                {
                    awaiting();
                    return;
                }

                callback(null, (pkg ? model.getPackage() : model));
            }, 0);
        })();

        return self;
    };

    /**
     * Получение всех контроллеров (async)
     *
     * @param callback
     *
     * @return {*}
     */
    self.getControllers = function (callback)
    {
        var ctrls = {},
            errors = [],
            loading = 0;

        for (var controllerAlias in controllers)
        {
            loading++;

            self.getController(controllerAlias, function (err, controller)
            {
                if (err)
                {
                    errors = errors.concat(['не удалось получить контроллер "' + controllerAlias + '"'].concat(err));
                    loading--;
                    return;
                }

                ctrls[controllerAlias] = controller;
                loading--;
            });
        }

        //
        // ожидание получения контроллеров
        //

        (function awaiting ()
        {
            setTimeout(function ()
            {
                if (loading)
                {
                    awaiting();
                    return;
                }

                callback((errors.length ? errors : null), ctrls);
            }, 0);
        })();

        return self;
    };

    /**
     * Получение контроллера (async)
     *
     * @param alias псевдоним контроллера
     * @param callback
     *
     * @return {*}
     */
    self.getController = function (alias, callback)
    {
        var controller = controllers[alias];

        if (!controller)
        {
            callback();
            return;
        }

        (function awaiting ()
        {
            setTimeout(function ()
            {
                var controllerStatus = controller.getStatus();

                if (controllerStatus === 'awaiting')
                {
                    callback(['контроллер не был проинициализирован']);
                    return;
                }

                if (controllerStatus === 'error')
                {
                    callback(['контроллер был проинициализирован с ошибками']);
                    return;
                }

                if (controllerStatus !== 'success')
                {
                    awaiting();
                    return;
                }

                callback(null, controller);
            }, 0);
        })();

        return self;
    };

    /**
     * todo Получение всех виджетов
     *
     * @returns {*}
     */
    self.getWidgets = function()
    {
        if (widgets) return widgets.get();
    };

    /**
     * todo Получение виджета
     *
     * @param path путь к виджету
     *
     * @returns {*}
     */
    self.getWidget = function(path)
    {
        if (widgets && path) return widgets.get(path);
    };

    /**
     * Запуск модуля (async)
     *
     * @param callback
     *
     * @returns {*}
     */
    self.run = function (callback)
    {callback = callback || function () {};

        //
        // ожидание инициализации модуля
        //

        (function awaiting ()
        {
            setTimeout(function ()
            {
                if (status === 'awaiting')
                {
                    callback(['модуль "' + moduleName + '" не был проинициализирован']);
                    return;
                }

                if (status === 'error')
                {
                    callback(['модуль "' + moduleName + '" был проинициализирован c ошибками']);
                    return;
                }

                if (status !== 'success')
                {
                    awaiting();
                    return;
                }

                runModule();
            }, 0);
        })();

        //
        // запуск модуля
        //

        function runModule ()
        {
            var errors = [],
                loading = 0;

            for (var controllerName in controllers)
            {
                loading++;

                var controller = controllers[controllerName];

                controller.run(function (err, controller)
                {
                    if (err)
                    {
                        errors = errors.concat(['не удалось запустить контроллер "' + controllerName + '"'].concat(err));
                        loading--;
                    }
                });
            }

            //
            // ожидание запуска контроллеров
            //

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (loading)
                    {
                        awaiting();
                        return;
                    }

                    callback((errors.length ? errors : null), self);
                }, 0);
            })();
        }

        //
        ////
        //

        return self;
    };

    /**
     * Подключение ресурса из директории модуля
     *
     * @param path путь к ресурсу
     * @param params параметры
     *
     * @return {*}
     */
    self.require = function (path, params)
    {
        //
        // парсинг токенов
        //

        if (path.indexOf(':model') === 0)
        {
            path = path.replace(':model', pathToModels);
        }
        else if (path.indexOf(':view') === 0)
        {
            path = path.replace(':view', pathToViews);
        }
        else if (path.indexOf(':controller') === 0)
        {
            path = path.replace(':controller', pathToControllers);
        }
        else if (path.indexOf(':widgets') === 0)
        {
            path = path.replace(':widgets', pathToWidgets);
        }
        else
        {
            path = pathToModule + '/' + path;
        }

        //
        // подключение ресурса
        //

        return _package.require(path, params);
    };
};

/**
 * Получение кол-ва созданных модулей
 *
 * @returns {number}
 */
__module.getCountModules = function ()
{
    return countModules;
};
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

    Controller = require('./controller').Controller,
    View = require('./view').View,

    countModules = 0;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
        renderer,
        routes = {},

        models = {},
        views = {},
        controllers = {},
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
     * @param {string} name
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
     * @returns {string}
     */
    self.getName = function ()
    {
        return moduleName;
    };

    /**
     * Задание пути к директории модуля
     *
     * @param {string} path
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
     * @return {string}
     */
    self.getPathToModule = function ()
    {
        return pathToModule;
    };

    /**
     * Задание пути к директории моделей
     *
     * @param {string} path
     *
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
     * @return {string}
     */
    self.getPathToModels = function ()
    {
        return pathToModels;
    };

    /**
     * Задание пути к директории видов
     *
     * @param {string} path
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
     * @return {string}
     */
    self.getPathToViews = function ()
    {
        return pathToViews;
    };

    /**
     * Задание пути к директории контроллеров
     *
     * @param {string} path
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
     * @return {string}
     */
    self.getPathToControllers = function ()
    {
        return pathToControllers;
    };

    /**
     * Задание пути к директории виджетов
     *
     * @param {string} path
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
     * @returns {string}
     */
    self.getPathToWidgets = function ()
    {
        return pathToWidgets;
    };

    /**
     * Задание объекта приложения
     *
     * @param {object} app_
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
     * @returns {object}
     */
    self.getApp = function ()
    {
        return app;
    };

    /**
     * Задание отрисовщика видов
     *
     * @param {object} renderer_
     *
     * @returns {*}
     */
    self.setRenderer = function (renderer_)
    {
        renderer = renderer_;

        return self;
    };

    /**
     * Получение отрисовщика видов
     *
     * @returns {*}
     */
    self.getRenderer = function()
    {
        return renderer;
    };

    /**
     * Задание маршруштов
     *
     * @param {object} routes_
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
     * @param {string} controllerName название контроллера
     * @param {string} actionName название экшена
     * @param {string|RegExp} path маршрут
     *
     * @returns {*}
     */
    self.addRoute = function (controllerName, actionName, path)
    {
        routes[controllerName] = routes[controllerName] || {};
        routes[controllerName][actionName] = path;

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
     * Инициализация модуля (async)
     *
     * @param {function|undefined} callback
     *
     * @returns {*}
     */
    self.init = function (callback)
    {
        status = 'init';

        setTimeout(function ()
        {
            callback = callback || function () {};

            //
            // проверка существования директории модуля
            //

            _path.exists(pathToModule, function (exists)
            {
                if (!exists)
                {
                    callback(['указанный путь к модулю "' + pathToModule + '" не существует']);
                    return;
                }

                _fs.stat(pathToModule, function (err, stats)
                {
                    if (err)
                    {
                        callback(['возникла системная ошибка', err]);
                        return;
                    }

                    loadingComponents();
                });
            });

            //
            // загрузка компонентов модуля
            //

            function loadingComponents ()
            {
                var errors = [],
                    loading = 0;

                //
                // загрузка моделей
                //

                loading++;

                _path.exists(pathToModels, function (exists)
                {
                    if (!exists)
                    {
                        loading--;
                        return;
                    }

                    loading++;

                    _package.requireDirR(pathToModels, function (err, models_)
                    {
                        if (err)
                        {
                            errors = errors.concat(['возникли ошибки во время загрузки моделей'].concat(err));
                        }

                        if (models_)
                        {
                            models = models_;
                        }

                        loading--;
                    });

                    loading--;
                });

                //
                // загрузка видов
                //

                loading++;

                _path.exists(pathToViews, function (exists)
                {
                    if (!exists)
                    {
                        loading--;
                        return;
                    }

                    (function bypass (pathToDir, path)
                    {
                        loading++;

                        path = path ? path + '/' : '';

                        _fs.readdir(pathToDir, function (err, files)
                        {
                            if (err)
                            {
                                errors = errors.concat([
                                    'возникли ошибки во время загрузки видов',
                                    'не удалось подключить директорию "' + pathToDir + '"',
                                    err
                                ]);
                                loading--;
                                return;
                            }

                            //
                            // обход текущей директории
                            //

                            files.forEach(function (filename)
                            {
                                loading++;

                                _fs.stat(pathToDir + '/' + filename, function (err, stat)
                                {
                                    if (err)
                                    {
                                        errors = errors.concat([
                                            'возникли ошибки во время загрузки видов',
                                            'не удалось подключить ресурс "' + pathToDir + '/' + filename + '"',
                                            err
                                        ]);
                                        loading--;
                                        return;
                                    }

                                    if (stat.isDirectory())
                                    {
                                        bypass(pathToDir + '/' + filename, path + filename);
                                        loading--;
                                        return;
                                    }

                                    var name = _path.basename(filename, _path.extname(filename)),
                                        view = new View();

                                    views[path + name] = view
                                        .setName(path + name)
                                        .setPathToTemplate(pathToDir + '/' + filename)
                                        .setRenderer(renderer)
                                    ;

                                    loading--;
                                });
                            });

                            loading--;
                        });
                    })(pathToViews);

                    loading--;
                });

                //
                // загрузка контроллеров
                //

                loading++;

                _path.exists(pathToControllers, function (exists)
                {
                    if (!exists)
                    {
                        loading--;
                        return;
                    }

                    loading++;

                    _package.requireDirR(pathToControllers, function (err, controllers_)
                    {
                        if (err)
                        {
                            errors = errors.concat(['возникли ошибки во время загрузки контроллеров'].concat(err));
                            loading--;
                        }

                        if (controllers_)
                        {
                            for (var controllerName in controllers_)
                            {
                                var controller_ = controllers_[controllerName],
                                    controller = new Controller();

                                controller
                                    .setName(controllerName)
                                    .setApp(app)
                                    .setRoutes(routes[controllerName] || {})
                                ;

                                controller_.call(controller, self);

                                controllers[controllerName] = controller;
                            }
                        }

                        loading--;
                    });

                    loading--;
                });

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
            }
        }, 0);

        return self;
    };

    /**
     * Получение всех моделей (async)
     *
     * @param {function} callback
     *
     * @return {*}
     */
    self.getModels = function (callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, models);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение модели (async)
     *
     * @param {string} modelName название модели
     * @param {function} callback
     *
     * @return {*}
     */
    self.getModel = function (modelName, callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, models[modelName]);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение всех видов (async)
     *
     * @param {function} callback
     *
     * @return {*}
     */
    self.getViews = function (callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, views);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение вида (async)
     *
     * @param {string} viewName название модели
     * @param {function} callback
     *
     * @return {*}
     */
    self.getView = function (viewName, callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, views[viewName]);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение всех контроллеров (async)
     *
     * @param {function} callback
     *
     * @return {*}
     */
    self.getControllers = function (callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, controllers);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение контроллера (async)
     *
     * @param {string} controllerName название контроллера
     * @param {function} callback
     *
     * @return {*}
     */
    self.getController = function (controllerName, callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, controllers[controllerName]);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение всех виджетов (async)
     *
     * @param {function} callback
     *
     * @returns {*}
     */
    self.getWidgets = function(callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, widgets);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение виджета
     *
     * @param {string} widgetName название виджета
     * @param {function} callback
     *
     * @returns {*}
     */
    self.getWidget = function(widgetName, callback)
    {
        setTimeout(function ()
        {
            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
                        return;
                    }

                    if (status !== 'success')
                    {
                        awaiting();
                        return;
                    }

                    callback(null, widgets[widgetName]);
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Запуск модуля (async)
     *
     * @param {function} callback
     *
     * @returns {*}
     */
    self.run = function (callback)
    {
        setTimeout(function ()
        {
            callback = callback || function () {};

            //
            // ожидание инициализации модуля
            //

            if (status === 'awaiting')
            {
                callback(['модуль не был проинициализирован']);
                return;
            }

            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (status === 'error')
                    {
                        callback(['модуль был проинициализирован с ошибками']);
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

                //
                // запуск контроллеров
                //

                for (var controllerName in controllers)
                {
                    var controller = controllers[controllerName];

                    loading++;

                    controller.run(function (err)
                    {
                        if (err)
                        {
                            errors = errors.concat(['не удалось запустить контроллер "' + controllerName + '"'].concat(err));
                        }

                        loading--;
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
        }, 0);

        return self;
    };

    /**
     * Отрисовка вида
     *
     * @param {string|object|undefined} viewName
     * @param {object|undefined} params
     *
     * @returns {*}
     */
    self.render = function (viewName, params)
    {
        setTimeout(function ()
        {
            if (typeof viewName === 'object')
            {
                params = viewName;
                viewName = 'index';
            }
            else
            {
                viewName = viewName || 'index';
                params = params || {};
            }

            var view = views[viewName];

            if (!view)
            {
                callback(['вид "' + viewName + '" не найден']);
                return;
            }

            view.render(params);
        }, 0);

        return self;
    };

    /**
     * Подключение ресурса из директории модуля
     *
     * @param {string} path путь к ресурсу
     * @param {object} params параметры
     * @param {function|undefined} callback
     *
     * @return {*}
     */
    self.require = function (path, params, callback)
    {
        if (typeof callback === 'function')
        {
            setTimeout(requireSource, 0);
            return self;
        }
        else
        {
            return requireSource();
        }

        function requireSource ()
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
            else if (path.indexOf(':widget') === 0)
            {
                path = path.replace(':widget', pathToWidgets);
            }
            else
            {
                path = pathToModule + '/' + path;
            }

            //
            // подключение ресурса
            //

            if (typeof callback === 'function')
            {
                _package.require(path, params, callback);
            }
            else
            {
                return _package.requireSync(path, params);
            }
        }
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
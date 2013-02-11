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
 *  {
 *      'controllerName1': {
 *          'actionName1': 'path1',
 *          'actionName2': 'path2',
 *           ...
 *          'actionNameN': 'pathN'
 *      },
 *      ...
 *      'controllerNameN': {
 *          ...
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

        status = 'init',   // состояние
        initProcesses = 0, // кол-во запущенных процессов инициализации

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
     * Задание названия модуля
     *
     * @param {string} name
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
     * @returns {Module}
     */
    self.setPathToModule = function (path)
    {
        if (status === 'run') return self;

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
     * @returns {Module}
     */
    self.setPathToWidgets = function (path)
    {
        if (status === 'run') return self;

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
     * @param {Application} app_
     *
     * @returns {Module}
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
     * @returns {Module}
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
    self.getRenderer = function()
    {
        return renderer;
    };

    /**
     * Задание маршруштов
     *
     * @param {object} routes_
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
     * @param {string} controllerName название контроллера
     * @param {string} actionName название экшена
     * @param {string|RegExp} path маршрут
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
     * @returns {object}
     */
    self.getRoutes = function ()
    {
        return routes;
    };

    /**
     * Добавление модели
     *
     * @param {string} modelName название модели
     * @param {Object} model модель
     * @param {Function} callback
     *
     * @returns {Module}
     */
    self.addModel = function (modelName, model, callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модуль уже запущен']);
            return self;
        }

        initProcesses++;

        setTimeout(function ()
        {
            //
            // проверка модели
            //

            if (!modelName)
            {
                initProcesses--;
                callback(['не задано название модели']);
                return;
            }

            if (!model)
            {
                initProcesses--;
                callback(['не задана модель']);
                return;
            }

            if (!model instanceof Object)
            {
                initProcesses--;
                callback(['недопустимый тип модели']);
                return;
            }

            //
            // добавление модели
            //

            models[modelName] = model;
            initProcesses--;
            callback(null, model);
        }, 0);

        return self;
    };

    /**
     * Добавление вида
     *
     * @param {View} view вид
     * @param {Function} callback
     *
     * @returns {Module}
     */
    self.addView = function (view, callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модуль уже запущен']);
            return self;
        }

        initProcesses++;

        setTimeout(function ()
        {
            //
            // проверка вида
            //

            if (!view)
            {
                initProcesses--;
                callback(['не задан вид']);
                return;
            }

            if (!view instanceof View)
            {
                initProcesses--;
                callback(['недопустимый тип вида']);
                return;
            }

            //
            // добавление вида
            //

            if (!view.getRenderer())
            {
                view.setRenderer(renderer);
            }

            views[view.getName()] = view;
            initProcesses--;
            callback(null, view);
        }, 0);

        return self;
    };

    /**
     * Добавление контроллера
     *
     * @param {Controller} controller контроллер
     * @param {Function} callback
     *
     * @returns {Module}
     */
    self.addController = function (controller, callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модуль уже запущен']);
            return self;
        }

        initProcesses++;

        setTimeout(function ()
        {
            //
            // проверка контроллера
            //

            if (!controller)
            {
                initProcesses--;
                callback(['не задан контроллер']);
                return;
            }

            if (!controller instanceof View)
            {
                initProcesses--;
                callback(['недопустимый тип контроллера']);
                return;
            }

            //
            // добавление контроллера
            //

            controllers[controller.getName()] = controller;
            initProcesses--;
            callback(null, controller);
        }, 0);

        return self;
    };

    /**
     * Инициализация модуля (async)
     *
     * @param {function|undefined} callback
     *
     * @returns {Module}
     */
    self.init = function (callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модуль уже запущен']);
            return self;
        }

        initProcesses++;

        setTimeout(function ()
        {
            //
            // проверка существования директории модуля
            //

            _path.exists(pathToModule, function (exists)
            {
                if (!exists)
                {
                    initProcesses--;
                    callback(['путь "' + pathToModule + '" не существует']);
                    return;
                }

                _fs.stat(pathToModule, function (err, stats)
                {
                    if (err)
                    {
                        initProcesses--;
                        callback(['возникла системная ошибка', err]);
                        return;
                    }

                    if (!stats.isDirectory())
                    {
                        initProcesses--;
                        callback(['путь "' + pathToModule + '" не корректен']);
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
                                var controller_ = controllers_[controllerName];

                                if (typeof controller_ === 'function')
                                {
                                    var controller = new Controller();

                                    controller
                                        .setName(controllerName)
                                        .setApp(app)
                                        .setRoutes(routes[controllerName] || {})
                                    ;

                                    controller_.call(controller, self);

                                    controllers[controllerName] = controller;
                                }
                            }
                        }

                        loading--;
                    });
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

                        initProcesses--;

                        if (errors.length)
                        {
                            callback(errors);
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
     * Получение всех моделей (async)
     *
     * @param {function} callback
     *
     * @return {object}
     */
    self.getModels = function (callback)
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
            (function awaiting ()
            {
                setTimeout(function ()
                {
                    if (initProcesses)
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
     * @return {object}
     */
    self.getViews = function (callback)
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
     * @return {View}
     */
    self.getView = function (viewName, callback)
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
     * @return {object}
     */
    self.getControllers = function (callback)
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
     * @return {Controller}
     */
    self.getController = function (controllerName, callback)
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
     * @returns {object}
     */
    self.getWidgets = function(callback)
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
     * @returns {Widget}
     */
    self.getWidget = function(widgetName, callback)
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
     * @returns {Module}
     */
    self.run = function (callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['модуль уже запущен']);
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
            // запуск модуля
            //

            function run ()
            {
                var errors = [],
                    loading = 0;

                //
                // запуск видов
                //

                for (var viewName in views)
                {
                    loading++;

                    views[viewName].run(function (err)
                    {
                        if (err)
                        {
                            errors = errors.concat(['возникли ошибки при запуске вида "' + viewName + '"', err]);
                        }

                        loading--;
                    });
                }

                //
                // запуск контроллеров
                //

                for (var controllerName in controllers)
                {
                    loading++;

                    controllers[controllerName].run(function (err)
                    {
                        if (err)
                        {
                            errors = errors.concat(['возникли ошибки при запуске контроллера "' + controllerName + '"', err]);
                        }

                        loading--;
                    });
                }

                //
                // ожидание окончания запуска компонентов
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

                        if (errors.length)
                        {
                            callback(errors);
                            return;
                        }

                        callback(null, self);
                    }, 0);
                })();
            }
        }, 0);

        return self;
    };

    /**
     * Отрисовка вида
     *
     * @param {string|object|function|undefined} viewName название вида
     * @param {object|function|undefined} params параметры для передачи в шаблон
     * @param {function|undefined} callback
     *
     * @returns {Module}
     */
    self.render = function (viewName, params, callback)
    {
        setTimeout(function ()
        {
            if (typeof viewName === 'object')
            {
                params = viewName;
                viewName = 'index';
                callback = function () {};
            }
            else if (typeof viewName === 'function')
            {
                callback = viewName;
                viewName = 'index';
                params = {};
            }
            else if (typeof params === 'function')
            {
                viewName = viewName || 'index';
                callback = params;
                params = {};
            }
            else
            {
                viewName = viewName || 'index';
                params = params || {};
                callback = callback || function () {};
            }

            var view = views[viewName];

            if (!view)
            {
                callback(['вид "' + viewName + '" не найден']);
                return;
            }

            view.render(params, callback);
        }, 0);

        return self;
    };

    /**
     * Подключение ресурса из директории модуля
     *
     * @param {String} path путь к ресурсу
     * @param {Object|Function|undefined} params параметры
     * @param {Function|undefined} callback
     *
     * @return {Module|*}
     */
    self.require = function (path, params, callback)
    {
        if (typeof params === 'function')
        {
            callback = params;
        }

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
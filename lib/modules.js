/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 */

var _fs = require('fs'),
    _package = require('./utils/package'),

    swift,
    config = {},
    modules = {};

var __modules = module.exports = exports = function (swift_)
{
    swift = swift_;
    config = swift_.config;

    return __modules;
};

/**
 * Загрузка модуля
 *
 * @param alias псевдоним модуля
 * @param callback
 *
 * @return {Function}
 */
__modules.load = function (alias, callback)
{
    var modulePath = config.path.modules + '/' + alias.split('.').join('/modules/'),
        controllerPath = modulePath + '/controller',
        modelPath = modulePath + '/model',
        viewPath = modulePath + '/view',

        modul = {},
        controllers = {},
        models = {};

    //
    // загрузка моделей
    //

    _package.requireDirR(modelPath, {}, function (result)
    {
        if (result.status === 'error')
        {
            result.messages.push('Не удалось загрузить модуль "' + alias + '". Произошла ошибка при загрузке моделей.');
            console.log(result.messages.join('\n') + '\n');

            if (typeof callback === 'function')
            {
                callback({
                    status: 'error',
                    messages: result.messages
                });
            }

            return;
        }

        models = result.data;

        //
        // загрузка контроллеров
        //

        _package.requireDirR(controllerPath, {}, function (result)
        {
            if (result.status === 'error')
            {
                result.messages.push('Не удалось загрузить модуль "' + alias + '". Произошла ошибка при загрузке контроллеров.');
                console.log(result.messages.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback({
                        status: 'error',
                        messages: result.messages
                    });
                }

                return;
            }

            controllers = result.data;

            modules.__defineGetter__(alias, function ()
            {
                return modul;
            });

            //
            // определение функционала
            //

            /**
             * Получение псевдонима модуля
             *
             * @return {*}
             */
            modul.getAlias = function ()
            {
                return alias;
            };

            /**
             * Получение пути к директории модуля
             *
             * @return {*}
             */
            modul.getModulePath = function ()
            {
                return modulePath;
            };

            /**
             * Получение пути к директории моделей
             *
             * @return {*}
             */
            modul.getModelPath = function ()
            {
                return modelPath;
            };

            /**
             * Получение пути к директории видов
             *
             * @return {*}
             */
            modul.getViewPath = function ()
            {
                return viewPath;
            };

            /**
             * Получение пути к директории контроллеров
             *
             * @return {*}
             */
            modul.getControllerPath = function ()
            {
                return controllerPath;
            };

            /**
             * Получене всех моделей
             *
             * @return {{}}
             */
            modul.getModels = function ()
            {
                return models.get();
            };

            /**
             * Получение модели
             *
             * @param path путь к модели
             * @param callback
             *
             * @return {*}
             */
            modul.getModel = function (path, callback)
            {
                return models.get(path, function (result)
                {
                    if (result.status === 'error')
                    {
                        result.messages.push('Не удалось получить модель "' + path + '". Модель не найдена.');
                        console.log(result.messages.join('\n') + '\n');

                        if (typeof callback === 'function')
                        {
                            callback({
                                status: 'error',
                                messages: result.messages
                            });
                        }

                        return undefined;
                    }

                    if (typeof callback === 'function')
                    {
                        callback({
                            status: 'success',
                            messages: result.data
                        });
                    }

                    return result.data;
                });
            };

            /**
             * Получение всех контроллеров
             *
             * @return {{}}
             */
            modul.getControllers = function ()
            {
                return controllers.get();
            };

            /**
             * Получение контроллера
             *
             * @param path путь к контроллеру
             * @param callback
             *
             * @return {*}
             */
            modul.getController = function (path, callback)
            {
                return controllers.get(path, function (result)
                {
                    if (result.status === 'error')
                    {
                        result.messages.push('Не удалось получить контроллер "' + path + '". Контроллер не найден.');
                        console.log(result.messages.join('\n') + '\n');

                        if (typeof callback === 'function')
                        {
                            callback({
                                status: 'error',
                                messages: result.messages
                            });
                        }

                        return undefined;
                    }

                    if (typeof callback === 'function')
                    {
                        callback({
                            status: 'success',
                            messages: result.data
                        });
                    }

                    return result.data;
                });
            };

            /**
             * Отрисовка вида
             *
             * @param viewName
             * @param params
             */
            modul.render = function (viewName, params)
            {
                viewName = viewName || 'index';
                params = params || {};

                swift.res.render(viewPath + '/' + viewName, params);

                return modul;
            };
        });
    });

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    if (typeof callback === 'function')
    {
        callback({
            status: 'success',
            data: __modules
        });
    }

    return __modules;
};

/**
 * Запуск модулей
 */
__modules.run = function ()
{
    var routes = JSON.parse(_fs.readFileSync(config.path.config + '/routes.json', 'UTF-8'));

    for (var alias in modules)
    {
        var modul = modules[alias];

        for (var routeAlias in routes)
        {
            var route = routes[routeAlias];

            if ((route.module || 'index') === modul.getAlias())
            {
                var controller = modul.getController(route.controller || 'index') || {},
                    action = controller[(route.action || 'index') + 'Action'];

                if (!action)
                {
                    return;
                }

                modul.post = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(route.path);

                    swift.app.post.apply(swift.app, args);
                };

                modul.get = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(route.path);

                    swift.app.get.apply(swift.app, args);
                };

                modul.put = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(route.path);

                    swift.app.put.apply(swift.app, args);
                };

                modul.delete = function ()
                {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(route.path);

                    swift.app.delete.apply(swift.app, args);
                };

                action(modul);
            }
        }
    }
};

/**
 * Получение модуля
 *
 * @param path путь к модулю
 * @param callback
 *
 * @return {*}
 */
__modules.get = function (path, callback)
{
    if (typeof path === 'function')
    {
        callback = path;
        path = undefined;
    }

    //
    // получение указанного модуля
    //

    if (path !== undefined)
    {
        if (modules[path] === undefined)
        {
            var messages = ['Не удалось получить модуль. Модуль "' + path + '" не найден.'];
            console.log(messages.join('\n') + '\n');

            if (typeof callback === 'function')
            {
                callback({
                    status: 'error',
                    messages: messages
                });
            }

            return undefined;
        }

        if (typeof callback === 'function')
        {
            callback({
                status: 'success',
                data: modules[path]
            });
        }

        return modules[path];
    }

    //
    // получение всех модулей
    //

    if (typeof callback === 'function')
    {
        callback({
            status: 'success',
            data: modules
        });
    }

    return modules;
};
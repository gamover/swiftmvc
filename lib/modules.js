/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 */

var _fs = require('fs'),
    _callback = require('./utils/callback'),
    _jsmodule = require('./utils/jsmodule'),

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
{callback = _callback(callback);
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

    _jsmodule.requireDirR(modelPath, {
        'flat': true
    }, function (result)
    {
        if (result.status === 'error')
        {
            result.messages.push('Не удалось загрузить модуль "' + alias + '". Произошла ошибка при загрузке моделей.');
            console.log(result.messages.join('\n') + '\n');

            callback({
                status: 'error',
                messages: result.messages
            });

            return;
        }

        models = result.data;

        //
        // загрузка контроллеров
        //

        _jsmodule.requireDir(controllerPath, true, function (result)
        {
            if (result.status === 'error')
            {
                result.messages.push('Не удалось загрузить модуль "' + alias + '". Произошла ошибка при загрузке контроллеров.');
                console.log(result.messages.join('\n') + '\n');

                callback({
                    status: 'error',
                    messages: result.messages
                });

                return;
            }

            controllers = result.data;

            modules[alias] = modul;

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
             * @param callback
             *
             * @return {{}}
             */
            modul.getModels = function (callback)
            {callback = _callback(callback);

                callback({
                    status: 'success',
                    data: models
                });

                return models;
            };

            /**
             * Получение модели
             *
             * @param modelAlias псевдоним модели
             * @param callback
             *
             * @return {*}
             */
            modul.getModel = function (modelAlias, callback)
            {callback = _callback(callback);

                if (models[modelAlias] === undefined)
                {
                    var messages = ['Не удалось получить модель "' + modelAlias + '". Модель не найдена.'];
                    console.log(messages.join('\n') + '\n');

                    callback({
                        status: 'error',
                        messages: messages
                    });

                    return undefined;
                }

                var model = models[modelAlias];

                callback({
                    status: 'success',
                    data: model
                });

                return model;
            };

            /**
             * Получение всех контроллеров
             *
             * @param callback
             *
             * @return {{}}
             */
            modul.getControllers = function (callback)
            {callback = _callback(callback);

                callback({
                    status: 'success',
                    data: controllers
                });

                return controllers;
            };

            /**
             * Получение контроллера
             *
             * @param controllerName название контроллера
             * @param callback
             *
             * @return {*}
             */
            modul.getController = function (controllerName, callback)
            {callback = _callback(callback);

                if (controllers[controllerName] === undefined)
                {
                    var messages = ['Не удалось получить контроллер "' + controllerName + '". Контроллер не найден.'];
                    console.log(messages.join('\n') + '\n');

                    callback({
                        status: 'error',
                        messages: messages
                    });

                    return undefined;
                }

                var controller = controllers[controllerName];

                callback({
                    status: 'success',
                    data: controller
                });

                return controller;
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

    callback({
        status: 'success',
        data: __modules
    });

    return __modules;
};

/**
 * Запуск модулей
 */
__modules.run = function ()
{
    var routes = JSON.parse(_fs.readFileSync(config.path.config + '/routes.json', 'UTF-8'));

    for (var moduleAlias in modules)
    {
        var modul = modules[moduleAlias];

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
 * @param alias псевдоним модуля
 * @param callback
 *
 * @return {*}
 */
__modules.get = function (alias, callback)
{
    if (typeof alias === 'string')
    {callback = _callback(callback);

        //
        // получение указанного модуля
        //

        if (modules[alias] === undefined)
        {
            var messages = ['Не удалось получить модуль. Модуль "' + alias + '" не найден.'];
            console.log(messages.join('\n') + '\n');

            callback({
                status: 'error',
                messages: messages
            });

            return undefined;
        }

        var mod = modules[alias];

        callback({
            status: 'success',
            data: mod
        });

        return mod;
    }

    callback = _callback(alias);

    //
    // получение всех модулей
    //

    callback({
        status: 'success',
        data: modules
    });

    return modules;
};
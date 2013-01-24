/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 */

var _config = require('./config'),
    _callback = require('./utils/callback'),
    _jsmodule = require('./utils/jsmodule'),

    swift;

/**
 * Создание модуля
 *
 * @param alias псевдоним модуля
 * @param callback
 *
 * @return {{}}
 */
module.exports = exports = function (alias, callback)
{callback = _callback(callback);

    var modulePath = _config.path.modules + '/' + alias.split('.').join('/modules/'),
        controllerPath = modulePath + '/controller',
        modelPath = modulePath + '/model',
        viewPath = modulePath + '/view',

        modul = {},
        controllers = {},
        models = {};

    //
    // загрузка моделей
    //

    _jsmodule.requireDirectory(modelPath, true, function (result)
    {
        if (result.status === 'error')
        {
            result.messages.push('Не удалось собрать MVC-модуль "' + alias + '". Произошла ошибка при загрузке моделей.');
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

        _jsmodule.requireDirectory(controllerPath, true, function (result)
        {
            if (result.status === 'error')
            {
                result.messages.push('Не удалось собрать MVC-модуль "' + alias + '". Произошла ошибка при загрузке контроллеров.');
                console.log(result.messages.join('\n') + '\n');

                callback({
                    status: 'error',
                    messages: result.messages
                });

                return;
            }

            controllers = result.data;
        });
    });

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
     * @param modelName название модели
     * @param callback
     *
     * @return {*}
     */
    modul.getModel = function (modelName, callback)
    {callback = _callback(callback);

        if (models[modelName] === undefined)
        {
            var messages = ['Не удалось получить модель "' + modelName + '". Модель не найдена.'];
            console.log(messages.join('\n') + '\n');

            callback({
                status: 'error',
                messages: messages
            });

            return undefined;
        }

        var model = models[modelName];

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

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    callback({
        status: 'success',
        data: modul
    });

    return modul;
};

/**
 * Инициализация
 *
 * @param sw
 */
exports.init = function (sw)
{
    swift = sw;
};
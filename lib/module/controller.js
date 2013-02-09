/**
 * Author: G@mOBEP
 * Date: 07.02.13
 * Time: 21:08
 *
 * Пакет описывающий контроллер фреймворка Swift.
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

__controller.Controller = function ()
{
    countControllers++;

    var self = this,

        controllerName = 'SwiftController' + countControllers,
        app,
        actions = {},
        routes = {};

    /**
     * Задание названия контроллера
     *
     * @param {string} name
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
     * Задание приложения
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
     * Получение приложения
     *
     * @returns {object}
     */
    self.getApp = function ()
    {
        return app;
    };

    /**
     * Добавление экшена
     *
     * @param {string} actionName название экшена
     * @param {function} action функция-экшен
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
     * @returns {object}
     */
    self.getActions = function ()
    {
        return actions;
    };

    /**
     * Получение экшена
     *
     * @param {string} actionName название экшена
     *
     * @returns {function|undefined}
     */
    self.getAction = function (actionName)
    {
        return actions[actionName];
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
     * @param {string} actionName название экшена
     * @param {string|RegExp} path маршрут
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
     * @returns {object}
     */
    self.getRoutes = function ()
    {
        return routes;
    };

    /**
     * Запуск контроллера
     *
     * @param {function|undefined} callback
     *
     * @returns {*}
     */
    self.run = function (callback)
    {
        setTimeout(function ()
        {
            callback = callback || function () {};

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

                /*action.render = function (viewName, params)
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
                 };*/

                action.call(action, action);
            }

            callback();
        }, 0);

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
/**
 * Author: G@mOBEP
 * Date: 07.02.13
 * Time: 21:08
 *
 * Контроллер Swift.
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

        status = 'init', // состояние

        controllerName = 'SwiftController' + countControllers,

        app,
        routes = {},
        actions = {};

    /**
     * Задание названия контроллера
     *
     * @param {string} name
     *
     * @returns {Controller}
     */
    self.setName = function (name)
    {
        if (status === 'run') return self;

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
     * @param {Application} app_
     *
     * @returns {Controller}
     */
    self.setApp = function (app_)
    {
        if (status === 'run') return self;

        app = app_;

        return self;
    };

    /**
     * Получение приложения
     *
     * @returns {Application}
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
     * @returns {Controller}
     */
    self.addAction = function (actionName, action)
    {
        if (status === 'run') return self;

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
     * @returns {Controller}
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
     * @param {string} actionName название экшена
     * @param {string|RegExp} path маршрут
     *
     * @returns {Controller}
     */
    self.addRoute = function (actionName, path)
    {
        if (status === 'run') return self;

        if (!actionName || !path)
        {
            return self;
        }

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
     * @returns {Controller}
     */
    self.run = function (callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['контроллер уже запущен']);
            return self;
        }

        status = 'run';

        setTimeout(function ()
        {
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

                action.call(action, self);
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
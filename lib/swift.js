/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 */

var _express = require('express'),
    _path = require('path'),
    _fs = require('fs'),
    _callback = require('./utils/callback'),

    _module = require('./module'),
    _lib = require('./lib');

/**
 * Инициализация
 *
 * @type {Function}
 */
var swift = module.exports = exports = function (projectPath)
{
    projectPath = projectPath || _path.resolve(__dirname + '/../../..');

    //
    // задание параметров
    //

    var config = JSON.parse(_fs.readFileSync(projectPath + '/app/config/config.json', 'UTF-8')),
        modules = {},
        viewHelpers = _lib.require('helpers.view');

    //
    // установка путей
    //

    config.path = config.path || {};
    config.path.project = projectPath;
    config.path.app = projectPath + '/app';
    config.path.modules = projectPath + '/app/modules';
    config.path.config = projectPath + '/app/config';

    //
    // задание функциональных элементов
    //

    swift.express = _express;
    swift.app = _express();
    swift.lib = _lib;
    swift.config = config;

    /**
     * Загрузка модуля
     *
     * @param alias псевдоним модуля
     * @param callback
     *
     * @return {Function}
     */
    swift.loadModule = function (alias, callback)
    {callback = _callback(callback);

        _module.create(alias, function (result)
        {
            if (result.status === 'error')
            {
                result.messages.push('Не удалось загрузить модуль "' + alias + '".');
                console.log(result.messages.join('\n') + '\n');

                callback({
                    status: 'error',
                    messages: result.messages
                });

                return;
            }

            var modul = result.data,
                routes = JSON.parse(_fs.readFileSync(swift.config.path.config + '/routes.json', 'UTF-8'));

            modules[alias] = modul;

            //
            // распределение маршрутов
            //

            for (var routeAlias in routes)
            {
                var route = routes[routeAlias];
                if ((route.module || alias) === alias)
                {
                    var controller = modul.getController(route.controller || 'index'),
                        action = controller[(route.action || 'index') + 'Action'];

                    if (action !== undefined)
                    {
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

            callback({
                status: 'success',
                data: swift
            });
        });

        return swift;
    };

    /**
     * Получение модуля
     *
     * @param alias псевдоним модуля
     * @param callback
     *
     * @return {*}
     */
    swift.getModule = function (alias, callback)
    {callback = _callback(callback);

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
    };

    /**
     * Получение всех модулей
     *
     * @param callback
     *
     * @return {{}}
     */
    swift.getModules = function (callback)
    {callback = _callback(callback);

        callback({
            status: 'success',
            data: modules
        });

        return modules;
    };

    /**
     * Middleware роутер
     *
     * @param req
     * @param res
     * @param next
     */
    swift.router = function (req, res, next)
    {
        res.locals.swift = {
            'helpers': viewHelpers
        };

        swift.req = req;
        swift.res = res;

        next();
    };

    /**
     * Middleware добавление слеша в конец маршрута
     *
     * @param req
     * @param res
     * @param next
     */
    swift.endslash = function (req, res, next)
    {
        if (!~req.url.indexOf('?') && req.path.match(/[^\/]$/))
        {
            res.redirect(req.path + '/');

            return;
        }

        next();
    };

    _lib(swift.config);
    _module(swift);

    return swift.app;
};
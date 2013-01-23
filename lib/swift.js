/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 */

var _express = require('express'),
    _path = require('path'),

    _lib = require('./lib'),
    _callback = require('./utils/callback'),
    _config = require('./config'),
    _modul = require('./module'),

    modules = {};

/**
 * Инициализация
 *
 * @type {Function}
 */
var swift = module.exports = exports = function ()
{
    swift.setProjectPath();

    swift.app = _express();

    _modul.init(swift);

    return swift.app;
};

swift.express = _express;
swift.lib = _lib;
swift.config = _config;

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

    _modul(alias, function (result)
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
            routes = require(_config.path.config + '/routes');

        modules[alias] = modul;

        //
        // распределение маршрутов
        //

        for (var routeAlias in routes)
        {
            var route = routes[routeAlias];
            if (route.module === alias)
            {
                var controller = modul.getController(route.controller);
                if (controller !== null)
                {
                    var action = controller[route.action + 'Action'] || null;
                    if (action !== null)
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

    if (typeof modules[alias] === 'undefined')
    {
        var messages = ['Не удалось получить модуль. Модуль "' + alias + '" не найден.'];
        console.log(messages.join('\n') + '\n');

        callback({
            status: 'error',
            messages: messages
        });

        return null;
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
 * Задание пути к директории проекта
 *
 * @param projectPath
 * @return {Function}
 */
swift.setProjectPath = function (projectPath)
{
    _config.path.project = projectPath || _path.resolve(_config.path.swift + '/../..');
    _config.path.app = _config.path.project + '/app';
    _config.path.modules = _config.path.app + '/modules';
    _config.path.config = _config.path.app + '/config';

    return swift;
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
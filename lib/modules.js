/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 */

var Module = require('./module.js').Module;

var __modules = module.exports = exports;

__modules.Modules = function ()
{
    var self = this,

        app,
        router,

        pathToModules,
        routes,

        modules = {};

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
     * Задание пути к директории в которой размещены модули
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToModules = function (path)
    {
        pathToModules = path;

        return self;
    };

    /**
     * Получение пути к директории в которой размещены модули
     *
     * @returns {*}
     */
    self.getPathToModules = function ()
    {
        return pathToModules;
    };

    /**
     * Задание объекта маршрутов
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
     * Получение объекта маршрутов
     *
     * @returns {*}
     */
    self.getRoutes = function ()
    {
        return routes;
    };

    /**
     * Загрузка модуля
     *
     * @param alias псевдоним модуля
     * @param callback
     *
     * @returns {*}
     */
    self.load = function (alias, callback)
    {
        var pathToModule = pathToModules + '/' + alias.split('.').join('/modules/');

        new Module()
            .setApp(app)
            .setRouter(router)
            .setName(alias)
            .setPathToModule(pathToModule)
            .init(function (err, modul)
            {
                if (err)
                {
                    err.push('Во время загрузки модуля "' + alias + '" возникли ошибки');
                    console.log(err.join('\n') + '\n');

                    if (typeof callback === 'function')
                    {
                        callback(err);
                    }

                    return;
                }

                modules[alias] = modul;

                if (typeof callback === 'function')
                {
                    callback(undefined, self);
                }
            })
        ;

        return self;
    };

    /**
     * Получение модуля
     *
     * @param path путь к модулю
     * @param callback
     *
     * @return {*}
     */
    self.get = function (path, callback)
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
                    callback(messages);
                }

                return undefined;
            }

            if (typeof callback === 'function')
            {
                callback(undefined, modules[path]);
            }

            return modules[path];
        }

        //
        // получение всех модулей
        //

        if (typeof callback === 'function')
        {
            callback(undefined, modules);
        }

        return modules;
    };

    /**
     * Запуск модулей
     */
    self.run = function ()
    {
        for (var alias in modules)
        {
            var modul = modules[alias];

            for (var routeAlias in routes)
            {
                var route = routes[routeAlias];

                if ((route.module || 'index') === modul.getName())
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

                        return app.post.apply(app, args);
                    };

                    modul.get = function ()
                    {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(route.path);

                        return app.get.apply(app, args);
                    };

                    modul.put = function ()
                    {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(route.path);

                        return app.put.apply(app, args);
                    };

                    modul.delete = function ()
                    {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(route.path);

                        return app.delete.apply(app, args);
                    };

                    modul.render = function (viewName, params)
                    {
                        viewName = viewName || 'index';
                        params = params || {};

                        return router.getResponse().render(this.getPathToViews() + '/' + viewName, params);
                    };

                    action.call(modul, modul);
                }
            }
        }
    };
};
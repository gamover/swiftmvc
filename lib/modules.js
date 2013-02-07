/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 */

var __modules = module.exports = exports,

    _http = require('http'),

    Module = require('./module.js').Module;

__modules.Modules = function ()
{
    var self = this,

        app,
        router,
        config,

        pathToModules,
        routes,

        loadingModules = 0,
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
     * Задание конфигурации
     *
     * @param config_
     *
     * @returns {*}
     */
    self.setConfig = function (config_)
    {
        config = config_;

        return self;
    };

    /**
     * Получение конфигурации
     *
     * @returns {*}
     */
    self.getConfig = function ()
    {
        return config;
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
        loadingModules++;

        setTimeout(function()
        {
            var pathToModule = pathToModules + '/' + alias.split('.').join('/modules/');

            new Module()
                .setApp(app)
                .setRouter(router)
                .setName(alias)
                .setPathToModule(pathToModule)
                .init(function (err, modul)
                {
                    if (typeof callback === 'function')
                    {
                        callback(err, self);
                    }

                    modules[alias] = modul;

                    loadingModules--;
                })
            ;
        }, 0);

        return self;
    };

    /**
     * Получение модуля
     *
     * @param path путь к модулю
     *
     * @return {*}
     */
    self.get = function (path)
    {
        //
        // получение указанного модуля
        //

        if (path !== undefined)
        {
            if (modules[path] === undefined)
            {
                console.log('Не удалось получить модуль. Модуль "' + path + '" не найден.');
                return;
            }

            return modules[path];
        }

        //
        // получение всех модулей
        //

        return modules;
    };

    /**
     * Запуск модулей
     *
     * @returns {*}
     */
    self.run = function (callback)
    {
        /**
         * Ожидание загрузки всех модулей
         */
        (function loop ()
        {
            setTimeout(function ()
            {
                if (loadingModules) return loop();

                afterLoadingModules();
            }, 0);
        })();

        /**
         * Запуск модулей после загрузки
         */
        function afterLoadingModules ()
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

            if (typeof callback === 'function')
            {
                callback(null, self);
            }

            _http.createServer(app).listen(app.set('port'), config.server.ip, function() {
                var text = '= Swift server listening on port ' + app.set('port') + ' =',
                    line = Array.prototype.map.call(text, function() { return '='; }).join('');

                console.log(line);
                console.log(text);
                console.log(line);
                console.log('');
            });
        }

        return self;
    };
};
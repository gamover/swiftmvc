/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 *
 * Swift - MVC-фреймворк на основе Express.
 */

var _express = require('express'),
    _path = require('path'),
    _fs = require('fs'),

    _package = require('./utils/package'),

    Router = require('./router').Router,
    Modules = require('./modules').Modules,
    Renderer = require('./renderer').Renderer,
    ViewHelpers = require('./viewHelpers').ViewHelpers;

var __swift = module.exports = exports = function (pathToAppConfig)
{
    //
    // определение пути к файлу настроек
    //

    pathToAppConfig = pathToAppConfig || _path.normalize(__dirname + '/../../../app/config/config.json');

    //
    ////
    //

    var app = _express(),
        router = new Router(),
        modules = new Modules(),
        renderer = new Renderer(),
        viewHelpers = new ViewHelpers(),

        config = JSON.parse(_fs.readFileSync(__dirname + '/config.json', 'UTF-8')),

        pathToAppConfigDir = _path.dirname(pathToAppConfig),
        pathToRoutes = pathToAppConfigDir + '/routes.json',

        appConfig = {},
        routes = {};

    //
    // загрузка файлов настроек и маршрутов
    //

    if (_path.existsSync(pathToAppConfig))
    {
        if (_fs.statSync(pathToAppConfig).isFile() && _path.extname(pathToAppConfig) === '.json')
        {
            appConfig = JSON.parse(_fs.readFileSync(pathToAppConfig, 'UTF-8'));

            ///
            // сборка конфигурации
            //
            (function (config_, configApp_)
            {
                config = {};

                (function prepareConfig (obj, objApp)
                {
                    for (var key in objApp)
                    {
                        if (obj['_' + key] === undefined && key[0] !== '_')
                        {
                            if (typeof objApp[key] === 'object')
                            {
                                if (obj[key] === undefined)
                                {
                                    obj[key] = {};
                                }

                                prepareConfig(obj[key], objApp[key]);
                            }
                            else
                            {
                                obj[key] = objApp[key];
                            }
                        }
                    }
                })(config_, configApp_);

                (function filterConfig (obj, objSrc)
                {
                    for (var key in objSrc)
                    {
                        var newKey = key;
                        if (newKey[0] === '_')
                        {
                            newKey = newKey.substring(1);
                        }

                        if (typeof objSrc[key] === 'object')
                        {
                            obj[newKey] = {};

                            filterConfig(obj[newKey], objSrc[key]);
                        }
                        else
                        {
                            obj[newKey] = objSrc[key];
                        }
                    }
                })(config, config_);
            })(config, appConfig);
        }

        if (_fs.statSync(pathToRoutes).isFile() && _path.extname(pathToRoutes) === '.json')
        {
            var routes_ = JSON.parse(_fs.readFileSync(pathToRoutes, 'UTF-8'));

            viewHelpers.setRoutes(routes_);

            for (var alias in routes_)
            {
                var route = routes_[alias],
                    modulName = route.module || 'index',
                    controllerName = route.controller || 'index',
                    actionName = route.action || 'index',
                    path = route.path || '/';

                routes[modulName] = routes[modulName] || {};
                routes[modulName][controllerName] = routes[modulName][controllerName] || {};
                routes[modulName][controllerName][actionName] = path;
            }
        }
    }

    //
    // задание путей в настройках
    //

    config.path = typeof config.path === 'object' ? config.path : {};
    config.path.project = config.path.project || _path.resolve(pathToAppConfigDir + '/../..');
    config.path.app = config.path.app || config.path.project + '/app';
    config.path.modules = config.path.modules || config.path.project + '/app/modules';
    config.path.config = pathToAppConfigDir;
    config.path.swift = _path.resolve(__dirname + '/..');
    config.path.lib = _path.resolve(__dirname);

    //
    // настройка приложения
    //

    app.set('port', process.env.PORT || config.server.port);
    app.set('views', config.path.app + '/view');

    //
    // инициализация роутера
    //

    router
        .use(function (req, res, next)
        {
            res.locals.swift = {
                'helpers': viewHelpers
            };

            next();
        })
    ;

    //
    // инициализация отрисовщика видов
    //

    renderer
        .setRouter(router)
    ;

    //
    // инициализация набора модулей
    //

    modules
        .setIp(config.server.ip)
        .setPathToModules(config.path.modules)
        .setApp(app)
        .setRenderer(renderer)
        .setRoutes(routes)
    ;

    //
    // задание функциональных элементов
    //

    __swift.express = _express;
    __swift.app = app;
    __swift.config = config;
    __swift.modules = modules;
    __swift.router = router;

    return app;
};

/**
 * Подключение ресурса из директории проекта
 *
 * @param {String} path путь к ресурсу
 * @param {Object|Function|undefined} params параметры
 * @param {Function|undefined} callback
 *
 * @return {*}
 */
__swift.require = function (path, params, callback)
{
    if (typeof params === 'function')
    {
        callback = params;
    }

    if (typeof callback === 'function')
    {
        setTimeout(requireSource, 0);
        return __swift;
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

        if (path.indexOf(':app') === 0)
        {
            path = path.replace(':app', __swift.config.path.app);
        }
        else if (path.indexOf(':modules') === 0)
        {
            path = path.replace(':modules', __swift.config.path.modules);
        }
        else if (path.indexOf(':config') === 0)
        {
            path = path.replace(':config', __swift.config.path.config);
        }
        else if (path.indexOf(':swift') === 0)
        {
            path = path.replace(':swift', __swift.config.path.swift);
        }
        else if (path.indexOf(':lib') === 0)
        {
            path = path.replace(':lib', __swift.config.path.lib);
        }
        else
        {
            path = __swift.config.path.project + '/' + path;
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

    return __swift;
};
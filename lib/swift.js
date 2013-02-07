/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 */

var _express = require('express'),
    _path = require('path'),
    _fs = require('fs'),

    _package = require('./utils/package'),

    Router = require('./router').Router,
    Modules = require('./modules').Modules;

var __swift = module.exports = exports = function (pathToAppConfig)
{
    //
    // определение пути к файлу настроек
    //

    pathToAppConfig = pathToAppConfig || _path.resolve(__dirname + '/../../../app/config/config.json');

    //
    ////
    //

    var app = _express(),
        router = new Router(),
        modules = new Modules(),

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
        if (_fs.lstatSync(pathToAppConfig).isFile() && _path.extname(pathToAppConfig) === '.json')
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

        if (_fs.lstatSync(pathToRoutes).isFile() && _path.extname(pathToRoutes) === '.json')
        {
            routes = JSON.parse(_fs.readFileSync(pathToRoutes, 'UTF-8'));
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
    // инициализация объекта роутера
    //

    router.setConfig(config);

    //
    // инициализация объекта модулей
    //

    modules
        .setApp(app)
        .setRouter(router)
        .setConfig(config)
        .setPathToModules(config.path.modules)
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
 * @param path путь к ресурсу
 * @param params параметры
 * @param callback
 *
 * @return {*}
 */
__swift.require = function (path, params, callback)
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

    return _package.require(path, params, callback);
};
/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 */

var _express = require('express'),
    _path = require('path'),
    _fs = require('fs'),

    _package = require('./utils/package'),

    Modules = require('./modules.js').Modules;

module.exports = new function ()
{
    var self = this,

        app = _express(),
        config = JSON.parse(_fs.readFileSync(__dirname + '/config.json', 'UTF-8')),
        router = {};

    /**
     * Инициализация
     *
     * @param pathToAppConfig
     *
     * @returns {*}
     */
    self.init = function (pathToAppConfig)
    {
        //
        // определение пути к файлу настроек
        //

        pathToAppConfig = pathToAppConfig || _path.resolve(__dirname + '/../../../app/config/config.json');

        if (!_path.existsSync(pathToAppConfig) || _path.extname(pathToAppConfig) !== '.json')
        {
            return undefined;
        }

        //
        ////
        //

        var pathToConfigDir = _path.dirname(pathToAppConfig),
            configApp = JSON.parse(_fs.readFileSync(pathToAppConfig, 'UTF-8')),
            routes = JSON.parse(_fs.readFileSync(pathToConfigDir + '/routes.json', 'UTF-8'));

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
        })(config, configApp);

        //
        //задание путей
        //

        config.path = typeof config.path === 'object' ? config.path : {};
        config.path.project = config.path.project || _path.resolve(pathToConfigDir + '/../..');
        config.path.app = config.path.app || config.path.project + '/app';
        config.path.modules = config.path.modules || config.path.project + '/app/modules';
        config.path.config = pathToConfigDir;
        config.path.swift = _path.resolve(__dirname + '/..');
        config.path.lib = _path.resolve(__dirname);

        //
        // инициализация объекта модулей
        //

        var modules = new Modules();
        modules
            .setApp(app)
            .setPathToModules(config.path.modules)
            .setRoutes(routes)
            .setRouter(router)
        ;

        //
        // задание функциональных элементов
        //

        self.express = _express;
        self.app = app;
        self.config = config;
        self.modules = modules;

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
     * Middleware роутер
     *
     * @param req
     * @param res
     * @param next
     */
    self.router = function (req, res, next)
    {
        res.locals.swift = {
            'helpers': new (require('./viewHelpers').ViewHelpers)(config)
        };

        router.req = req;
        router.res = res;

        next();
    };

    /**
     * Middleware добавление слеша в конец маршрута
     *
     * @param req
     * @param res
     * @param next
     */
    self.endslash = function (req, res, next)
    {
        if (!~req.url.indexOf('?') && req.path.match(/[^\/]$/))
        {
            res.redirect(req.path + '/');

            return;
        }

        next();
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
    self.require = function (path, params, callback)
    {
        //
        // парсинг токенов
        //

        if (path.indexOf(':app') === 0)
        {
            path = path.replace(':app', config.path.app);
        }
        else if (path.indexOf(':modules') === 0)
        {
            path = path.replace(':modules', config.path.modules);
        }
        else if (path.indexOf(':config') === 0)
        {
            path = path.replace(':config', config.path.config);
        }
        else if (path.indexOf(':swift') === 0)
        {
            path = path.replace(':swift', config.path.swift);
        }
        else if (path.indexOf(':lib') === 0)
        {
            path = path.replace(':lib', config.path.lib);
        }
        else
        {
            path = self.config.path.project + '/' + path;
        }

        //
        // подключение ресурса
        //

        return _package.require(path, params, callback);
    };
};
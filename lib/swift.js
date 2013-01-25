/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 */

var _express = require('express'),
    _path = require('path'),
    _fs = require('fs'),

    _modules = require('./modules'),
    _lib = require('./lib'),
    _package = require('./utils/package');

/**
 * Инициализация
 *
 * @type {Function}
 */
var __swift = module.exports = exports = function (projectPath)
{
    projectPath = projectPath || _path.resolve(__dirname + '/../../..');

    var config = JSON.parse(_fs.readFileSync(__dirname + '/config.json', 'UTF-8')),
        configApp = JSON.parse(_fs.readFileSync(projectPath + '/app/config/config.json', 'UTF-8')),
        viewHelpers = _lib.require('helpers.view');

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
    // установка путей
    //

    config.path = typeof config.path === 'object' ? config.path : {};
    config.path.project = projectPath;
    config.path.app = projectPath + '/app';
    config.path.modules = projectPath + '/app/modules';
    config.path.config = projectPath + '/app/config';
    config.path.swift = _path.resolve(__dirname + '/..');

    //
    // задание функциональных элементов
    //

    __swift.express = _express;
    __swift.app = _express();
    __swift.lib = _lib;
    __swift.config = config;
    __swift.modules = _modules;

    _lib(__swift);
    _modules(__swift);

    /**
     * Middleware роутер
     *
     * @param req
     * @param res
     * @param next
     */
    __swift.router = function (req, res, next)
    {
        res.locals.__swift = {
            'helpers': viewHelpers
        };

        __swift.req = req;
        __swift.res = res;

        next();
    };

    /**
     * Middleware добавление слеша в конец маршрута
     *
     * @param req
     * @param res
     * @param next
     */
    __swift.endslash = function (req, res, next)
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
     * @param params параметры {
     *     asGetter (
     *         true     - подключение через геттер
     *         false    - подключение напрямую
     *     )
     * }
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
        else
        {
            path = __swift.config.path.project + '/' + path;
        }

        //
        // подключение ресурса
        //

        return _package.require(path, params, callback);
    };

    return __swift.app;
};
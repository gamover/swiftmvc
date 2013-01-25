/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 */

var _express = require('express'),
    _path = require('path'),
    _fs = require('fs'),

    _modules = require('./modules'),
    _lib = require('./lib');

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

    config.path = config.path || {};
    config.path.project = projectPath;
    config.path.app = projectPath + '/app';
    config.path.modules = projectPath + '/app/modules';
    config.path.config = projectPath + '/app/config';

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
     * Подключение js-модуля из директории проекта
     *
     * @param alias псевдоним js-модуля
     *
     * @return {*}
     */
    __swift.require = function (alias)
    {
        alias = alias.replace('\\.', '$').split('.').join('/');

        if (alias[0] === ':')
        {
            alias = alias.replace(':app', __swift.config.path.app);
            alias = alias.replace(':modules', __swift.config.path.modules);
            alias = alias.replace(':config', __swift.config.path.config);
        }

        return require(alias.replace('$', '.'));
    };

    return __swift.app;
};
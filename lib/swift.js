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
var swift = module.exports = exports = function (projectPath)
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

    swift.express = _express;
    swift.app = _express();
    swift.lib = _lib;
    swift.config = config;
    swift.modules = _modules;

    _lib(swift.config);
    _modules(swift);

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

    return swift.app;
};
/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 *
 * Swift - MVC-фреймворк на основе Express.
 */

var _express = require('express'),
    _path = require('path'),

    _package = require('./utils/package'),

    Configurator = require('./configurator'),
    Router = require('./router'),
    Modules = require('./modules'),
    Helpers = require('./helpers'),

    _endvars_;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var __swift = module.exports = exports = function (pathToAppConfig)
{
    var app = _express(),
        configurator = new Configurator(),
        router = new Router(),
        modules = new Modules(),
        helpers = new Helpers(),

        config;

    //
    // инициализация конфигурации
    //

    config = configurator
        .setPathToSysConfig(__dirname + '/config.json')
        .setPathToAppConfig(pathToAppConfig || _path.normalize(__dirname + '/../../../app/config/config.json'))
        .compile()
        .getConfig()
    ;

    //
    // инициализация роутера
    //

    router
        .compileRoutesFile(_path.dirname(configurator.getPathToAppConfig()) + '/routes.json')
        .use(function (req, res, next)
        {
            res.locals.swift = {
                'helpers': helpers.get()
            };

            next();
        })
    ;

    //
    // инициализация приложения
    //

    app.set('port', process.env.PORT || config.server.port);
    app.set('views', config.path.app + '/view');

    //
    // инициализация набора модулей
    //

    modules
        .setIp(config.server.ip)
        .setPathToModules(config.path.modules)
        .setApp(app)
        .setRoutes(router.getRoutes(true))
    ;

    //
    // инициализация хелперов
    //

    helpers
        .init({
            'routes': router.getRoutes()
        })
    ;

    //
    // задание функциональных элементов
    //

    __swift.express = _express;
    __swift.app = app;
    __swift.config = config;
    __swift.modules = modules;
    __swift.router = router;
    __swift.helpers = helpers.get();

    return app;
};

/**
 * Подключение ресурса из директории проекта
 *
 * @param {String} path путь к ресурсу
 * @param {Object|Function|undefined} params параметры
 * @param {Function|undefined} cb
 *
 * @return {*}
 */
__swift.require = function (path, params, cb)
{
    if (typeof params === 'function')
    {
        cb = params;
    }

    //
    // парсинг токенов
    //

    if(path.indexOf('[') === 0 && path.indexOf(']'))
    {
        var paths = path.split(']');

        path = __swift.config.path.modules + '/' + paths[0]
            .replace('[', '')
            .split('.')
            .join('/modules/') + paths[1]
        ;
    }
    else if (path.indexOf(':app') === 0)
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

    if (typeof cb === 'function')
    {
        _package.require(path, params, cb);
        return __swift;
    }
    else
    {
        return _package.requireSync(path, params);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
// прототипы
//

/**
 * @type {express}
 */
__swift.express = undefined;

/**
 * @type {Application}
 */
__swift.app = undefined;

/**
 * @type {Object}
 */
__swift.config = undefined;

/**
 * @type {Modules}
 */
__swift.modules = undefined;

/**
 * @type {Router}
 */
__swift.router = undefined;
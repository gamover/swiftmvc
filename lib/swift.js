/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 *
 * Swift - MVC-фреймворк на основе Express.
 */

var _express = require('express'),
    _fs = require('fs'),
    _path = require('path'),

    _fsUtil = require('./utils/fs'),
    _packageUtil = require('./utils/package'),

    Configurator = require('./configurator'),
    Router = require('./router'),
    Server = require('./server'),
    Modules = require('./modules'),
    Helpers = require('./helpers'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var __swift = module.exports = exports = function (pathToAppConfig_)
{
    var app = _express(),
        configurator = new Configurator(),
        router = new Router(),
        server = new Server(),
        modules = new Modules(),
        helpers = new Helpers(),

        pathToSysConfigFile = _fsUtil.getExistingPath([
            __dirname + '/config.json',
            __dirname + '/config.js'
        ]),
        pathToAppConfigDirDef = _path.normalize(__dirname + '/../../../app/config'),
        pathToAppConfigFile = pathToAppConfig_ || _fsUtil.getExistingPath([
            pathToAppConfigDirDef + '/config.json',
            pathToAppConfigDirDef + '/config.js'
        ]),
        pathToAppConfigDir = _path.dirname(pathToAppConfigFile),
        pathToRoutesFile = _fsUtil.getExistingPath([
            pathToAppConfigDir + '/routes.json',
            pathToAppConfigDir + '/routes.js'
        ]),
        pathToRoutesDir = _path.dirname(pathToRoutesFile),

        appConfigSrc,
        sysConfigSrc,
        config,
        routesSrc,
        routes,

        __endvars__;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация конфигурации
    //

    if (_path.extname(pathToAppConfigFile) === '.json') appConfigSrc = JSON.parse(_fs.readFileSync(pathToAppConfigFile, 'UTF-8'));
    else appConfigSrc = require(pathToAppConfigFile);

    if (_path.extname(pathToSysConfigFile) === '.json') sysConfigSrc = JSON.parse(_fs.readFileSync(pathToSysConfigFile, 'UTF-8'));
    else sysConfigSrc = require(pathToSysConfigFile);

    config = configurator
        .compile(appConfigSrc)
        .complete(configurator.extend(sysConfigSrc))
        .getConfig()
    ;

    config.path = typeof config.path === 'object' ? config.path : {};
    config.path.project = config.path.project || _path.normalize(pathToAppConfigDir + '/../..');
    config.path.app = config.path.app || config.path.project + '/app';
    config.path.modules = config.path.modules || config.path.app + '/modules';
    config.path.config = _path.dirname(pathToAppConfigDir);
    config.path.swift = _path.resolve(__dirname + '/..');
    config.path.lib = _path.resolve(__dirname);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация роутера
    //

    if (_path.extname(pathToRoutesFile) === '.json') routesSrc = JSON.parse(_fs.readFileSync(pathToRoutesFile, 'UTF-8'));
    else routesSrc = require(pathToRoutesFile);

    routes = router
        .setPathToRequireRoutesDir(pathToRoutesDir)
        .compile(routesSrc)
        .getRoutes()
    ;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация приложения
    //

    app.set('port', process.env.PORT || config.server.port);
    app.set('views', config.path.app + '/view');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация сервера
    //

    server
        .setRequestListener(app)
        .setIp(config.server.ip)
        .setPort(app.set('port'))
    ;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация набора модулей
    //

    modules
        .setPathToModules(config.path.modules)
        .setRequestListener(app)
        .setServer(server)
    ;

    for (var alias in routes)
    {
        var route = routes[alias],
            modulName = route.module,
            controllerName = route.controller,
            actionName = route.action,
            path = route.path;

        modules.addRoute(modulName, controllerName, actionName, path);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация хелперов
    //

    helpers
        .init({
            routes: routes
        })
    ;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Задание функциональных элементов
    //

    __swift.express = _express;
    __swift.app = app;
    __swift.config = config;
    __swift.server = server;
    __swift.modules = modules;
    __swift.router = router;
    __swift.helpers = helpers.get();

    //
    ////
    //

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
        _packageUtil.require(path, params, cb);
        return __swift;
    }
    else
    {
        return _packageUtil.requireSync(path, params);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//
// прототипы
//

/**
 * @type {express}
 */
__swift.express = null;

/**
 * @type {Application}
 */
__swift.app = null;

/**
 * @type {Object}
 */
__swift.config = null;

/**
 * @type {Server}
 */
__swift.server = null;

/**
 * @type {Modules}
 */
__swift.modules = null;

/**
 * @type {Router}
 */
__swift.router = null;

/**
 * @type {Helpers}
 */
__swift.helpers = null;
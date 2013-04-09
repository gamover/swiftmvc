/**
 * Author: G@mOBEP
 * Date: 26.12.12
 * Time: 20:44
 *
 * Swift - MVC-фреймворк на основе Express.
 */

var $express = require('express'),
    $fs = require('fs'),
    $path = require('path'),

    $fsUtil = require('./utils/fs'),
    $packageUtil = require('./utils/package'),
    $typeUtil = require('./utils/type'),

    Configurator = require('./core/configurator'),
    Router = require('./core/router'),
    Server = require('./core/server'),
    Modules = require('./core/modules'),
    DbManager = require('./core/dbManager'),
    HelperManager = require('./core/helperManager'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var __swift = module.exports = exports = function (pathToAppConfig_)
{
    var app = $express(),
        configurator = new Configurator(),
        router = new Router(),
        server = new Server(),
        modules = new Modules(),
        dbManager = new DbManager(),
        helperManager = new HelperManager(),

        pathToSysConfigFile = $fsUtil.getExistingPath([
            __dirname + '/config.json',
            __dirname + '/config.js'
        ]),
        pathToAppConfigDirDef = $path.normalize(__dirname + '/../../../app/config'),
        pathToAppConfigFile = pathToAppConfig_ || $fsUtil.getExistingPath([
            pathToAppConfigDirDef + '/config.json',
            pathToAppConfigDirDef + '/config.js'
        ]),
        pathToAppConfigDir = $path.dirname(pathToAppConfigFile),
        pathToRoutesFile = $fsUtil.getExistingPath([
            pathToAppConfigDir + '/routes.json',
            pathToAppConfigDir + '/routes.js'
        ]),
        pathToRoutesDir = $path.dirname(pathToRoutesFile),

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

    if ($path.extname(pathToAppConfigFile) === '.json') appConfigSrc = JSON.parse($fs.readFileSync(pathToAppConfigFile, 'UTF-8'));
    else appConfigSrc = require(pathToAppConfigFile);

    if ($path.extname(pathToSysConfigFile) === '.json') sysConfigSrc = JSON.parse($fs.readFileSync(pathToSysConfigFile, 'UTF-8'));
    else sysConfigSrc = require(pathToSysConfigFile);

    config = configurator
        .compile(appConfigSrc)
        .complete(configurator.extend(sysConfigSrc))
        .getConfig()
    ;

    //
    // задание путей
    //

    config.path         = typeof config.path === 'object' ? config.path : {};
    config.path.project = config.path.project || $path.normalize(pathToAppConfigDir + '/../..');
    config.path.app     = config.path.app || config.path.project + '/app';
    config.path.modules = config.path.modules || config.path.app + '/modules';
    config.path.config  = $path.dirname(pathToAppConfigDir);
    config.path.swift   = $path.resolve(__dirname + '/..');
    config.path.lib     = $path.resolve(__dirname);

    //
    // задание подсистем
    //

    if (!$typeUtil.isObject(config.swift)) config.swift = {};
    if (!$typeUtil.isObject(config.swift.use)) config.swift.use = {};
    if (typeof config.swift.use.dbManager !== 'boolean') config.swift.use.dbManager = false;
    if (typeof config.swift.use.helperManager !== 'boolean') config.swift.use.helperManager = false;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация роутера
    //

    if ($path.extname(pathToRoutesFile) === '.json') routesSrc = JSON.parse($fs.readFileSync(pathToRoutesFile, 'UTF-8'));
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
        if (!routes.hasOwnProperty(alias)) continue;

        var route = routes[alias],
            modulName = route.module,
            controllerName = route.controller,
            actionName = route.action,
            path = route.path;

        modules.addRoute(modulName, controllerName, actionName, path);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация БД
    //

    if (config.swift.use.dbManager && $typeUtil.isObject(config.db) && $typeUtil.isObject(config.db.adapters))
    {
        var cAdapters = config.db.adapters, // параметры адаптеров
            adapterNames = Object.keys(cAdapters).map(function (adapterName) { return adapterName; }), // имена адаптеров
            adapters = dbManager.useAdapters(adapterNames).getAdapters(); // адаптеры

        Object.keys(adapters).forEach(function (adapterName)
        {
            if (!$typeUtil.isObject(cAdapters[adapterName]) ||
                !$typeUtil.isObject(cAdapters[adapterName].connections)) return;

            var adapter         = adapters[adapterName],  // адаптер
                cAdapter        = cAdapters[adapterName], // параметры адаптера
                cConnections    = cAdapter.connections;   // параметры соединений

            Object.keys(cConnections).forEach(function (connectionName)
            {
                var сСonnection = cConnections[connectionName]; // параметры соединения

                if (!$typeUtil.isObject(сСonnection)) return;

                adapter.addConectionParams(connectionName, сСonnection);
            });
        });

        dbManager.connect(function (err) { if (err) console.log(err); });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация хелперов
    //

    if (config.swift.use.helperManager)
    {
        helperManager
            .init({
                routes: routes
            })
        ;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Задание функциональных элементов
    //

    __swift.express = $express;
    __swift.app = app;
    __swift.config = config;
    __swift.server = server;
    __swift.modules = modules;
    __swift.router = router;
    __swift.dbManager = dbManager;
    __swift.helperManager = helperManager;

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
    if (typeof params === 'function') cb = params;

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
    else if (path.indexOf(':app') === 0) path = path.replace(':app', __swift.config.path.app);
    else if (path.indexOf(':modules') === 0) path = path.replace(':modules', __swift.config.path.modules);
    else if (path.indexOf(':config') === 0) path = path.replace(':config', __swift.config.path.config);
    else if (path.indexOf(':swift') === 0) path = path.replace(':swift', __swift.config.path.swift);
    else if (path.indexOf(':lib') === 0) path = path.replace(':lib', __swift.config.path.lib);
    else path = __swift.config.path.project + '/' + path;

    //
    // подключение ресурса
    //

    if (typeof cb === 'function')
    {
        $packageUtil.require(path, params, cb);
        return __swift;
    }
    else
    {
        return $packageUtil.requireSync(path, params);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// прототипы
//

/**
 * @type {express}
 */
exports.express = null;

/**
 * @type {Application}
 */
exports.app = null;

/**
 * @type {Object}
 */
exports.config = null;

/**
 * @type {Server}
 */
exports.server = null;

/**
 * @type {Modules}
 */
exports.modules = null;

/**
 * @type {Router}
 */
exports.router = null;

/**
 * @type {DbManager}
 */
exports.dbManager = null;

/**
 * @type {helperManager}
 */
exports.helperManager = null;

/**
 * @type {Object}
 */
exports.utils = $packageUtil.requireDirRSync(__dirname + '/utils');
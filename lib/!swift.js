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

    Configurator = require('./configurator'),
    Router = require('./router'),
    Server = require('./server'),
    Modules = require('./modules'),
    DbManager = require('./dbManager'),
    HelperManager = require('./helperManager'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UsedSystem (key) { this.key = key; }

function Swift ()
{
    this.SYSTEMS = {
        DB_MANAGER:     new UsedSystem('DB_MANAGER'),
        HELPER_MANAGER: new UsedSystem('HELPER_MANAGER')
    };

    /**
     * Набор используемых подсистем
     *
     * @type {Object}
     * @private
     */
    this._usedSystems = {};

    /**
     * Фреймворк Express
     *
     * @type {express}
     */
    this.express = $express;

    /**
     * Приложение Express
     *
     * @type {Application}
     */
    this.app = null;

    /**
     * Конфигуратор приложения
     *
     * @type {Configurator}
     */
    this.configurator = null;

    /**
     * Настройки приложения
     *
     * @type {Object}
     */
    this.config = null;

    /**
     * Сервер
     *
     * @type {Server}
     */
    this.server = null;

    /**
     * Набор модулей
     *
     * @type {Modules}
     */
    this.modules = null;

    /**
     * Маршрутизатор
     *
     * @type {Router}
     */
    this.router = null;

    /**
     * Менеджер баз данных
     *
     * @type {DbManager}
     */
    this.dbManager = null;

    /**
     * Менеджер помощников
     *
     * @type {HelperManager}
     */
    this.helperManager = null;
}

/**
 * Создание приложения
 *
 * @param {String} pathToAppConfig_ путь к файлу конфигурации приложения
 *
 * @returns {Application}
 */
Swift.prototype.createApp = function (pathToAppConfig_)
{
    var self = this,

        pathToAppConfigDirDef,  // путь по умолчанию к директории файла настроек приложения
        pathToAppConfigDir,     // путь к директории файла настроек приложения
        pathToRoutesDir,        // путь к директории файла маршрутов
        pathToSysConfigFile,    // путь к системному файлу настроек
        pathToAppConfigFile,    // путь к файлу настроек приложения
        pathToRoutesFile,       // путь к файлу маршрутов

        sysConfigSrc,   // системные настройки в исходном формате
        appConfigSrc,   // настройки приложения в исходном формате
        config,         // настройки в формате приложения
        routesSrc,      // маршруты в исходном формате
        routes,         // маршруты в формате приложения

        dbAdapterNames, // список имен БД-адаптеров
        dbAdapters;     // список БД-адаптеров

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (self.app !== null) return self.app;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Определение путей
    //

    pathToSysConfigFile = $fsUtil.getExistingPath([
        __dirname + '/config.json',
        __dirname + '/config.js'
    ]);
    pathToAppConfigDirDef = $path.normalize(__dirname + '/../../../app/config');
    pathToAppConfigFile = pathToAppConfig_ || $fsUtil.getExistingPath([
        pathToAppConfigDirDef + '/config.json',
        pathToAppConfigDirDef + '/config.js'
    ]);
    pathToAppConfigDir = $path.dirname(pathToAppConfigFile);
    pathToRoutesFile = $fsUtil.getExistingPath([
        pathToAppConfigDir + '/routes.json',
        pathToAppConfigDir + '/routes.js'
    ]);
    pathToRoutesDir = $path.dirname(pathToRoutesFile);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация конфигурации
    //

    if ($path.extname(pathToAppConfigFile) === '.json')
        appConfigSrc = JSON.parse($fs.readFileSync(pathToAppConfigFile, 'UTF-8'));
    else appConfigSrc = require(pathToAppConfigFile);

    if ($path.extname(pathToSysConfigFile) === '.json')
        sysConfigSrc = JSON.parse($fs.readFileSync(pathToSysConfigFile, 'UTF-8'));
    else sysConfigSrc = require(pathToSysConfigFile);

    self.configurator = new Configurator();

    self.configurator
        .compile(appConfigSrc)
        .complete(self.configurator.extend(sysConfigSrc))
    ;

    config = self.configurator.getConfig();

    config.path            = typeof config.path === 'object' ? config.path : {};
    config.path.project    = config.path.project || $path.normalize(pathToAppConfigDir + '/../..');
    config.path.app        = config.path.app || config.path.project + '/app';
    config.path.modules    = config.path.modules || config.path.app + '/modules';
    config.path.config     = $path.dirname(pathToAppConfigDir);
    config.path.swift      = $path.resolve(__dirname + '/..');
    config.path.lib        = $path.resolve(__dirname);

    self.config = config;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация приложения Express
    //

    self.app = $express();
    self.app.set('port', process.env.PORT || self.config.server.port);
    self.app.set('views', self.config.path.app + '/view');

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация роутера
    //

    if ($path.extname(pathToRoutesFile) === '.json') routesSrc = JSON.parse($fs.readFileSync(pathToRoutesFile, 'UTF-8'));
    else routesSrc = require(pathToRoutesFile);

    self.router = new Router()
        .setPathToRequireRoutesDir(pathToRoutesDir)
        .compile(routesSrc)
    ;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация сервера
    //

    self.server = new Server()
        .setRequestListener(self.app)
        .setIp(self.config.server.ip)
        .setPort(self.app.set('port'))
    ;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация набора модулей
    //

    self.modules = new Modules()
        .setPathToModules(self.config.path.modules)
        .setRequestListener(self.app)
        .setServer(self.server)
    ;

    routes = self.router.getRoutes();

    for (var alias in routes)
    {
        if (!routes.hasOwnProperty(alias)) continue;

        var route = routes[alias],
            modulName = route.module,
            controllerName = route.controller,
            actionName = route.action,
            path = route.path;

        self.modules.addRoute(modulName, controllerName, actionName, path);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация менеджера баз данных
    //

    self.dbManager = new DbManager();

    if ($typeUtil.isObject(self.config.db))
    {
        dbAdapterNames = Object.keys(self.config.db).map(function (adapterName) { return adapterName; });
        dbAdapters = self.dbManager.useAdapters(dbAdapterNames).getAdapters();

        Object.keys(dbAdapters).forEach(function (adapterName)
        {
            var adapter = dbAdapters[adapterName],
                connectionsParams = self.config.db[adapterName];

            if (!$typeUtil.isObject(connectionsParams)) return;

            Object.keys(connectionsParams).forEach(function (connectionName)
            {
                var connectionParams = connectionsParams[connectionName];

                if (!$typeUtil.isObject(connectionParams)) return;

                adapter.addConection(connectionName, connectionParams);
            });
        });

        self.dbManager.connect(function (err) { if (err) console.log(err); });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // Инициализация менеджера помощников
    //

    self.helperManager = new HelperManager()
        .init({
            routes: routes
        })
    ;

    //
    ////
    //

    return self.app;
};

/**
 * Активация подсистемы фреймворка
 *
 * @param {Array} list список подсистем
 *
 * @returns {Swift}
 */
Swift.prototype.use = function (list)
{
    var self = this;

    if (!$typeUtil.isArray(list)) list = [list];

    list.forEach(function (system) { if (system instanceof UsedSystem) self._usedSystems[system.key] = true; });

    return self;
};

/**
 * Подключение ресурса из директории проекта
 *
 * @param {String} path путь к ресурсу
 * @param {Object} params параметры
 * @param {Function} cb
 *
 * @return {*}
 */
Swift.prototype.require = function (path, params, cb)
{
    if (typeof params === 'function') cb = params;

    if (this.config === null)
    {
        if (typeof cb === 'function')
        {
            cb(['не определена конфигурация приложения']);
            return this;
        }

        return null;
    }

    //
    // парсинг токенов
    //

    if(path.indexOf('[') === 0 && path.indexOf(']'))
    {
        var paths = path.split(']');

        path = this.config.path.modules + '/' + paths[0]
            .replace('[', '')
            .split('.')
            .join('/modules/') + paths[1]
        ;
    }
    else if (path.indexOf(':app') === 0)
    {
        path = path.replace(':app', this.config.path.app);
    }
    else if (path.indexOf(':modules') === 0)
    {
        path = path.replace(':modules', this.config.path.modules);
    }
    else if (path.indexOf(':config') === 0)
    {
        path = path.replace(':config', this.config.path.config);
    }
    else if (path.indexOf(':swift') === 0)
    {
        path = path.replace(':swift', this.config.path.swift);
    }
    else if (path.indexOf(':lib') === 0)
    {
        path = path.replace(':lib', this.config.path.lib);
    }
    else
    {
        path = this.config.path.project + '/' + path;
    }

    //
    // подключение ресурса
    //

    if (typeof cb === 'function')
    {
        $packageUtil.require(path, params, cb);
        return this;
    }

    return $packageUtil.requireSync(path, params);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = new Swift();
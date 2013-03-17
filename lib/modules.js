/**
 * Author: G@mOBEP
 * Date: 27.12.12
 * Time: 1:03
 *
 * Набор модулей Swift.
 */

var Module = require('./module'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = Modules;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Modules ()
{
    /**
     * Состояние набора
     *
     * @type {String}
     * @private
     */
    this._status = 'init';

    /**
     * Путь к директории модулей
     *
     * @type {String}
     * @private
     */
    this._pathToModules = null;

    /**
     * Сервер
     *
     * @type {Server}
     * @private
     */
    this._server = null;

    /**
     * Слушатель запросов
     *
     * @type {Object}
     * @private
     */
    this._requestListener = null;

    /**
     * Маршруты (объект вида:
     *     {
     *         ModuleName1: {
     *             'controllerName1': {
     *                 'actionName1': 'path1',
     *                 'actionName2': 'path2',
     *                 ...
     *                 'actionNameN': 'pathN'
     *             },
     *             ...
     *             'controllerNameN': {
     *                 ...
     *             }
     *         },
     *         ...
     *         ModuleNameN :{
     *             ...
     *         }
     *     }
     * )
     *
     * @type {Object}
     * @private
     */
    this._routes = {};

    /**
     * Модули
     *
     * @type {Object}
     * @private
     */
    this._modules = {};
}

/**
 * Задание пути к директории модулей
 *
 * @param {String} path
 *
 * @returns {Modules}
 */
Modules.prototype.setPathToModules = function (path)
{
    if (this._status === 'run') return this;

    this._pathToModules = path;

    return this;
};

/**
 * Получение пути к директории модулей
 *
 * @returns {String}
 */
Modules.prototype.getPathToModules = function ()
{
    return this._pathToModules;
};

/**
 * Задание сервера
 *
 * @param {Server} server
 *
 * @returns {Modules}
 */
Modules.prototype.setServer = function (server)
{
    this._server = server;

    return this;
};

/**
 * Получение сервера
 *
 * @returns {Server}
 */
Modules.prototype.getServer = function ()
{
    return this._server;
};

/**
 * Задание слушателя запросов
 *
 * @param {Object} requestListener слушатель запросов
 *
 * @returns {Modules}
 */
Modules.prototype.setRequestListener = function (requestListener)
{
    this._requestListener = requestListener;

    return this;
};

/**
 * Получение слушателя запросов
 *
 * @returns {Modules}
 */
Modules.prototype.getRequestListener = function ()
{
    return this._requestListener;
};

/**
 * Задание маршрутов
 *
 * @param {Object} routes
 *
 * @returns {Modules}
 */
Modules.prototype.setRoutes = function (routes)
{
    if (this._status === 'run') return this;

    this._routes = routes;

    return this;
};

/**
 * Добавление маршрута
 *
 * @param {String} moduleName название модуля
 * @param {String} controllerName название контроллера
 * @param {String} actionName название экшена
 * @param {String|RegExp} path путь
 *
 * @returns {Modules}
 */
Modules.prototype.addRoute = function (moduleName, controllerName, actionName, path)
{
    if (this._status === 'run') return this;
    if (!moduleName || !controllerName || !actionName || !path) return this;

    this._routes[moduleName] = this._routes[moduleName] || {};
    this._routes[moduleName][controllerName] = this._routes[moduleName][controllerName] || {};
    this._routes[moduleName][controllerName][actionName] = path;

    return this;
};

/**
 * Получение маршрутов
 *
 * @returns {Object}
 */
Modules.prototype.getRoutes = function ()
{
    return this._routes;
};

/**
 * Добавление модуля
 *
 * @param {Module} modul
 *
 * @returns {Modules}
 */
Modules.prototype.addModule = function (modul)
{
    if (this._status === 'run') return this;

    //
    // проверка модуля
    //

    if (!modul || !modul instanceof Module) return this;

    //
    // добавление модуля
    //

    this._modules[modul.getName()] = modul;

    //
    ////
    //

    return this;
};

/**
 * Загрузка модуля
 *
 * @param {String} moduleName название модуля
 *
 * @returns {Modules}
 */
Modules.prototype.load = function (moduleName)
{
    if (this._status === 'run') return this;

    var pathToModule = this._pathToModules + '/' + moduleName.split('.').join('/modules/'),
        modul = new Module();

    //
    // задание параметров модуля
    //

    modul
        .setName(moduleName)
        .setPathToModule(pathToModule)
        .setRequestListener(this._requestListener)
        .setRoutes(this._routes[moduleName] || {})
    ;

    //
    // добавление модуля
    //

    this.addModule(modul);

    //
    ////
    //

    return this;
};

/**
 * Получение модуля
 *
 * @param {String|undefined} moduleName название модуля
 *
 * @return {Modules}
 */
Modules.prototype.get = function (moduleName)
{
    return (moduleName ? this._modules[moduleName] : this._modules);
};

/**
 * Запуск модулей
 *
 * @param {Function|undefined} cb
 *
 * @returns {Modules}
 */
Modules.prototype.run = function (cb)
{
    cb = cb || function () {};

    if (this._status === 'run')
    {
        cb(['модули уже запущены']);
        return this;
    }

    this._status = 'run';

    var self = this,
        loading = 0,
        errors = [];

    for (var moduleName in this._routes)
    {
        if (!this._routes.hasOwnProperty(moduleName)) continue;

        loading++;

        var modul = this._modules[moduleName];

        if (!modul)
        {
            loading--;
            errors = errors.concat(['модуль "' + moduleName + '" не загружен']);
            continue;
        }

        (function (moduleName)
        {
            modul.run(function (err)
            {
                loading--;

                if (err) errors = errors.concat(['во время загрузки модуля "' + moduleName + '" возникли ошибки', err]);
            });
        })(moduleName);
    }

    //
    // ожидание окончания запуска модулей
    //

    (function awaitingModules ()
    {
        process.nextTick(function ()
        {
            if (loading)
            {
                awaitingModules();
                return;
            }

            //
            // запуск сервера
            //

            if (self._server)
            {
                self._server.run(function (err)
                {
                    if (err) errors = errors.concat(['во время запуска сервера возникли ошибки', err]);
                    cb(errors.length ? errors : null, self._modules.length);
                });

                return;
            }

            //
            ////
            //

            cb(errors.length ? errors : null, self._modules.length);
        });
    })();

    //
    ////
    //

    return this;
};
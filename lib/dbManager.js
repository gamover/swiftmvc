/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 21.03.13
 * Time: 13:24
 */

var $path = require('path'),

    DbAdapter = require('./dbAdapters/dbAdapter');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = DbManager;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DbManager () {
    /**
     * Набор адаптеров
     *
     * @type {Object}
     * @private
     */
    this._adapters = {};
}

/**
 * Добавление используемых адаптеров
 *
 * @param {Array} adapterNames имена адаптеров
 *
 * @returns {DbManager}
 */
DbManager.prototype.useAdapters = function (adapterNames)
{
    var self = this;

    adapterNames.forEach(function (adapterName)
    {
        var Adapter,
            adapter;

        adapterName = adapterName.toLowerCase();

        if (typeof self._adapters[adapterName] !== 'undefined') return;
        if (!$path.existsSync(__dirname + '/dbAdapters/' + adapterName + 'Adapter.js')) return;

        Adapter = require('./dbAdapters/' + adapterName + 'Adapter');
        adapter = new Adapter();

        self.addAdapter(adapterName, adapter)
    });

    return self;
};

/**
 * Добавление адаптера
 *
 * @param {String} adapterName имя адаптера
 * @param {DbAdapter} adapter адаптер
 *
 * @returns {DbManager}
 */
DbManager.prototype.addAdapter = function (adapterName, adapter)
{
    if (adapter instanceof DbAdapter) this._adapters[adapterName] = adapter;

    return this;
};

/**
 * Получение адаптеров
 *
 * @returns {Object}
 */
DbManager.prototype.getAdapters = function ()
{
    return this._adapters;
};

/**
 * Получение адаптера
 *
 * @param adapterName имя адаптера
 *
 * @returns {DbAdapter}
 */
DbManager.prototype.getAdapter = function (adapterName)
{
    return this._adapters[adapterName];
};

/**
 * Соединение с БД
 *
 * @param {Function} cb
 *
 * @returns {DbManager}
 */
DbManager.prototype.connect = function (cb)
{
    var self = this,
        connecting = 0,
        errors = [];

    if (typeof cb !== 'function') cb = function () {};

    Object.keys(self._adapters).forEach(function (adapterName)
    {
        connecting++;

        self._adapters[adapterName].connect(function (err)
        {
            if (err) errors.push(['в БД-адаптере "' + adapterName + '" возникли ошибки подключения', err]);

            connecting--;
        });
    });

    (function awaiting()
    {
        process.nextTick(function ()
        {
            if (connecting)
            {
                awaiting();
                return;
            }

            cb(errors.length ? ['возникли ошибки при подключении к БД', errors] : null);
        });
    })();

    return self;
};

/**
 * Прослойка коннектора с БД
 *
 * @returns {Function}
 */
DbManager.prototype.connector = function ()
{
    var self = this;

    return function (req, res, next)
    {
        self.connect(function (err)
        {
            if (err)
            {
                var error = new Error();

                error.status = 500;
                error.message = 'error connecting to database';

                next(error);

                err.log();

                return;
            }

            next();
        });
    };
};
/**
 * Author: G@mOBEP
 * Date: 03.03.13
 * Time: 12:29
 */

var $http = require('http'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = Server;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Server ()
{
    /**
     * Слушатель запросов
     *
     * @type {Object}
     * @private
     */
    this._requestListener = null;

    /**
     * ip-адрес сервера
     *
     * @type {String}
     * @private
     */
    this._ip = '127.0.0.1';

    /**
     * Порт сервера
     *
     * @type {String}
     * @private
     */
    this._port = '3333';
}

/**
 * Задание слушателя запросов
 *
 * @param {Object} requestListener слушатель запросов
 *
 * @returns {Server}
 */
Server.prototype.setRequestListener = function (requestListener)
{
    this._requestListener = requestListener;

    return this;
};

/**
 * Получение слушателя запросов
 *
 * @returns {Object}
 */
Server.prototype.getRequestListener = function ()
{
    return this._requestListener;
};

/**
 * Задание ip
 *
 * @param {String} ip
 *
 * @returns {Server}
 */
Server.prototype.setIp = function (ip)
{
    this._ip = ip;

    return this;
};

/**
 * Получение ip
 *
 * @returns {String}
 */
Server.prototype.getIp = function ()
{
    return this._ip;
};

/**
 * Задание порта
 *
 * @param {String} port
 *
 * @returns {Server}
 */
Server.prototype.setPort = function (port)
{
    this._port = port;

    return this;
};

/**
 * Получение порта
 *
 * @returns {String}
 */
Server.prototype.getPort = function ()
{
    return this._port;
};

/**
 * Запуск сервера
 *
 * @param {Function} cb
 *
 * @returns {Server}
 */
Server.prototype.run = function (cb)
{
    var self = this,
        server;

    cb = cb || function(){};

    server = $http.createServer(self._requestListener).listen(self._port, self._ip, function () {
        var text = '= Swift server listening on ' + self._ip + ':' + self._port + ' =',
            line = Array.prototype.map.call(text, function () { return '='; }).join('');

        console.log(line);
        console.log(text);
        console.log(line);
        console.log('');

        cb();
    });

    server.on('error', function (err)
    {
       console.log(['не удалось запустить сервер (' + self._ip + ':' + self._port + ')', err]);
    });

    return self;
}
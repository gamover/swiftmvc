/**
 * Author: G@mOBEP
 * Date: 03.03.13
 * Time: 12:29
 */

var _http = require('http'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = Server;

function Server ()
{
    var self = this,

        requestListener,
        ip = '127.0.0.1',
        port = '3333';

    /**
     * Задание слушателя запросов
     *
     * @param {Object} listener слушатель запросов
     *
     * @returns {Server}
     */
    self.setRequestListener = function (listener)
    {
        requestListener = listener;

        return self;
    };

    /**
     * Получение слушателя запросов
     *
     * @returns {Object}
     */
    self.getRequestListener = function ()
    {
        return requestListener;
    };

    /**
     * Задание ip
     *
     * @param {String} $ip
     *
     * @returns {Server}
     */
    self.setIp = function ($ip)
    {
        ip = $ip;

        return self;
    };

    /**
     * Получение ip
     *
     * @returns {String}
     */
    self.getIp = function ()
    {
        return ip;
    };

    /**
     * Задание порта
     *
     * @param {String} $port
     *
     * @returns {Server}
     */
    self.setPort = function ($port)
    {
        port = $port;

        return self;
    };

    /**
     * Получение порта
     *
     * @returns {String}
     */
    self.getPort = function ()
    {
        return port;
    };

    /**
     * Запуск сервера
     *
     * @param {Function} cb
     *
     * @returns {Server}
     */
    self.run = function (cb)
    {
        cb = cb || function(){};

        _http.createServer(requestListener).listen(port, ip, function() {
            var text = '= Swift server listening on ' + ip + ':' + port + ' =',
                line = Array.prototype.map.call(text, function () { return '='; }).join('');

            console.log(line);
            console.log(text);
            console.log(line);
            console.log('');

            cb();
        });

        return self;
    }
}
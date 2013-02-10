/**
 * Author: G@mOBEP
 * Date: 03.02.13
 * Time: 15:12
 *
 * Маршрутизатор Swift.
 */

var __router = module.exports = exports;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

__router.Router = function ()
{
    var self = this,

        config,

        req,
        res,
        next;

    /**
     * Задание конфигурации
     *
     * @param config_
     *
     * @returns {*}
     */
    self.setConfig = function (config_)
    {
        config = config_;

        return self;
    };

    /**
     * Получение конфигурации
     *
     * @returns {*}
     */
    self.getConfig = function ()
    {
        return config;
    };

    /**
     * Получение объекта запроса
     *
     * @returns {*}
     */
    self.getRequest = function ()
    {
        return req;
    };

    /**
     * Получение объекта ответа
     *
     * @returns {*}
     */
    self.getResponse = function ()
    {
        return res;
    };

    /**
     * Получение функции продолжения обработки запроса
     *
     * @returns {*}
     */
    self.getNext = function()
    {
        return next;
    };

    /**
     * Маршрутизация
     *
     * @param req_ объекь запроса
     * @param res_ объект ответа
     * @param next_ функция продолжения обработки запроса
     *
     * @returns {*}
     */
    self.route = function (req_, res_, next_)
    {
        req = req_;
        res = res_;
        next = next_;

        res.locals.swift = {
            'helpers': new (require('./viewHelpers').ViewHelpers)(config)
        };

        next();

        return self;
    };

    /**
     * Добавление слеша в конец маршрута и редирект
     *
     * @param req объекь запроса
     * @param res объект ответа
     * @param next функция продолжения обработки запроса
     */
    self.endslash = function (req, res, next)
    {
        if (!~req.url.indexOf('?') && req.path.match(/[^\/]$/))
        {
            res.redirect(req.path + '/');

            return;
        }

        next();

        return self;
    };
};
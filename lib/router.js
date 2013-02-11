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

        req,
        res,
        next,

        uses = [];

    /**
     * Получение объекта запроса
     *
     * @returns {Request}
     */
    self.getRequest = function ()
    {
        return req;
    };

    /**
     * Получение объекта ответа
     *
     * @returns {Response}
     */
    self.getResponse = function ()
    {
        return res;
    };

    /**
     * Получение функции продолжения обработки запроса
     *
     * @returns {Function}
     */
    self.getNext = function()
    {
        return next;
    };

    /**
     * Добавление middleware
     *
     * @param {Function} middle
     *
     * @returns {Router}
     */
    self.use = function (middle)
    {
        if (typeof middle === 'function')
        {
            uses.push(middle);
        }

        return self;
    };

    /**
     * Маршрутизация
     *
     * @param {Request} req_ объекь запроса
     * @param {Response} res_ объект ответа
     * @param {Function} next_ функция продолжения обработки запроса
     *
     * @returns {Router}
     */
    self.route = function (req_, res_, next_)
    {
        setTimeout(function ()
        {
            req = req_;
            res = res_;
            next = next_;

            uses.forEach(function (middle) { middle(req_, res_, nxt); });

            function nxt ()
            {
                next();
            }
        }, 0);

        return self;
    };

    /**
     * Добавление слеша в конец маршрута и редирект
     *
     * @param {Request} req объекь запроса
     * @param {Response} res объект ответа
     * @param {Function} next функция продолжения обработки запроса
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
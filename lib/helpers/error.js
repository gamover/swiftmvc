/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 11.03.13
 * Time: 10:20
 */

/**
 * Ошибка 404 - "не найдено"
 *
 * @param {String} msg сообщение
 */
exports._404 = function (msg)
{
    throw new NotFound(msg);
};

/**
 * Ошибка 500 - "внутренняя ошибка сервера"
 *
 * @param {String} msg сообщение
 */
exports._500 = function (msg)
{
    throw new Error(msg);
};

/**
 * Обработчик ошибок (middleware)
 *
 * @param {Object} err
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.handler = function(err, req, res, next)
{
    if (err instanceof NotFound) res.render('404', true);
    else res.render('500', true);
};

function NotFound (msg)
{
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;
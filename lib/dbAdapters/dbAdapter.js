/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 21.03.13
 * Time: 13:39
 */

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = DbAdapter;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function DbAdapter () {}

/**
 * Подключение к БД
 *
 * @param {Function} cb
 *
 * @returns {DbAdapter}
 */
DbAdapter.prototype.connect = function (cb)
{
    if (typeof cb !== 'function') cb = function () {};

    cb();

    return this;
};
/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 12:17
 *
 * Набор помощников Swift.
 */

var UrlHelper = require('./helpers/url'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports = module.exports = Helpers;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Helpers ()
{
    /**
     * Список помощников
     *
     * @type {Object}
     * @private
     */
    this._helpers = {
        'url': new UrlHelper()
    };
}

/**
 * Добавление хелпера
 *
 * @param {String} helperName название хелпера
 * @param {Object} helper объект хелпера
 *
 * @returns {Helpers}
 */
Helpers.prototype.addHelper = function (helperName, helper)
{
    if (!this._helpers[helperName]) this._helpers[helperName] = helper;

    return this;
};

/**
 * Получение хелпера
 *
 * @param {String} helperName название хелпера
 *
 * @returns {Object}
 */
Helpers.prototype.get = function (helperName)
{
    return (helperName ? this._helpers[helperName] : this._helpers);
};

/**
 * Инициализация хелперов
 *
 * @param {Object} params параметры
 *
 * @returns {Helpers}
 */
Helpers.prototype.init = function (params)
{
    this._helpers.url.setRoutes(params.routes);

    return this;
};
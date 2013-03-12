/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 12:17
 *
 * Набор помощников видов Swift.
 */

var UrlHelper = require('./helpers/url'),

    __endvars__;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = Helpers;

function Helpers ()
{
    var self = this,

        helpers = {
            'url': new UrlHelper()
        };

    /**
     * Добавление хелпера
     *
     * @param {String} helperName название хелпера
     * @param {Object} helper объект хелпера
     *
     * @returns {Helpers}
     */
    self.addHelper = function (helperName, helper)
    {
        if (!helpers[helperName]) helpers[helperName] = helper;

        return self;
    };

    /**
     * Получение хелпера
     *
     * @param {String} helperName название хелпера
     *
     * @returns {Object}
     */
    self.get = function (helperName)
    {
        return (helperName ? helpers[helperName] : helpers);
    };

    /**
     * Инициализация хелперов
     *
     * @param params параметры
     *
     * @returns {Helpers}
     */
    self.init = function (params)
    {
        helpers.url.setRoutes(params.routes);

        return self;
    };
}
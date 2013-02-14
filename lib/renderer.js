/**
 * Author: G@mOBEP
 * Date: 09.02.13
 * Time: 21:42
 *
 * Отрисовщик видов Swift.
 */

var __renderer = module.exports = exports,

    _fs = require('fs'),
    _path = require('path');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

__renderer.Renderer = function ()
{
    var self = this,

        router;

    /**
     * Задание маршрутизатора
     *
     * @param {Router} router_
     *
     * @returns {Renderer}
     */
    self.setRouter = function (router_)
    {
        router = router_;

        return self;
    };

    /**
     * Получение маршрутизатора
     *
     * @returns {Router}
     */
    self.getRouter = function ()
    {
        return router;
    };

    /**
     * Отрисовка вида (async)
     *
     * @param {String} pathToTemplate путь к шаблону
     * @param {Object|undefined} params параметры для передачи в шаблон
     *
     * @returns {Renderer}
     */
    self.render = function (pathToTemplate, params)
    {
        pathToTemplate = _path.normalize(pathToTemplate);
        params = params || {};

        router.getResponse().render(pathToTemplate, params);

        return self;
    };
};
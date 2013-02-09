/**
 * Author: G@mOBEP
 * Date: 09.02.13
 * Time: 11:48
 *
 * Пакет описывающий вид фреймворка Swift.
 */

var __view = module.exports = exports,

    _fs = require('fs'),
    _path = require('path'),

    countViews = 0;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

__view.View = function ()
{
    countViews++;

    var self = this,

        viewName = 'SwiftView' + countViews,
        pathToTemplate,

        renderer;

    /**
     * Задание названия вида
     *
     * @param {string} name
     *
     * @returns {*}
     */
    self.setName = function (name)
    {
        viewName = name;

        return self;
    };

    /**
     * Получение названия вида
     *
     * @returns {string}
     */
    self.getName = function ()
    {
        return viewName;
    };

    /**
     * Задание пути к файлу шаблона
     *
     * @param {string} path
     *
     * @returns {*}
     */
    self.setPathToTemplate = function (path)
    {
        pathToTemplate = _path.normalize(path);

        return self;
    };

    /**
     * Получение пути к файлу шаблона
     *
     * @returns {*}
     */
    self.getPathToTemplate = function ()
    {
        return pathToTemplate;
    };

    /**
     * Задание отрисовщика видов
     *
     * @param {object} renderer_
     *
     * @returns {*}
     */
    self.setRenderer = function (renderer_)
    {
        renderer = renderer_;

        return self;
    };

    /**
     * Получение отрисовщика видов
     *
     * @returns {*}
     */
    self.getRenderer = function()
    {
        return renderer;
    };

    /**
     * Отрисовка вида (async)
     *
     * @param {object|undefined} params параметры для передачи в шаблон
     *
     * @returns {*}
     */
    self.render = function (params)
    {
        setTimeout(function ()
        {
            params = params || {};

            renderer.render(pathToTemplate, params);
        }, 0);

        return self;
    };
};

/**
 * Получение кол-ва созданных видов
 *
 * @returns {number}
 */
__view.getCountViews = function ()
{
    return countViews;
};
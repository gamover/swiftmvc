/**
 * Author: G@mOBEP
 * Date: 09.02.13
 * Time: 11:48
 *
 * Вид Swift.
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

        status = 'init',

        viewName = 'SwiftView' + countViews,
        pathToTemplate,

        renderer;

    /**
     * Задание названия вида
     *
     * @param {string} name
     *
     * @returns {View}
     */
    self.setName = function (name)
    {
        if (status === 'run') return self;

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
     * @returns {View}
     */
    self.setPathToTemplate = function (path)
    {
        if (status === 'run') return self;

        pathToTemplate = _path.normalize(path);

        return self;
    };

    /**
     * Получение пути к файлу шаблона
     *
     * @returns {string}
     */
    self.getPathToTemplate = function ()
    {
        return pathToTemplate;
    };

    /**
     * Задание отрисовщика видов
     *
     * @param {Renderer} renderer_
     *
     * @returns {View}
     */
    self.setRenderer = function (renderer_)
    {
        if (status === 'run') return self;

        renderer = renderer_;

        return self;
    };

    /**
     * Получение отрисовщика видов
     *
     * @returns {Renderer}
     */
    self.getRenderer = function()
    {
        return renderer;
    };

    /**
     * Запуск вида (async)
     *
     * @param {Function} callback
     *
     * @returns {View}
     */
    self.run = function (callback)
    {
        callback = callback || function () {};

        if (status === 'run')
        {
            callback(['вид уже запущен']);
        }

        status = 'run';

        callback(null, self);

        return self;
    };

    /**
     * Отрисовка вида (async)
     *
     * @param {object|function|undefined} params параметры для передачи в шаблон
     * @param {function|undefined} callback
     *
     * @returns {View}
     */
    self.render = function (params, callback)
    {
        setTimeout(function ()
        {
            if (typeof params === 'function')
            {
                callback = params;
                params = {};
            }
            else
            {
                params = params || {};
                callback = callback || function () {};
            }

            renderer.render(pathToTemplate, params, function (err)
            {
                if (err)
                {
                    callback(['не удалось отрисовать вид "' + viewName + '"'].concat(err));
                    return;
                }

                callback();
            });
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
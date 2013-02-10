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
     * @param {string} pathToTemplate путь к шаблону
     * @param {object|function|undefined} params параметры для передачи в шаблон
     * @param {function|undefined} callback
     *
     * @returns {Renderer}
     */
    self.render = function (pathToTemplate, params, callback)
    {
        setTimeout(function ()
        {
            if (!pathToTemplate)
            {
                callback(['не указан путь к шаблону']);
                return;
            }

            pathToTemplate = _path.normalize(pathToTemplate);

            _path.exists(pathToTemplate, function (exists)
            {
                if (!exists)
                {
                    callback(['указанный путь "' + pathToTemplate + '" не существует']);
                    return;
                }

                _fs.stat(pathToTemplate, function(err, stats)
                {
                    if (err)
                    {
                        callback(['возникла системная ошибка', err]);
                        return;
                    }

                    if (!stats.isFile())
                    {
                        callback(['шаблон не найден']);
                        return;
                    }

                    render();
                });
            });

            //
            // отрисовка
            //

            function render ()
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

                params = params || {};

                router.getResponse().render(pathToTemplate, params);

                callback();
            }
        }, 0);

        return self;
    };
};
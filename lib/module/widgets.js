/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 01.02.13
 * Time: 12:58
 */

var __widgets = module.exports = exports,

    _fs = require('fs'),
    _path = require('path'),

    _package = require('./../utils/package'),

    Widget = require('./widget').Widget;

__widgets.Widgets = function ()
{
    var self = this,

        app,
        router,

        pathToWidgets,

        widgets = {};

    /**
     * Задание объекта приложения
     *
     * @param app_
     *
     * @returns {*}
     */
    self.setApp = function (app_)
    {
        app = app_;

        return self;
    };

    /**
     * Получение объекта приложения
     *
     * @returns {*}
     */
    self.getApp = function ()
    {
        return app;
    };

    /**
     * Задание рутера
     *
     * @param router_
     *
     * @returns {*}
     */
    self.setRouter = function (router_)
    {
        router = router_;

        return self;
    };

    /**
     * Получение роутера
     *
     * @returns {*}
     */
    self.getRouter = function ()
    {
        return router;
    };

    /**
     * Задание пути к директории виджетов
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToWidgets = function (path)
    {
        pathToWidgets = path;

        return self;
    };

    /**
     * Получение пути к директории виджетов
     *
     * @returns {*}
     */
    self.getPathToWidgets = function ()
    {
        return pathToWidgets;
    };

    /**
     * Загрузка виджетов
     *
     * @returns {*}
     */
    self.load = function (callback)
    {
        setTimeout(function ()
        {
            var loadingWidgets = 0;

            if (_path.existsSync(pathToWidgets) && _fs.lstatSync(pathToWidgets).isDirectory())
            {
                (function bypass (pathToDir, path)
                {
                    path = path ? path + '/' : '';

                    _fs.readdirSync(pathToDir).forEach(function (filename)
                    {
                        if (_fs.lstatSync(pathToDir + '/' + filename).isDirectory())
                        {
                            if (filename !== 'view')
                            {
                                bypass(pathToDir + '/' + filename, path + filename);
                            }
                        }
                        else
                        {
                            if (_path.extname(filename) !== '.js')
                            {
                                return;
                            }

                            loadingWidgets++;

                            var widgetName = path + _path.basename(filename, '.js');

                            new Widget()
                                .setApp(app)
                                .setName(widgetName)
                                .setPathToWidget(pathToDir + '/' + filename)
                                .create(function (err, widget)
                                {
                                    if (err)
                                    {
                                        loadingWidgets--;
                                        return;
                                    }

                                    widgets[widgetName] = widget;

                                    loadingWidgets--;
                                })
                            ;
                        }
                    });
                })(pathToWidgets);
            }

            (function loop ()
            {
                setTimeout(function ()
                {
                    if (loadingWidgets) return loop();

                    if (typeof callback === 'function')
                    {
                        callback(null, self);
                    }
                }, 0);
            })();
        }, 0);

        return self;
    };

    /**
     * Получение виджета
     *
     * @param path путь к виджету
     *
     * @return {*}
     */
    self.get = function (path)
    {
        //
        // получение указанного модуля
        //

        if (path !== undefined)
        {
            if (widgets[path] === undefined)
            {
                console.log('Не удалось получить виджет. Виджет "' + path + '" не найден.');
                return;
            }

            return widgets[path];
        }

        //
        // получение всех виджетов
        //

        return widgets;
    };
};
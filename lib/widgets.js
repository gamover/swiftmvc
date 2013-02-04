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

    _package = require('./utils/package'),

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
     * @param callback
     *
     * @returns {*}
     */
    self.load = function (callback)
    {
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

                        var widgetName = path + _path.basename(filename, '.js');

                        new Widget()
                            .setApp(app)
                            .setName(widgetName)
                            .setPathToWidget(pathToDir + '/' + filename)
                            .create(function (err, widget)
                            {
                                if (err)
                                {
                                    err.push('Во время загрузки виджетов произошли ошибки');
                                    console.log(err.join('\n') + '\n');

                                    if (typeof callback === 'function')
                                    {
                                        callback(err);
                                    }

                                    return;
                                }

                                widgets[widgetName] = widget;
                            })
                        ;
                    }
                });
            })(pathToWidgets);
        }

        return self;
    };

    /**
     * Получение виджета
     *
     * @param path путь к виджету
     * @param callback
     *
     * @return {*}
     */
    self.get = function (path, callback)
    {
        if (typeof path === 'function')
        {
            callback = path;
            path = undefined;
        }

        //
        // получение указанного модуля
        //

        if (path !== undefined)
        {
            if (widgets[path] === undefined)
            {
                var messages = ['Не удалось получить виджет. Виджет "' + path + '" не найден.'];
                console.log(messages.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(messages);
                }

                return;
            }

            if (typeof callback === 'function')
            {
                callback(undefined, widgets[path]);
            }

            return widgets[path];
        }

        //
        // получение всех виджетов
        //

        if (typeof callback === 'function')
        {
            callback(undefined, widgets);
        }

        return widgets;
    };
};
/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 01.02.13
 * Time: 12:58
 */

var __widget = module.exports = exports,

    _fs = require('fs'),
    _path = require('path');

__widget.Widget = function ()
{
    var self = this,

        app,
        router,

        widgetName = 'swiftWidget',
        pathToWidget,
        pathToViews,

        widget;

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
     * Задание имени виджета
     *
     * @param name
     *
     * @returns {*}
     */
    self.setName = function (name)
    {
        widgetName = name;

        return self;
    };

    /**
     * Получение имени виджета
     *
     * @returns {*}
     */
    self.getName = function ()
    {
        return widgetName;
    };

    /**
     * Задание пути к виджету
     *
     * @param path
     */
    self.setPathToWidget = function (path)
    {
        pathToWidget = path;
        pathToViews = pathToViews || _path.dirname(pathToWidget) + '/view';

        return self;
    };

    /**
     * Получение пути к виджету
     *
     * @returns {*}
     */
    self.getPathToWidget = function ()
    {
        return pathToWidget;
    };

    /**
     * Задание пути к директории видов
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToViews = function (path)
    {
        pathToViews = path;

        return self;
    };

    /**
     * Получение пути к директории видов
     *
     * @return {*}
     */
    self.getPathToViews = function ()
    {
        return pathToViews;
    };

    /**
     * Создание виджета
     *
     * @param callback
     *
     * @returns {*}
     */
    self.create = function (callback)
    {
        setTimeout(function ()
        {
            if (!_path.existsSync(pathToWidget) || !_fs.lstatSync(pathToWidget).isFile() || _path.extname(pathToWidget) !== '.js')
            {
                console.log('Не удалось создать виджет "' + widgetName + '". Виджет не найден.');

                if (typeof callback === 'function')
                {
                    callback(err);
                }

                return self;
            }

            widget = require(pathToWidget);

            if (typeof callback === 'function')
            {
                callback(null, self);
            }
        }, 0);

        return self;
    };

    self.init = function ()
    {
        widget.init.call(self);
    };

    self.run = function ()
    {
        widget.init.call(self);
    };

    self.render = function (viewName, params, callback)
    {
        viewName = viewName || 'index';
        params = params || {};

        app.render(pathToViews + '/' + viewName, params, function (err_, html)
        {
            if (err)
            {
                var err = ['При отрисовке вида "' + pathToViews + '/' + viewName + '" произошли ошибки', err_];
                console.log(err.join('\n') + '\n');

                callback(err);

                return;
            }

            callback(undefined, html);
        });

        return self;
    };
};
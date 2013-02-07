/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 10:49
 */

var __module = module.exports = exports,

    _path = require('path'),
    _package = require('./utils/package'),

    Widgets = require('./widgets').Widgets;

__module.Module = function ()
{
    var self = this,

        app,
        router,

        moduleName = 'swiftModule',
        pathToModule,
        pathToModels,
        pathToViews,
        pathToControllers,
        pathToWidgets,

        controllers,
        models,
        widgets;

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
     * Задание названия модуля
     *
     * @param name_
     *
     * @returns {*}
     */
    self.setName = function (name_)
    {
        moduleName = name_;

        return self;
    };

    /**
     * Получение названия модуля
     *
     * @returns {*}
     */
    self.getName = function ()
    {
        return moduleName;
    };

    /**
     * Задание пути к модулю
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToModule = function (path)
    {
        pathToModule = path;
        pathToModels = pathToModels || pathToModule + '/model';
        pathToViews = pathToViews || pathToModule + '/view';
        pathToControllers = pathToControllers || pathToModule + '/controller';
        pathToWidgets = pathToWidgets || pathToModule + '/widgets';

        return self;
    };

    /**
     * Получение пути к директории модуля
     *
     * @return {*}
     */
    self.getPathToModule = function ()
    {
        return pathToModule;
    };

    /**
     * Задание пути к моделям
     *
     * @param path
     * @returns {*}
     */
    self.setPathToModels = function (path)
    {
        pathToModels = path;

        return self;
    };

    /**
     * Получение пути к директории моделей
     *
     * @return {*}
     */
    self.getPathToModels = function ()
    {
        return pathToModels;
    };

    /**
     * Задание пути к видам
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToViews = function(path)
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
     * Задание пути к контроллерам
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToControllers = function (path)
    {
        pathToControllers = path;

        return self;
    };

    /**
     * Получение пути к директории контроллеров
     *
     * @return {*}
     */
    self.getPathToControllers = function ()
    {
        return pathToControllers;
    };

    /**
     * Задание пути к виджетам
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
     * Получение пути к директории видждетов
     *
     * @returns {*}
     */
    self.getPathToWidgets = function ()
    {
        return pathToWidgets;
    };

    /**
     * Инициализация модуля
     *
     * @param callback
     *
     * @returns {*}
     */
    self.init = function (callback)
    {
        var loadingModels = 0,
            loadingControllers = 0,
            loadingWidgets = 0;

        //
        // загрузка моделей
        //

        if (_path.existsSync(pathToModels))
        {
            loadingModels++;

            setTimeout(function ()
            {
                models = _package.requireDirR(pathToModels);

                loadingModels--;
            }, 0);
        }

        //
        // загрузка контроллеров
        //

        if (_path.existsSync(pathToControllers))
        {
            loadingControllers++;

            setTimeout(function ()
            {
                controllers = _package.requireDirR(pathToControllers);

                loadingControllers--;
            }, 0);
        }

        //
        // загрузка виджетов
        //

        loadingWidgets++;

        widgets = new Widgets();
        widgets
            .setApp(app)
            .setPathToWidgets(pathToWidgets)
            .load(function (err, widgets) { loadingWidgets--; })
        ;

        (function loop ()
        {
            setTimeout(function ()
            {
                if (loadingModels || loadingControllers || loadingWidgets) return loop();

                if (typeof callback === 'function')
                {
                    callback(null, self);
                }
            }, 0);
        })();

        return self;
    };

    /**
     * Получене всех моделей
     *
     * @return {{}}
     */
    self.getModels = function ()
    {
        if (models) return models.get();
    };

    /**
     * Получение модели
     *
     * @param path путь к модели
     *
     * @return {*}
     */
    self.getModel = function (path)
    {
        if (models && path) return models.get(path);
    };

    /**
     * Получение всех контроллеров
     *
     * @return {{}}
     */
    self.getControllers = function ()
    {
        if (controllers) return controllers.get();
    };

    /**
     * Получение контроллера
     *
     * @param path путь к контроллеру
     *
     * @return {*}
     */
    self.getController = function (path)
    {
        if (controllers && path) return controllers.get(path);
    };

    /**
     * Получение всех виджетов
     *
     * @returns {*}
     */
    self.getWidgets = function()
    {
        if (widgets) return widgets.get();
    };

    /**
     * Получение виджета
     *
     * @param path путь к виджету
     *
     * @returns {*}
     */
    self.getWidget = function(path)
    {
        if (widgets && path) return widgets.get(path);
    };

    /**
     * Подключение ресурса из директории модуля
     *
     * @param path путь к ресурсу
     * @param params параметры
     *
     * @return {*}
     */
    self.require = function (path, params)
    {
        //
        // парсинг токенов
        //

        if (path.indexOf(':model') === 0)
        {
            path = path.replace(':model', pathToModels);
        }
        else if (path.indexOf(':view') === 0)
        {
            path = path.replace(':view', pathToViews);
        }
        else if (path.indexOf(':controller') === 0)
        {
            path = path.replace(':controller', pathToControllers);
        }
        else if (path.indexOf(':widgets') === 0)
        {
            path = path.replace(':widgets', pathToWidgets);
        }
        else
        {
            path = pathToModule + '/' + path;
        }

        //
        // подключение ресурса
        //

        return _package.require(path, params);
    };
};
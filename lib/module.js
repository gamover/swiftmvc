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

        controllers = {},
        models = {},
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
        //
        // загрузка моделей
        //

        if (_path.existsSync(pathToModels))
        {
            _package.requireDirR(pathToModels, {}, function (err, models_)
            {
                if (err)
                {
                    err.push('Загрузка моделей модуля "' + moduleName + '" произошла с ошибками');
                    console.log(err.join('\n') + '\n');

                    if (typeof callback === 'function')
                    {
                        callback(err);
                    }
                }

                models = models_;
            });
        }

        //
        // загрузка контроллеров
        //

        if (_path.existsSync(pathToControllers))
        {
            _package.requireDirR(pathToControllers, {}, function (err, controllers_)
            {
                if (err)
                {
                    err.push('Загрузка контроллеров модуля "' + moduleName + '" произошла с ошибками');
                    console.log(err.join('\n') + '\n');

                    if (typeof callback === 'function')
                    {
                        callback(err);
                    }
                }

                controllers = controllers_;
            });
        }

        //
        // загрузка виджетов
        //

        widgets = new Widgets();
        widgets.req = self.req;
        widgets.res = self.res;
        widgets
            .setApp(app)
            .setPathToWidgets(pathToWidgets)
            .load(function (err)
            {
                err.push('Во время загрузки виджетов модуля "' + moduleName + '" возникли ошибки');
                console.log(err.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(err);
                }
            })
        ;

        //
        ////
        //

        if (typeof callback === 'function')
        {
            callback(undefined, self);
        }

        return self;
    };



    /**
     * Получене всех моделей
     *
     * @return {{}}
     */
    self.getModels = function ()
    {
        return models.get();
    };

    /**
     * Получение модели
     *
     * @param path путь к модели
     * @param callback
     *
     * @return {*}
     */
    self.getModel = function (path, callback)
    {
        return models.get(path, function (err, model)
        {
            if (err)
            {
                err.push('Не удалось получить модель "' + path + '". Модель не найдена.');
                console.log(err.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(err);
                }

                return;
            }

            if (typeof callback === 'function')
            {
                callback(undefined, model);
            }
        });
    };

    /**
     * Получение всех контроллеров
     *
     * @return {{}}
     */
    self.getControllers = function ()
    {
        return controllers.get();
    };

    /**
     * Получение контроллера
     *
     * @param path путь к контроллеру
     * @param callback
     *
     * @return {*}
     */
    self.getController = function (path, callback)
    {
        return controllers.get(path, function (err, controller)
        {
            if (err)
            {
                err.push('Не удалось получить контроллер "' + path + '". Контроллер не найден.');
                console.log(err.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(err);
                }

                return;
            }

            if (typeof callback === 'function')
            {
                callback(undefined, controller);
            }
        });
    };

    /**
     * Получение всех виджетов
     *
     * @returns {*}
     */
    self.getWidgets = function()
    {
        return widgets.get();
    };

    /**
     * Получение виджета
     *
     * @param path путь к виджету
     * @param callback
     *
     * @returns {*}
     */
    self.getWidget = function(path, callback)
    {
        return widgets.get(path || '', function (err, widget)
        {
            if (err)
            {
                err.push('Не удалось получить виджет "' + path + '". Виджет не найден.');
                console.log(err.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(err);
                }

                return;
            }

            if (typeof callback === 'function')
            {
                callback(undefined, widget);
            }
        });
    };
};
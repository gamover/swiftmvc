/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 28.01.13
 * Time: 10:49
 */

var _package = require('./utils/package');

var __module = module.exports = exports;

__module.Module = function (name)
{
    name = name || 'swiftModule';

    var self = this,

        router,
        pathToModule,
        pathToModels,
        pathToViews,
        pathToControllers,

        controllers = {},
        models = {};

    /**
     * Инициализация модуля
     *
     * @param pathToModule_
     * @param callback
     *
     * @returns {*}
     */
    self.init = function (pathToModule_, callback)
    {
        pathToModule = pathToModule_;
        pathToModels = pathToModule + '/model';
        pathToViews = pathToModule + '/view';
        pathToControllers = pathToModule + '/controller';

        //
        // загрузка моделей
        //

        _package.requireDirR(pathToModels, {}, function (err, models_)
        {
            if (err)
            {
                err.push('Не удалось загрузить модели "' + pathToModels + '"');
                console.log(err.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(err);
                }

                return;
            }

            models = models_;

            //
            // загрузка контроллеров
            //

            _package.requireDirR(pathToControllers, {}, function (err, controllers_)
            {
                if (err)
                {
                    err.push('Не удалось загрузить контроллеры "' + pathToModels + '"');
                    console.log(err.join('\n') + '\n');

                    if (typeof callback === 'function')
                    {
                        callback(err);
                    }

                    return;
                }

                controllers = controllers_;
            });
        });

        if (typeof callback === 'function')
        {
            callback(undefined, self);
        }

        return self;
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
        name = name_;

        return self;
    };

    /**
     * Получение названия модуля
     *
     * @returns {*}
     */
    self.getName = function ()
    {
        return name;
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
     * Получение пути к директории моделей
     *
     * @return {*}
     */
    self.getPathToModels = function ()
    {
        return pathToModels;
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
     * Получение пути к директории контроллеров
     *
     * @return {*}
     */
    self.getPathToControllers = function ()
    {
        return pathToControllers;
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
     * Отрисовка вида
     *
     * @param viewName
     * @param params
     */
    self.render = function (viewName, params)
    {
        viewName = viewName || 'index';
        params = params || {};

        router.res.render(pathToViews + '/' + viewName, params);

        return self;
    };
};
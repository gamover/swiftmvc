/**
 * Author: G@mOBEP
 * Date: 07.02.13
 * Time: 21:08
 *
 * Пакет описывающий модель фреймворка Swift.
 * У модели может быть несколько состояний (status):
 *  - awaiting - ожидание инициализации
 *  - init - выполняется инициализация
 *  - error - во время инициализации модели возникли ошибки и она не может быть использована
 *  - success - модель успешно прошла инициализацию и может быть использована
 */

var __model = module.exports = exports,

    _fs = require('fs'),
    _path = require('path'),

    countModels = 0;

__model.Model = function ()
{
    countModels++;

    var self = this,

        status = 'awaiting',
        modelName = 'SwiftModel' + countModels,
        pathToModel,

        model;

    /**
     * Задание состояния модели
     *
     * @returns {string}
     */
    self.getStatus = function ()
    {
        return status;
    };

    /**
     * Задание названия модели
     *
     * @param name
     *
     * @returns {*}
     */
    self.setName = function (name)
    {
        modelName = name;

        return self;
    };

    /**
     * Получение названия модели
     *
     * @returns {string}
     */
    self.getName = function ()
    {
        return modelName;
    };

    /**
     * Задание пути к модели
     *
     * @param path
     *
     * @returns {*}
     */
    self.setPathToModel = function (path)
    {
        pathToModel = _path.normalize(path);

        return self;
    };

    /**
     * Получение пути к модели
     *
     * @returns {*}
     */
    self.getPathToModel = function ()
    {
        return pathToModel;
    };

    /**
     * Инициализация модели
     *
     * @param callback
     *
     * @returns {*}
     */
    self.init = function (callback)
    {
        status = 'init';

        //
        // проверка задан ли путь к модели
        //

        if (!pathToModel)
        {
            status = 'error';
            callback('Ошибка инициализации модели. Не задан путь к модели.');
            return self;
        }

        //
        // проверка существования файла модели по указанному пути
        //

        _path.exists(pathToModel, function (exists)
        {
            if (!exists)
            {
                status = 'error';
                callback('Ошибка инициализации модели. Не задан путь к модели.', self);
                return;
            }

            checkFile();
        });

        //
        // проверка, является ли конечная точка пути файлом
        //

        function checkFile ()
        {
            _fs.stat(pathToModel, function (err, stats) {
                if (err)
                {
                    status = 'error';
                    callback('Ошибка инициализации модели. Системная ошибка.', self);
                    return;
                }

                if (!stats.isFile())
                {
                    status = 'error';
                    callback('Ошибка инициализации модели. Конечная точка пути к модели не является файлом.', self);
                    return;
                }

                checkExtname();
            });
        }

        //
        // проверка расширения файла модели
        //

        function checkExtname ()
        {
            if (_path.extname(pathToModel) !== '.js')
            {
                status = 'error';
                callback('Ошибка инициализации модели. Недопустимое расширение файла модели.', self);
                return;
            }

            loadModel();
        }

        //
        // загрузка модели
        //

        function loadModel ()
        {
            model = require(pathToModel);
            status = 'success';
            callback(null, self);
        }

        //
        ////
        //

        return self;
    };

    /**
     * Получение модели
     *
     * @returns {*}
     */
    self.getModel = function ()
    {
        return model;
    };
};

/**
 * Получение кол-ва созданных моделей
 *
 * @returns {number}
 */
__model.getCountModels = function ()
{
    return countModels;
};
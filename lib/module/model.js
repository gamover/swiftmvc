/**
 * Author: G@mOBEP
 * Date: 07.02.13
 * Time: 21:08
 *
 * Пакет описывающий модель фреймворка Swift.
 *
 * У модели могут быть следующие состояния (status):
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

        pack;

    /**
     * Получение состояния модели
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
    {callback = callback || function () {};

        status = 'init';

        //
        // проверка задан ли путь к модели
        //

        if (!pathToModel)
        {
            status = 'error';
            callback(['не задан путь к пакету модели']);
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
                callback(['пакет модели не найден по указанному пути (' + pathToModel + ')']);
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
                    callback(['системная ошибка']);
                    return;
                }

                if (!stats.isFile())
                {
                    status = 'error';
                    callback(['не удалось подключить пакет модели']);
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
                callback(['пакет модели имеет недопустимый формат']);
                return;
            }

            loadModel();
        }

        //
        // загрузка модели
        //

        function loadModel ()
        {
            pack = require(pathToModel);
            status = 'success';
            callback(null, self);
        }

        //
        ////
        //

        return self;
    };

    /**
     * Получение пакета модели
     *
     * @returns {*}
     */
    self.getPackage = function ()
    {
        return pack;
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
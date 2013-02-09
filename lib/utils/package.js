/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 10:43
 */

var __package = module.exports = exports,

    _fs = require('fs'),
    _path = require('path');

/**
 * Подключение ресурса
 *
 * @param pathToSource путь к ресурсу
 * @param params параметры {
 *     asGetter (
 *         true     - подключение через геттер
 *         false    - подключение напрямую
 *     )
 * }
 *
 * @return {*}
 */
__package.require = function (pathToSource, params)
{
    //
    // обработка входных параметров
    //

    pathToSource = _path.resolve(pathToSource);
    params = params || {};

    //
    // проверка на существование ресурса
    //

    if (!_path.existsSync(pathToSource))
    {
        pathToSource += '.js';
        if (!_path.existsSync(pathToSource) || !_fs.lstatSync(pathToSource).isFile())
        {
            console.log('Не удалось подключить ресурс "' + pathToSource + '". Ресурс не найден.');

            return;
        }
    }

    //
    // подключение ресурса
    //

    if (_fs.lstatSync(pathToSource).isDirectory())
    {
        return __package.requireDirR(pathToSource, params);
    }

    return require(pathToSource);
};

/**
 * Подключение пакетов из директории
 *
 * @param pathToDir путь к директории
 *
 * @return {*}
 */
__package.requireDir = function (pathToDir)
{
    //
    // обработка входных параметров
    //

    pathToDir = _path.resolve(pathToDir);

    //
    // проверка на существование директории
    //

    if (!_path.existsSync(pathToDir))
    {
        console.log('Не удалось подключить пакеты из директории "' + pathToDir + '". Директория не найдена.');

        return;
    }

    //
    // подключение модулей
    //

    var pkgs = {};

    _fs.readdirSync(pathToDir).forEach(function (filename)
    {
        if (_path.extname(filename) !== '.js')
        {
            return;
        }

        var name = _path.basename(filename, '.js');

        pkgs[name] = require(pathToDir + '/' + name);
    });

    var pkg = {};
    pkg.get = function (path)
    {
        //
        // получение указанного пакета
        //

        if (path !== undefined)
        {
            if (pkgs[path] === undefined) console.log('Не удалось получить пакет "' + path + '". Пакет не найден.');

            return pkgs[path];
        }

        //
        // получение всех пакетов
        //

        return pkgs;
    };

    return pkg;
};

/**
 * Рекурсивное подключение пакетов из директории
 *
 * @param pathToDir путь к директории
 * @param params параметры
 *
 * @return {*}
 */
__package.requireDirR = function (pathToDir, params)
{
    //
    // обработка входных параметров
    //

    pathToDir = _path.resolve(pathToDir);
    params = params || {};

    if (params.exclude)
    {
        var exclude = {};
        params.exclude.replace(' ', '').split(',').map(function(name)
        {
            exclude[name] = name;
        });
        params.exclude = exclude;
    }
    else
    {
        params.exclude = {};
    }

    //
    // проверка на существование директории
    //

    if (!_path.existsSync(pathToDir) || !_fs.lstatSync(pathToDir).isDirectory())
    {
        console.log('Не удалось подключить пакеты из директории "' + pathToDir + '". Директория не найдена.');

        return;
    }

    //
    // рекурсивное подключение модулей
    //

    var pkgs = (function bypass (pathToDir, pkgs, path)
    {
        pkgs = pkgs || {};
        path = path ? path + '/' : '';

        _fs.readdirSync(pathToDir).forEach(function (filename)
        {
            if (!(filename in params.exclude))
            {
                if (_fs.lstatSync(pathToDir + '/' + filename).isDirectory())
                {
                    bypass(pathToDir + '/' + filename, pkgs, path + filename);
                }
                else
                {
                    if (_path.extname(filename) !== '.js')
                    {
                        return;
                    }

                    var name = _path.basename(filename, '.js');

                    pkgs[path + name] = require(pathToDir + '/' + name);
                }
            }
        });

        return pkgs;
    })(pathToDir);

    var pkg = {};
    pkg.get = function (path)
    {
        //
        // получение указанного пакета
        //

        if (path !== undefined)
        {
            if (pkgs[path] === undefined) console.log('Не удалось получить пакет "' + path + '". Пакет не найден.');

            return pkgs[path];
        }

        //
        // получение всех пакетов
        //

        return pkgs;
    };

    return pkg;
};
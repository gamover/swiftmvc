/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 10:43
 */

var _fs = require('fs'),
    _path = require('path');

var __package = module.exports = exports;

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
 * @param callback
 *
 * @return {*}
 */
__package.require = function (pathToSource, params, callback)
{
    //
    // обработка входных параметров
    //

    pathToSource = _path.resolve(pathToSource);

    if (typeof params === 'function')
    {
        callback = params;
        params = {};
    }
    else
    {
        params = params || {};
    }

    //
    // задание параметров по умолчанию
    //

    params.asGetter = params.asGetter || false;

    //
    // проверка на существование ресурса
    //

    if (!_path.existsSync(pathToSource))
    {
        pathToSource += '.js';
        if (!_path.existsSync(pathToSource) || !_fs.lstatSync(pathToSource).isFile())
        {
            var messages = ['Не удалось подключить ресурс "' + pathToSource + '". Ресурс не найден.'];
            console.log(messages.join('\n') + '\n');

            if (typeof callback === 'function')
            {
                callback(messages);
            }

            return undefined;
        }
    }

    //
    // подключение ресурса
    //

    if (_fs.lstatSync(pathToSource).isDirectory())
    {
        return __package.requireDirR(pathToSource, params, callback);
    }

    if (params.asGetter)
    {
        var source = {};
        source.__defineGetter__(_path.basename(pathToSource, '.js'), function ()
        {
            return require(pathToSource);
        });

        return source;
    }

    var source = require(pathToSource);

    if (typeof callback === 'function')
    {
        callback(undefined, source);
    }

    return source;
};

/**
 * Подключение пакетов из директории
 *
 * @param pathToDir путь к директории
 * @param params параметры
 * @param callback
 *
 * @return {*}
 */
__package.requireDir = function (pathToDir, params, callback)
{
    //
    // обработка входных параметров
    //

    pathToDir = _path.resolve(pathToDir);

    if (typeof params === 'function')
    {
        callback = params;
        params = {};
    }
    else
    {
        params = params || {};
    }

    //
    // проверка на существование директории
    //

    if (!_path.existsSync(pathToDir))
    {
        var messages = ['Не удалось подключить пакеты из директории "' + pathToDir + '". Директория не найдена.'];
        console.log(messages.join('\n') + '\n');

        if (typeof callback === 'function')
        {
            callback(messages);
        }

        return undefined;
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

        pkgs.__defineGetter__(name, function ()
        {
            return require(pathToDir + '/' + name);
        });
    });

    var pkg = {};
    pkg.get = function (name, callback)
    {
        if (typeof name === 'function')
        {
            callback = name;
            name = undefined;
        }

        //
        // получение указанного пакета
        //

        if (name !== undefined)
        {
            if (pkgs[name] === undefined)
            {
                var messages = ['Не удалось получить пакет "' + name + '". Пакет не найден.'];
                console.log(messages.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(messages);
                }

                return undefined;
            }

            if (typeof callback === 'function')
            {
                callback(undefined, pkgs[name]);
            }

            return pkgs[name];
        }

        //
        // получение всех пакетов
        //

        return pkgs;
    };

    if (typeof callback === 'function')
    {
        callback(undefined, pkg);
    }

    return pkg;
};

/**
 * Рекурсивное подключение пакетов из директории
 *
 * @param pathToDir путь к директории
 * @param params параметры
 * @param callback
 *
 * @return {*}
 */
__package.requireDirR = function (pathToDir, params, callback)
{
    //
    // обработка входных параметров
    //

    pathToDir = _path.resolve(pathToDir);

    if (typeof params === 'function')
    {
        callback = params;
        params = {};
    }
    else
    {
        params = params || {};
    }

    if (params.exclude)
    {
        var exclude = {};
        params.exclude.replace(' ', '').split(',').map(function(name)
        {
            exclude[name] = name;
        });
        params.exclude = exclude;
    }
    params.exclude = params.exclude || {};

    //
    // проверка на существование директории
    //

    if (!_path.existsSync(pathToDir) || !_fs.lstatSync(pathToDir).isDirectory())
    {
        var messages = ['Не удалось подключить пакеты из директории "' + pathToDir + '". Директория не найдена.'];
        console.log(messages.join('\n') + '\n');

        if (typeof callback === 'function')
        {
            callback(messages);
        }

        return undefined;
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

                    pkgs.__defineGetter__(path + name, function ()
                    {
                        return require(pathToDir + '/' + name);
                    });
                }
            }
        });

        return pkgs;
    })(pathToDir);

    var pkg = {};
    pkg.get = function (path, callback)
    {
        if (typeof path === 'function')
        {
            callback = path;
            path = undefined;
        }

        //
        // получение указанного пакета
        //

        if (path !== undefined)
        {
            if (pkgs[path] === undefined)
            {
                var messages = ['Не удалось получить пакет "' + path + '". Пакет не найден.'];
                console.log(messages.join('\n') + '\n');

                if (typeof callback === 'function')
                {
                    callback(messages);
                }

                return undefined;
            }

            if (typeof callback === 'function')
            {
                callback(undefined, pkgs[path]);
            }

            return pkgs[path];
        }

        //
        // получение всех пакетов
        //

        if (typeof callback === 'function')
        {
            callback(undefined, pkgs);
        }

        return pkgs;
    };

    if (typeof callback === 'function')
    {
        callback(undefined, pkg);
    }

    return pkg;
};
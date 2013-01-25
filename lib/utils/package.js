/**
 * Created by G@mOBEP
 *
 * Company: Realweb
 * Date: 27.12.12
 * Time: 10:43
 */

var _fs = require('fs'),
    _path = require('path'),
    _callback = require('./callback');

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
        callback = _callback(callback);
    }

    //
    // задание параметров по умолчанию
    //

    params.asGetter = params.asGetter || false;

    //
    // проверка на существование ресурса
    //

    if (!_fs.existsSync(pathToSource))
    {
        pathToSource += '.js';
        if (!_fs.existsSync(pathToSource) || !_fs.lstatSync(pathToSource).isFile())
        {
            var messages = ['Не удалось подключить ресурс "' + pathToSource + '". Ресурс не найден.'];
            console.log(messages.join('\n') + '\n');

            callback({
                status: 'error',
                messages: messages
            });

            return undefined;
        }
    }

    //
    // подключение ресурса
    //

    if (_fs.lstatSync(pathToSource).isDirectory())
    {
        return __package.requireDir(pathToSource, params, callback);
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

    return require(pathToSource)
};

/**
 * Подключение пакетов из директории
 *
 * @param pathToDir путь к директории
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
        callback = _callback(callback);
    }

    //
    // проверка на существование директории
    //

    if (!_fs.existsSync(pathToDir))
    {
        var messages = ['Не удалось подключить пакеты из директории "' + pathToDir + '". Директория не найдена.'];
        console.log(messages.join('\n') + '\n');

        callback({
            status: 'error',
            messages: messages
        });

        return undefined;
    }

    //
    // задание параметров по умолчанию
    //

    params.asGetter = params.asGetter || false;

    //
    // подключение модулей
    //

    var packs = {};

    _fs.readdirSync(pathToDir).forEach(function (filename)
    {
        if (_path.extname(filename) !== '.js')
        {
            return;
        }

        var name = _path.basename(filename, '.js');

        if (params.asGetter)
        {
            packs.__defineGetter__(name, function ()
            {
                return require(pathToDir + '/' + name);
            });
        }
        else
        {
            packs[name] = require(pathToDir + '/' + name);
        }
    });

    callback({
        status: 'success',
        data: packs
    });

    return packs;
};

/**
 * Рекурсивное подключение пакетов из директории
 *
 * @param pathToDir путь к директории
 * @param params параметры {
 *     asGetter (
 *         true     - подключение через геттер
 *         false    - подключение напрямую
 *     ),
 *     flat (
 *         true     - плоская структура возвращаемого объекта ({folder.subfolder.package: source})
 *         false    - иерархическая структура возвращаемого объекта ({folder: {subfolder: {package: source}}})
 *     )
 * }
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
        callback = _callback(callback);
    }

    //
    // проверка на существование директории
    //

    if (!_fs.existsSync(pathToDir) || !_fs.lstatSync(pathToDir).isDirectory())
    {
        var messages = ['Не удалось подключить пакеты из директории "' + pathToDir + '". Директория не найдена.'];
        console.log(messages.join('\n') + '\n');

        callback({
            status: 'error',
            messages: messages
        });

        return undefined;
    }

    //
    // задание параметров по умолчанию
    //

    params.asGetter = params.asGetter || false;
    params.flat = params.flat || false;

    //
    // рекурсивное подключение модулей
    //

    var packs = (function bypass (pathToDir, packs, alias)
    {
        packs = packs || {};

        if (params.flat)
        {
            alias = alias ? alias + '.' : '';
        }
        else
        {
            alias = '';
        }

        _fs.readdirSync(pathToDir).forEach(function (filename)
        {
            if (_fs.lstatSync(pathToDir + '/' + filename).isDirectory())
            {
                if (!params.flat)
                {
                    var obj = bypass(pathToDir + '/' + filename, {}, filename);
                    if (params.asGetter)
                    {
                        packs.__defineGetter__(filename, function ()
                        {
                            return obj;
                        });

                        return;
                    }

                    packs[filename] = obj;
                }
                else
                {
                    bypass(pathToDir + '/' + filename, packs, alias + filename);
                }
            }
            else
            {
                if (_path.extname(filename) !== '.js')
                {
                    return;
                }

                var name = _path.basename(filename, '.js');

                if (params.asGetter)
                {
                    packs.__defineGetter__(alias + name, function ()
                    {
                        return require(pathToDir + '/' + name);
                    });
                }
                else
                {
                    packs[alias + name] = require(pathToDir + '/' + name);
                }
            }
        });

        return packs;
    })(pathToDir);

    callback({
        status: 'success',
        data: packs
    });

    return packs;
};
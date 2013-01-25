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

var __jsmodule = module.exports = exports;

/**
 * Подключение модулей из директории
 *
 * @param pathToDir путь к директории
 * @param params параметры
 * @param callback
 *
 * @return {*}
 */
__jsmodule.requireDir = function (pathToDir, params, callback)
{
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
    // задание параметров по умолчанию
    //

    params.asGetter = params.asGetter || false;

    //
    // проверка на существование директории
    //

    if (!_path.existsSync(pathToDir))
    {
        var messages = ['Не удалось подключить модули из директории "' + pathToDir + '". Директория не найдена.'];
        console.log(messages.join('\n') + '\n');

        callback({
            status: 'error',
            messages: messages
        });

        return undefined;
    }

    var mods = {};

    //
    // подключение модулей
    //

    _fs.readdirSync(pathToDir).forEach(function (filename)
    {
        if (_path.extname(filename) !== '.js')
        {
            return;
        }

        var name = _path.basename(filename, '.js');

        if (params.asGetter)
        {
            mods.__defineGetter__(name, function ()
            {
                return require(pathToDir + '/' + name);
            });
        }
        else
        {
            mods[name] = require(pathToDir + '/' + name);
        }
    });

    callback({
        status: 'success',
        data: mods
    });

    return mods;
};

/**
 * Рекурсивное подключение модулей из директории
 *
 * @param pathToDir путь к директории
 * @param params параметры
 * @param callback
 *
 * @return {{}}
 */
__jsmodule.requireDirR = function (pathToDir, params, callback)
{callback = _callback(callback);

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
    params.flat = params.flat || false;

    var mods = bypass(pathToDir);

    ///
    // рекурсивное подключение модулей
    //
    function bypass (pathToDir, mods, alias)
    {
        mods = mods || {};

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
            if (_fs.statSync(pathToDir + '/' + filename).isDirectory())
            {
                if (!params.flat)
                {
                    var obj = bypass(pathToDir + '/' + filename, {}, filename);
                    if (params.asGetter)
                    {
                        mods.__defineGetter__(filename, function ()
                        {
                            return obj;
                        });

                        return;
                    }

                    mods[filename] = obj;
                }
                else
                {
                    bypass(pathToDir + '/' + filename, mods, alias + filename);
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
                    mods.__defineGetter__(alias + name, function ()
                    {
                        return require(pathToDir + '/' + name);
                    });
                }
                else
                {
                    mods[alias + name] = require(pathToDir + '/' + name);
                }
            }
        });

        return mods;
    }

    callback({
        status: 'success',
        data: mods
    });

    return mods;
};
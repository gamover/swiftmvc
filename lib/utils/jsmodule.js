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

exports.require = function (pathToFile, callback)
{
    pathToFile = _path.resolve(pathToFile);

    if (typeof asGetter === 'function')
    {
        callback = asGetter;
    }
    else
    {
        asGetter = !!asGetter;
        callback = _callback(callback);
    }

    if (_path.extname(_path.basename(pathToFile)) !== '.js')
    {
        pathToFile += '.js';
    }

    if (!_path.existsSync(pathToFile))
    {
        var messages = ['Не удалось подключить модуль. Модуль "' + pathToFile + '" не найден.'];
        console.log(messages.join('\n') + '\n');

        callback({
            status: 'error',
            messages: messages
        });

        return undefined;
    }

    var modul = require(pathToFile);

    callback({
        status: 'success',
        data: modul
    });

    return modul;
};

/**
 * Подключение модулей из директории
 *
 * @param pathToDir путь к директории
 * @param asGetter подключать как геттер
 * @param callback
 *
 * @return {*}
 */
exports.requireDirectory = function (pathToDir, asGetter, callback)
{
    pathToDir = _path.resolve(pathToDir);

    if (typeof asGetter === 'function')
    {
        callback = asGetter;
    }
    else
    {
        asGetter = !!asGetter;
        callback = _callback(callback);
    }

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

        if (asGetter)
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
 * @param asGetter подключать как геттер
 * @param callback
 *
 * @return {{}}
 */
exports.requireDirectoryR = function (pathToDir, asGetter, callback)
{callback = _callback(callback);

    var mods = bypass(pathToDir, undefined);

    function bypass (pathToDir, mods)
    {
        exports.requireDirectory(pathToDir, asGetter, function (result)
        {
            if (result.status === 'error')
            {
                callback(result);

                return;
            }

            mods = result.data;

            _fs.readdirSync(pathToDir).forEach(function (filename)
            {
                if (_fs.statSync(pathToDir + '/' + filename).isDirectory())
                {
                    var obj = bypass(pathToDir + '/' + filename, {});
                    mods.__defineGetter__(filename, function ()
                    {
                        return obj;
                    });
                }
            });
        });

        return mods;
    }

    return mods;
};